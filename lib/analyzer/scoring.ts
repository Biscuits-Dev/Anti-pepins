/**
 * @file scoring.ts
 * Fusion intelligente des scores regex + IA pour produire un verdict final.
 */

import type {
  RiskLevel,
  ScamType,
  RegexResult,
  AIResult,
  AnalysisResult,
  AnalyzableType,
} from "./types";
import {
  scoreToRisk,
  SCAM_TYPE_DESCRIPTIONS,
  RECOMMENDATIONS,
} from "./constants";


const WEIGHTS_WITH_AI = {
  regex:      0.35,
  ai:         0.45,
  structural: 0.2,
} as const;

const WEIGHTS_NO_AI = {
  regex:      0.6,
  structural: 0.4,
} as const;


const TRIGGER_TO_SCAM: Readonly<Record<string, ScamType>> = {
  "domain-spoofing":       "phishing",
  "suspicious-keyword":    "phishing",
  "homoglyph":             "phishing",
  "url-credentials":       "phishing",
  "execution-param":       "phishing",
  "email-spoofing":        "impersonation",
  "disposable-email":      "social-engineering",
  "fraud-keyword":         "social-engineering",
  "urgency":               "social-engineering",
  "account-alert":         "phishing",
  "call-to-action":        "phishing",
  "financial-promise":     "investment",
  "crypto-investment":     "crypto-scam",
  "delivery-scam":         "fake-delivery",
  "banking-payment":       "social-engineering",
  "threat":                "social-engineering",
  "romance-scam":          "romance",
  "tech-support":          "tech-support",
  "personal-info-request": "social-engineering",
  "brouteur":              "brouteur",
  "external-messaging":    "social-engineering",
  "premium-rate":          "scam-call",
  "suspicious-international": "romance",
} as const;

const SEVERITY_STRUCT_BONUS: Readonly<Record<RegexResult["triggers"][number]["severity"], number>> = {
  critical: 30,
  high:     20,
  medium:   10,
  low:       5,
} as const;

function computeStructuralScore(regexResult: RegexResult): number {
  const { triggers } = regexResult;
  if (triggers.length === 0) return 0;

  const uniqueTypes = new Set(triggers.map((t) => t.type)).size;
  let score = uniqueTypes * 5;

  // Bonus pour la sévérité la plus élevée
  const ORDER = { low: 1, medium: 2, high: 3, critical: 4 } as const;
  const maxSev = triggers.reduce(
    (best, t) => (ORDER[t.severity] > ORDER[best] ? t.severity : best),
    "low" as RegexResult["triggers"][number]["severity"],
  );
  score += SEVERITY_STRUCT_BONUS[maxSev];

  return Math.min(100, score);
}


/**
 * @param regexResult  - Résultat de l'analyse regex (obligatoire)
 * @param aiResult     - Résultat IA (null si non disponible)
 * @param inputType    - Type de contenu analysé
 * @param inputValue   - Valeur brute (sera masquée si nécessaire)
 * @param extraScamTypes - Types d'arnaque issus des analyses spécialisées (URL, email…)
 */
export function calculateFinalScore(
  regexResult: RegexResult,
  aiResult: AIResult | null,
  inputType: AnalyzableType,
  inputValue: string,
  extraScamTypes: readonly ScamType[] = [],
): AnalysisResult {
  const structuralScore = computeStructuralScore(regexResult);

  let finalScore: number;
  if (aiResult && aiResult.confidence > 0) {
    // Poids IA ajusté par sa confiance réelle (ex: confiance 40% → poids IA réduit)
    const aiConfidenceFactor   = aiResult.confidence / 100;
    const effectiveAiWeight    = WEIGHTS_WITH_AI.ai * aiConfidenceFactor;
    const effectiveRegexWeight = WEIGHTS_WITH_AI.regex + (WEIGHTS_WITH_AI.ai - effectiveAiWeight);
    // effectiveRegexWeight + effectiveAiWeight + structural = 1.0 par construction
    finalScore =
      regexResult.score    * effectiveRegexWeight        +
      aiResult.score       * effectiveAiWeight           +
      structuralScore      * WEIGHTS_WITH_AI.structural;
  } else {
    finalScore =
      regexResult.score    * WEIGHTS_NO_AI.regex        +
      structuralScore      * WEIGHTS_NO_AI.structural;
  }

  finalScore = Math.round(Math.max(0, Math.min(100, finalScore)));

  const risk = scoreToRisk(finalScore);
  const scamTypes = mergeScamTypes(regexResult.triggers, aiResult, extraScamTypes);
  const triggers = buildTriggersList(regexResult.triggers, aiResult, regexResult.score);
  const { text: recommendation, actions } = RECOMMENDATIONS[risk];

  return {
    inputType,
    inputValue: maskSensitiveData(inputValue, inputType),
    score:      finalScore,
    risk,
    regex:      regexResult,
    ai:         aiResult,
    triggers,
    scamTypes,
    timestamp:  new Date().toISOString(),
    analysisId: generateAnalysisId(),
    cached:     false,
    recommendation,
    actions,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mergeScamTypes(
  triggers: RegexResult["triggers"],
  aiResult: AIResult | null,
  extra: readonly ScamType[],
): ScamType[] {
  const set = new Set<ScamType>(extra);

  for (const trigger of triggers) {
    const mapped = TRIGGER_TO_SCAM[trigger.type];
    if (mapped) set.add(mapped);
  }

  if (aiResult?.type && aiResult.type !== "unknown") {
    set.add(aiResult.type);
  }

  return Array.from(set);
}

function buildTriggersList(
  regexTriggers: RegexResult["triggers"],
  aiResult: AIResult | null,
  regexScore: number,
): string[] {
  const list: string[] = regexTriggers.map(
    (t) => `${t.type} [${t.severity}]: ${t.description}`,
  );

  for (const indicator of aiResult?.indicators ?? []) {
    list.push(`ia: ${indicator}`);
  }

  // Flag de désaccord regex/IA quand l'écart est fort (>= 40 points)
  if (aiResult && Math.abs(regexScore - aiResult.score) >= 40) {
    const higher = regexScore > aiResult.score ? "regex" : "IA";
    const lower  = higher === "regex" ? "IA" : "regex";
    list.push(
      `⚠️ Analyse incomplète : ${higher} détecte un risque élevé mais ${lower} pas — vérification manuelle recommandée`,
    );
  }

  return list;
}

function maskSensitiveData(value: string, type: AnalyzableType): string {
  if (type === "phone") {
    const digits = value.replaceAll(/\D/g, "");
    return digits.length > 4
      ? "*".repeat(digits.length - 4) + digits.slice(-4)
      : value;
  }

  if (type === "email") {
    const [local, domain] = value.split("@");
    if (local && domain && local.length > 3) {
      return `${local[0]}${"*".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
    }
  }

  if (type === "url") {
    try {
      const url = new URL(value.startsWith("http") ? value : `https://${value}`);
      url.search = "";
      url.hash = "";
      return url.toString();
    } catch {
      return value;
    }
  }

  return value;
}

function generateAnalysisId(): string {
  return `analysis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// ─── Exports utilitaires ──────────────────────────────────────────────────────

export function getScamTypeDescription(type: ScamType): string {
  return SCAM_TYPE_DESCRIPTIONS[type] ?? "Type d'arnaque non documenté";
}

export function getRecommendations(risk: RiskLevel): { text: string; actions: readonly string[] } {
  return RECOMMENDATIONS[risk];
}

/**
 * Score de confiance global combinant les signaux regex et IA.
 */
export function calculateConfidence(
  regexResult: RegexResult,
  aiResult: AIResult | null,
): number {
  // Chaque trigger regex apporte 10 pts (max 30)
  const fromRegex = Math.min(30, regexResult.triggers.length * 10);
  // L'IA contribue à 50 % de sa propre confiance, sinon 15 pts par défaut
  const fromAI = aiResult ? aiResult.confidence * 0.5 : 15;

  return Math.min(100, Math.round(fromRegex + fromAI));
}