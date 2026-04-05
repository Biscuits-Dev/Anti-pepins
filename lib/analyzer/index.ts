/**
 * @file index.ts
 * Point d'entrée unique du système anti-arnaque.
 */

import type {
  AnalyzableType,
  AnalyzeRequest,
  AnalysisResult,
  ScamType,
} from "./types";

import { sanitize, sanitizeContext, isReDoSSafe, SanitizationError } from "./sanitize";
import { analyzeWithRegex } from "./regex";
import { analyzeURL } from "./url";
import { analyzeEmail } from "./email";
import { analyzeMessage } from "./message";
import { analyzePhone } from "./phone";
import { analyzeWithAI, isAIConfigured } from "./ai";
import { calculateFinalScore, calculateConfidence } from "./scoring";
import { isInBlacklist, isInWhitelist } from "./database";

// ─── Dispatch map des analyseurs spécialisés ──────────────────────────────────

type SpecializedResult = {
  regexResult: ReturnType<typeof analyzeWithRegex>;
  specializedScamTypes: ScamType[];
};

type SpecializedAnalyzer = (value: string, context?: string) => SpecializedResult;

const SPECIALIZED_ANALYZERS: Partial<Record<AnalyzableType, SpecializedAnalyzer>> = {
  url: (value) => {
    const r = analyzeURL(value);
    return { regexResult: r.regex, specializedScamTypes: [...r.scamTypes] };
  },
  email: (value) => {
    const r = analyzeEmail(value);
    return { regexResult: r.regex, specializedScamTypes: [...r.scamTypes] };
  },
  message: (value, context) => {
    const r = analyzeMessage(value, context);
    return { regexResult: r.regex, specializedScamTypes: [...r.scamTypes] };
  },
  text: (value, context) => {
    const r = analyzeMessage(value, context);
    return { regexResult: r.regex, specializedScamTypes: [...r.scamTypes] };
  },
  phone: (value) => {
    const r = analyzePhone(value);
    return { regexResult: r.regex, specializedScamTypes: [...r.scamTypes] };
  },
};

function runSpecializedAnalysis(
  value: string,
  type: AnalyzableType,
  context: string | undefined,
): SpecializedResult {
  const analyzer = SPECIALIZED_ANALYZERS[type];
  if (analyzer) return analyzer(value, context);
  return { regexResult: analyzeWithRegex(value, type), specializedScamTypes: [] };
}

// ─── Domaines officiels ───────────────────────────────────────────────────────

const OFFICIAL_DOMAINS = ["biscuits-ia.com", "anti-pepins.biscuits-ia.com"] as const;

function isOfficialDomain(value: string): boolean {
  const lower = value.toLowerCase();
  return OFFICIAL_DOMAINS.some((d) => lower.includes(d));
}

// ─── Construction d'un résultat instantané (whitelist / blacklist) ────────────

function buildInstantResultData(
  value: string,
  listName: "whitelist" | "blacklist",
): Pick<AnalysisResult, "score" | "risk" | "triggers" | "scamTypes" | "recommendation" | "actions"> {
  if (listName === "whitelist") {
    if (isOfficialDomain(value)) {
      return {
        score: 0,
        risk: "safe",
        triggers: ["✅ Domaine officiel Biscuits IA — 100% fiable, on peut pas nous troller 😄"],
        scamTypes: [],
        recommendation:
          "🍪 Ceci est un domaine officiel Biscuits IA ! Analyse : 100% fiable, 0% arnaque. Vous pouvez tester autant que vous voulez, on ne se laisse pas avoir ! 😄",
        actions: [
          "🍪 Continuez à explorer nos outils en toute sécurité",
          "🛡️ Partagez Anti-Pépins autour de vous",
          "💬 Signalez-nous toute arnaque que vous rencontrez",
        ],
      };
    }
    return {
      score: 0,
      risk: "safe",
      triggers: ["whitelist: Contenu dans la liste de confiance"],
      scamTypes: [],
      recommendation: "Ce contenu est dans la liste de confiance. Aucun risque détecté.",
      actions: ["Aucune action nécessaire"],
    };
  }

  return {
    score: 100,
    risk: "critical",
    triggers: ["blacklist: Contenu connu comme arnaque"],
    scamTypes: ["unknown"],
    recommendation: "Danger ! Ce contenu est connu comme étant une arnaque.",
    actions: [
      "NE CLIQUEZ SUR AUCUN LIEN",
      "BLOQUEZ l'expéditeur",
      "SIGNALEZ aux autorités",
    ],
  };
}

function buildInstantResult(
  value: string,
  type: AnalyzableType,
  listName: "whitelist" | "blacklist",
): AnalysisResult {
  const data = buildInstantResultData(value, listName);
  const analysisId = `${listName}_${Date.now().toString(36)}`;

  const result: AnalysisResult = {
    inputType: type,
    inputValue: value,
    ...data,
    regex: { score: data.score, triggers: [], details: { [listName]: true } },
    ai: null,
    timestamp: new Date().toISOString(),
    analysisId,
    cached: false,
  };

  return result;
}

// ─── Analyse principale ───────────────────────────────────────────────────────

/**
 * Analyse complète d'un contenu.
 * @throws {SanitizationError} si la valeur est invalide.
 */
export async function analyze(request: AnalyzeRequest): Promise<AnalysisResult> {
  const { type, context } = request;

  const value = sanitize(request.value, type);
  const safeContext = sanitizeContext(context);

  if (!isReDoSSafe(value)) {
    throw new SanitizationError("Valeur contenant des répétitions pathologiques.", "value");
  }

  if (isInWhitelist(value)) return buildInstantResult(value, type, "whitelist");
  if (isInBlacklist(value)) return buildInstantResult(value, type, "blacklist");

  const { regexResult, specializedScamTypes } = runSpecializedAnalysis(value, type, safeContext);

  let aiResult = null;
  if (isAIConfigured()) {
    try {
    const aiInput = safeContext
      ? `${value}\n\n${safeContext}`
      : value;
    aiResult = await analyzeWithAI(aiInput.substring(0, 8000));
    } catch (err) {
      console.error("[analyze] Erreur analyse IA :", err);
    }
  }

  const result = calculateFinalScore(regexResult, aiResult, type, value, specializedScamTypes);
  const confidence = calculateConfidence(regexResult, aiResult);

  return {
    ...result,
    contextFields: request.contextFields,
    ai: aiResult ? { ...aiResult, confidence } : null,
  };
}

// ─── Analyse rapide (sans IA) ─────────────────────────────────────────────────

export function analyzeQuick(value: string, type?: AnalyzableType): AnalysisResult {
  const detectedType = type ?? detectType(value);
  let sanitized: string;
  try {
    sanitized = sanitize(value, detectedType);
  } catch {
    sanitized = value.trim().substring(0, 500);
  }
  const regexResult = analyzeWithRegex(sanitized, detectedType);
  return calculateFinalScore(regexResult, null, detectedType, sanitized);
}

// ─── Détection automatique du type ────────────────────────────────────────────

const URL_DETECT_RE   = /^https?:\/\/\S+|^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;
const EMAIL_DETECT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_DETECT_RE = /^(?:\+?\d{1,3}[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}$/;

export function detectType(value: string): AnalyzableType {
  const trimmed = value.trim();
  if (URL_DETECT_RE.test(trimmed))   return "url";
  if (EMAIL_DETECT_RE.test(trimmed)) return "email";
  if (PHONE_DETECT_RE.test(trimmed)) return "phone";
  if (trimmed.split(/\s+/).length > 3) return "message";
  return "text";
}

// ─── Réexports ────────────────────────────────────────────────────────────────

export type {
  AnalyzableType,
  RiskLevel,
  ScamType,
  AnalyzeRequest,
  AnalysisResult,
  RegexResult,
  RegexTrigger,
  AIResult,
  ListEntry,
  AnalysisHistory,
  AnalysisContextFields,
  CustomField,
  SanitizedString,
} from "./types";

export { analyzeWithRegex } from "./regex";
export { analyzeURL, isTrustedDomain, isKnownScamDomain, extractDomain } from "./url";
export type { URLAnalysisDetails } from "./url";
export { analyzeEmail, isDisposableEmail, isValidEmailFormat } from "./email";
export type { EmailAnalysisDetails } from "./email";
export { analyzeMessage, analyzeConversation, detectLanguage } from "./message";
export type { MessageAnalysisDetails } from "./message";
export { analyzePhone, isEmergencyNumber, isPremiumRateNumber, identifyCountry } from "./phone";
export type { PhoneAnalysisDetails } from "./phone";
export { analyzeWithAI, isAIConfigured, clearAICache, getAICacheStats } from "./ai";
export { calculateFinalScore, getScamTypeDescription, getRecommendations, calculateConfidence } from "./scoring";
export {
  isInBlacklist,
  isInWhitelist,
  addToBlacklist,
  removeFromBlacklist,
  addToWhitelist,
  removeFromWhitelist,
  getBlacklist,
  getWhitelist,
  addToHistory,
  getHistory,
  getHistoryEntry,
  markAsReported,
  clearHistory,
  addReportedScam,
  getReportedScams,
  getDatabaseStats,
  exportDatabase,
  importDatabase,
  resetDatabase,
  loadListsFromSupabase,
  resetLoadFlag,
} from "./database";
export type { ReportedScam } from "./database";

export { sanitize, sanitizeContext, isReDoSSafe, SanitizationError } from "./sanitize";
export { SCAM_TYPE_DESCRIPTIONS, RECOMMENDATIONS, scoreToRisk } from "./constants";