/**
 * @file route.ts
 * API Route — Analyse anti-arnaque
 */

import { NextRequest, NextResponse } from "next/server";
import {
  analyze,
  detectType,
  analyzeQuick,
  loadListsFromSupabase,
  getHistory,
  getReportedScams,
  getDatabaseStats,
  addToBlacklist,
  addToWhitelist,
  getBlacklist,
  getWhitelist,
  removeFromBlacklist,
  removeFromWhitelist,
  markAsReported,
  addReportedScam,
  exportDatabase,
  importDatabase,
  isAIConfigured,
  SanitizationError,
  addToHistory,
} from "@/lib/analyzer";
import type { AnalyzableType, AnalysisContextFields, AnalysisResult } from "@/lib/analyzer";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { isAdminRequest } from "@/lib/supabase/auth";
import { logAdminAction } from "@/lib/admin-audit";

async function saveToHistory(result: AnalysisResult): Promise<void> {
  await addToHistory(
    result.analysisId,
    result.inputType,
    result.inputValue,
    result.score,
    result.risk,
    result.scamTypes,
  );
}

type PostAction = "analyze" | "report" | "manage-list" | "import";

interface AnalyzeBody {
  action?: PostAction;
  type?: AnalyzableType;
  value: string;
  context?: string;
  quick?: boolean;
  contextFields?: AnalysisContextFields;
  emailLinks?: string[];
}

interface ReportBody {
  action: "report";
  analysisId: string;
  details?: string;
}

interface ManageListBody {
  action: "manage-list";
  list: "blacklist" | "whitelist";
  value: string;
  type?: AnalyzableType;
  reason?: string;
  manageAction: "add" | "remove";
}

interface ImportBody {
  action: "import";
  data: string;
}

type PostBody = AnalyzeBody | ReportBody | ManageListBody | ImportBody;

const VALID_TYPES: AnalyzableType[] = ["url", "email", "message", "phone", "text"];
const MAX_ANALYZED_LINKS = 10;

// Actions POST réservées aux admins
const ADMIN_POST_ACTIONS = new Set<PostAction>(["manage-list", "import"]);

// Actions GET réservées aux admins
const ADMIN_GET_ACTIONS = new Set(["history", "reported", "blacklist", "whitelist", "export"]);

function ok<T>(data: T, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: true, data, ...extra });
}

function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Extrait les URLs valides d'un texte de contexte. */
function extractLinksFromContext(context: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  return (context.match(urlRegex) ?? [])
    .map((link) => link.replace(/[.,;:!?)]+$/, ""))
    .filter((link) => link.length > 0);
}

/** Analyse tous les liens d'un contexte et retourne les résultats. */
async function analyzeContextLinks(links: string[]): Promise<AnalysisResult[]> {
  const results = await Promise.allSettled(
    links.map((link) => analyze({ type: "url", value: link }))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<AnalysisResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

const RISK_LEVELS: Record<number, "safe" | "low" | "suspicious" | "dangerous" | "critical"> = {
  0: "safe", 10: "safe", 20: "low", 30: "suspicious", 40: "suspicious",
  50: "suspicious", 60: "dangerous", 70: "dangerous", 80: "critical", 90: "critical", 100: "critical",
};

function scoreToRisk(score: number): "safe" | "low" | "suspicious" | "dangerous" | "critical" {
  return RISK_LEVELS[Math.round(score / 10) * 10] ?? "suspicious";
}

/** Fusionne le résultat principal avec les liens suspects trouvés. */
function mergeWithSuspiciousLinks(
  result: AnalysisResult,
  suspiciousLinks: AnalysisResult[],
  allLinkResults?: AnalysisResult[],
): AnalysisResult & { linkAnalysis: { url: string; risk: string; scamTypes: readonly string[]; recommendation: string }[] } {
  const allScamTypes = new Set([...result.scamTypes, ...suspiciousLinks.flatMap((r) => r.scamTypes)]);
  const maxLinkScore = Math.max(...suspiciousLinks.map((r) => r.score), 0);
  const adjustedScore = Math.max(result.score, maxLinkScore);

  const linksToDisplay = allLinkResults ?? suspiciousLinks;

  return {
    ...result,
    score: adjustedScore,
    risk: scoreToRisk(adjustedScore),
    scamTypes: [...allScamTypes],
    triggers: [
      ...result.triggers,
      ...suspiciousLinks.map((r) => `⚠️ Lien suspect détecté: ${r.inputValue}`),
    ],
    linkAnalysis: linksToDisplay.map((r) => ({
      url: r.inputValue,
      risk: r.risk,
      scamTypes: r.scamTypes,
      recommendation: r.recommendation,
    })),
  };
}

async function handleAnalyze(body: AnalyzeBody) {
  if (!body.value) return err("Le champ 'value' est requis");
  if (body.value.length > 10_000) return err("Le contenu ne doit pas dépasser 10 000 caractères");
  if (body.context && body.context.length > 50_000) return err("Le contexte ne doit pas dépasser 50 000 caractères");

  const type = body.type ?? detectType(body.value);
  if (!VALID_TYPES.includes(type)) {
    return err(`Type invalide. Types acceptés : ${VALID_TYPES.join(", ")}`);
  }

  if (body.quick) {
    return ok(analyzeQuick(body.value, type), { quick: true });
  }

  const hasContextFields =
    body.contextFields &&
    Object.values(body.contextFields).some((v) => v?.trim());

  let result: AnalysisResult;
  try {
    result = await analyze({
      type,
      value: body.value,
      context: body.context,
      contextFields: hasContextFields ? body.contextFields : undefined,
    });
  } catch (error) {
    if (error instanceof SanitizationError) return err(error.message);
    throw error;
  }

  const explicitLinks: string[] = (body.emailLinks ?? []).filter(Boolean);

  const contextLinks: string[] = body.context
    ? extractLinksFromContext(body.context)
    : [];

  const explicitSet = new Set(explicitLinks);
  // Limité à MAX_ANALYZED_LINKS pour éviter le DoS par masse d'URLs
  const allLinks = [
    ...explicitLinks,
    ...contextLinks.filter(l => !explicitSet.has(l)),
  ].slice(0, MAX_ANALYZED_LINKS);

  if (allLinks.length === 0) {
    await saveToHistory(result);
    return ok(result, { quick: false, aiConfigured: isAIConfigured() });
  }

  const linkResults = await analyzeContextLinks(allLinks);
  const suspiciousLinks = linkResults.filter((r) => r.risk !== "safe" && r.risk !== "low");

  if (suspiciousLinks.length === 0) {
    const safeLinks = linkResults.map(r => ({
      url: r.inputValue,
      risk: r.risk,
      scamTypes: r.scamTypes,
      recommendation: r.recommendation,
    }));
    await saveToHistory(result);
    return ok({ ...result, linkAnalysis: safeLinks }, { quick: false, aiConfigured: isAIConfigured() });
  }

  const mergedResult = mergeWithSuspiciousLinks(result, suspiciousLinks, linkResults);
  await saveToHistory(mergedResult);
  return ok(
    mergedResult,
    { quick: false, aiConfigured: isAIConfigured() }
  );
}

async function handleReport(body: ReportBody) {
  if (!body.analysisId) return err("Le champ 'analysisId' est requis");

  await markAsReported(body.analysisId);

  const history = await getHistory(100);
  const analysis = history.find((h) => h.id === body.analysisId);
  if (analysis) {
    addReportedScam(
      analysis.inputValue,
      analysis.inputType,
      analysis.score,
      analysis.scamTypes,
      body.details ?? "Signalement utilisateur",
    );
  }

  return ok(null, { message: "Signalement enregistré avec succès" });
}

async function handleManageList(body: ManageListBody, ip: string) {
  const { manageAction, list, value, reason = "Ajout manuel" } = body;

  if (!manageAction || !list || !value) {
    return err("Les champs 'manageAction', 'list' et 'value' sont requis");
  }

  const type = body.type ?? detectType(value);

  if (manageAction === "add") {
    const entry = list === "blacklist"
      ? await addToBlacklist(value, type, reason)
      : await addToWhitelist(value, type, reason);
    await logAdminAction('manage-list:add', value, { list, type, reason }, ip);
    return ok(entry, { message: `Ajouté à la ${list}` });
  }

  if (manageAction === "remove") {
    const removed = list === "blacklist"
      ? await removeFromBlacklist(value)
      : await removeFromWhitelist(value);
    await logAdminAction('manage-list:remove', value, { list, removed }, ip);
    return ok(null, { message: removed ? `Retiré de la ${list}` : "Élément non trouvé" });
  }

  return err(`Action non supportée : ${manageAction}`);
}

function handleImport(body: ImportBody) {
  if (!body.data) return err("Le champ 'data' est requis");
  try {
    importDatabase(body.data);
    return ok(null, { message: "Base de données importée avec succès" });
  } catch {
    return err("Erreur lors de l'import de la base de données");
  }
}

type PostHandlerResult = NextResponse | Promise<NextResponse>;

function buildPostHandlers(ip: string): Record<PostAction, (body: PostBody) => PostHandlerResult> {
  return {
    analyze:       (body) => handleAnalyze(body as AnalyzeBody),
    report:        (body) => handleReport(body as ReportBody),
    "manage-list": (body) => handleManageList(body as ManageListBody, ip),
    import:        (body) => handleImport(body as ImportBody),
  };
}

export async function POST(request: NextRequest) {
  try {
    await loadListsFromSupabase();
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`analyze:${ip}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
    }

    const body = (await request.json()) as PostBody;
    const action: PostAction = (body as AnalyzeBody).action ?? "analyze";
    const handlers = buildPostHandlers(ip);
    const handler = handlers[action];
    if (!handler) return err(`Action non supportée : ${action}`);

    // Actions réservées aux admins
    if (ADMIN_POST_ACTIONS.has(action)) {
      if (!await isAdminRequest()) {
        return err("Non autorisé.", 401);
      }
      // Rate limit strict pour les actions admin (5 actions/minute)
      const adminRl = await checkRateLimit(`admin:${ip}`, { max: 5, windowMs: 60_000 });
      if (!adminRl.allowed) {
        return NextResponse.json({ error: "Trop de requêtes admin." }, { status: 429 });
      }
    }

    return await handler(body);
  } catch (error) {
    console.error("Erreur API POST /analyze:", error);
    return err("Erreur interne du serveur", 500);
  }
}

type GetAction = "stats" | "history" | "reported" | "blacklist" | "whitelist" | "export" | "detect-type";

const GET_HANDLERS: Record<GetAction, (params: URLSearchParams) => NextResponse | Promise<NextResponse>> = {
  stats: () =>
    NextResponse.json({ success: true, data: getDatabaseStats(), aiConfigured: isAIConfigured() }),

  history: async (p) =>
    ok(await getHistory(Number.parseInt(p.get("limit") ?? "50", 10))),

  reported: (p) =>
    ok(getReportedScams(Number.parseInt(p.get("limit") ?? "50", 10))),

  blacklist:     () => ok(getBlacklist()),
  whitelist:     () => ok(getWhitelist()),
  export:        async () => ok(await exportDatabase()),

  "detect-type": (p) => {
    const value = p.get("value");
    if (!value) return err("Paramètre 'value' requis");
    return ok({ type: detectType(value) });
  },
};

export async function GET(request: NextRequest) {
  try {
    await loadListsFromSupabase();
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`analyze:${ip}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
    }

    const params = new URL(request.url).searchParams;
    const action = (params.get("action") ?? "stats") as GetAction;
    const handler = GET_HANDLERS[action];
    if (!handler) return err(`Action non supportée : ${action}`);

    // Actions réservées aux admins
    if (ADMIN_GET_ACTIONS.has(action)) {
      if (!await isAdminRequest()) {
        return err("Non autorisé.", 401);
      }
    }

    return await handler(params);
  } catch (error) {
    console.error("Erreur API GET /analyze:", error);
    return err("Erreur interne du serveur", 500);
  }
}
