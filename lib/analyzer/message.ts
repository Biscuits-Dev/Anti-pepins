/**
 * @file message.ts
 * Analyse sémantique des messages pour la détection d'arnaques.
 */

import type { RegexResult, ScamType, RiskLevel } from "./types";
import { analyzeWithRegex } from "./regex";
import { scoreToRisk } from "./constants";

// ─── Groupes d'indicateurs d'arnaque ─────────────────────────────────────────

interface ScamIndicatorGroup {
  readonly keywords: readonly string[];
  /** Points par match (plafonnés à 3 matches) */
  readonly weightPerMatch: number;
  readonly scamType: ScamType;
}

const SCAM_INDICATOR_GROUPS: readonly ScamIndicatorGroup[] = [
  {
    keywords: [
      "cliquez ici", "cliquez sur", "lien suivant", "vérifiez votre compte",
      "confirmez vos informations", "mettez à jour", "suspendu", "bloqué",
      "activité suspecte", "connexion inhabituelle", "sécurité de votre compte",
      "mot de passe expiré",
    ],
    weightPerMatch: 20,
    scamType: "phishing",
  },
  {
    keywords: [
      "mon amour", "mon cœur", "ma chérie", "mon cher", "je t'aime",
      "âme sœur", "envoyer de l'argent", "aide-moi financièrement",
      "feu mon père", "héritage", "diamant", "or", "mine",
      "homme d'affaires", "transférer",
    ],
    weightPerMatch: 25,
    scamType: "romance",
  },
  {
    keywords: [
      "support technique", "assistance microsoft", "assistance apple",
      "virus détecté", "ordinateur infecté", "appelez maintenant",
      "numéro d'assistance", "votre ordinateur est bloqué", "alerte de sécurité",
      // Patterns supplémentaires pour réduire les faux négatifs tech-support français
      "support microsoft", "support apple", "support google",
      "support orange", "support sfr", "support free", "support bouygues",
      "virus trouvé", "virus identifié",
      "votre ordinateur est infecté", "votre pc est infecté",
      "votre appareil est infecté", "votre appareil est compromis",
      "votre ordinateur est compromis", "votre pc est piraté",
      "ne fermez pas", "n'éteignez pas",
      "appelez immédiatement", "appelez tout de suite",
      "windows a détecté", "alerte de sécurité windows",
    ],
    weightPerMatch: 25,
    scamType: "tech-support",
  },
  {
    keywords: [
      "investissement", "rendement garanti", "multiplier votre argent",
      "bitcoin", "crypto", "ethereum", "trading", "forex",
      "argent facile", "devenir riche", "signal de trading",
      // Patterns crypto/mining pool français supplémentaires
      "pool de minage", "investissement garanti", "sans risque",
      "taux de rendement", "retour sur investissement",
      "gagnez par jour", "gagnez par semaine", "gagnez par mois",
      "profit journalier", "revenus passifs garantis",
    ],
    weightPerMatch: 20,
    scamType: "investment",
  },
  {
    keywords: [
      "colis en attente", "tentative de livraison", "frais de douane",
      "colis retenu", "taxe douanière", "payer les frais",
    ],
    weightPerMatch: 15,
    scamType: "fake-delivery",
  },
  {
    keywords: [
      "vous avez gagné", "loterie", "jackpot", "héritage",
      "succession", "fortune", "millions", "transfert bancaire",
    ],
    weightPerMatch: 20,
    scamType: "lottery",
  },
  {
    keywords: [
      "urgent", "immédiat", "rapidement", "confidentiel", "secret",
      "ne dites à personne", "action requise", "dernier avis",
      "poursuites", "procès", "amende",
    ],
    weightPerMatch: 15,
    scamType: "social-engineering",
  },
  {
    keywords: [
      "mot de passe", "code de vérification", "code sms", "code pin",
      "numéro de carte", "cvv", "iban", "rib",
    ],
    weightPerMatch: 25,
    scamType: "social-engineering",
  },
] as const;

// ─── Plateformes détectables ──────────────────────────────────────────────────

const PLATFORM_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  facebook:  ["facebook", "fb.com", "messenger"],
  instagram: ["instagram", "ig", "dm instagram"],
  whatsapp:  ["whatsapp", "wa.me"],
  telegram:  ["telegram", "t.me"],
  sms:       ["sms", "message texte"],
  email:     ["email", "courriel", "par mail"],
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageAnalysisDetails {
  readonly wordCount: number;
  readonly sentenceCount: number;
  readonly hasUrgency: boolean;
  readonly hasThreats: boolean;
  readonly hasFinancialRequest: boolean;
  readonly hasPersonalInfoRequest: boolean;
  readonly hasExternalLink: boolean;
  readonly hasPhoneNumber: boolean;
  readonly detectedPlatforms: readonly string[];
  readonly language: string;
  readonly scamTypes: readonly ScamType[];
  readonly indicators: readonly string[];
}

// ─── Analyse principale ───────────────────────────────────────────────────────

export function analyzeMessage(
  message: string,
  context?: string,
): {
  regex: RegexResult;
  details: MessageAnalysisDetails;
  score: number;
  scamTypes: ScamType[];
} {
  const regexResult = analyzeWithRegex(message, "message");
  const lower = message.toLowerCase();

  // Flags sémantiques
  const flags = extractSemanticFlags(lower);

  let indicatorScore = 0;
  const scamTypes = new Set<ScamType>();
  const indicators: string[] = [];

  // Analyse par groupe de mots-clés
  for (const group of SCAM_INDICATOR_GROUPS) {
    const matched = group.keywords.filter((kw) => lower.includes(kw));
    if (matched.length === 0) continue;

    const contribution = group.weightPerMatch * Math.min(matched.length, 3) / 3;
    indicatorScore += contribution;
    scamTypes.add(group.scamType);
    indicators.push(`${group.scamType}: ${matched.slice(0, 3).join(", ")}`);
  }

  // Facteurs aggravants
  if (flags.hasUrgency)           { indicatorScore += 10; indicators.push("urgence_détectée"); }
  if (flags.hasThreats)           { indicatorScore += 15; indicators.push("menaces_détectées"); }
  if (flags.hasFinancialRequest)  { indicatorScore += 15; indicators.push("demande_financière"); }
  if (flags.hasPersonalInfoRequest){ indicatorScore += 20; indicators.push("demande_infos_personnelles"); }
  if (flags.hasExternalLink)      { indicatorScore +=  5; indicators.push("lien_externe"); }

  const words = message.split(/\s+/).filter(Boolean);
  if (words.length < 20 && (flags.hasFinancialRequest || flags.hasPersonalInfoRequest)) {
    indicatorScore += 10;
    indicators.push("message_court_suspect");
  }

  const finalScore = Math.max(0, Math.min(100, regexResult.score + indicatorScore));

  const details: MessageAnalysisDetails = {
    wordCount:            words.length,
    sentenceCount:        message.split(/[.!?]+/).filter((s) => s.trim().length > 0).length,
    hasUrgency:           flags.hasUrgency,
    hasThreats:           flags.hasThreats,
    hasFinancialRequest:  flags.hasFinancialRequest,
    hasPersonalInfoRequest: flags.hasPersonalInfoRequest,
    hasExternalLink:      flags.hasExternalLink,
    hasPhoneNumber:       flags.hasPhoneNumber,
    detectedPlatforms:    detectPlatforms(lower, context),
    language:             detectLanguage(message),
    scamTypes:            Array.from(scamTypes),
    indicators,
  };

  return {
    regex: regexResult,
    details,
    score: finalScore,
    scamTypes: Array.from(scamTypes),
  };
}

// ─── Helpers internes ─────────────────────────────────────────────────────────

interface SemanticFlags {
  hasUrgency: boolean;
  hasThreats: boolean;
  hasFinancialRequest: boolean;
  hasPersonalInfoRequest: boolean;
  hasExternalLink: boolean;
  hasPhoneNumber: boolean;
}

const URGENCY_WORDS    = ["urgent", "urgence", "immédiat", "vite", "rapidement", "asap", "maintenant", "tout de suite"];
const THREAT_WORDS     = ["poursuites", "procès", "amende", "police", "tribunal", "arrestation", "saisie"];
const FINANCIAL_WORDS  = ["envoyer", "virement", "argent", "payer", "paiement", "carte", "banque", "transférer"];
const INFO_WORDS       = ["mot de passe", "code", "numéro", "adresse", "naissance", "iban", "rib", "carte"];
const PHONE_RE         = /(?:\+?\d{1,3}[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}/;
const LINK_RE          = /https?:\/\/\S+/;

function extractSemanticFlags(lower: string): SemanticFlags {
  return {
    hasUrgency:             URGENCY_WORDS.some((w) => lower.includes(w)),
    hasThreats:             THREAT_WORDS.some((w) => lower.includes(w)),
    hasFinancialRequest:    FINANCIAL_WORDS.some((w) => lower.includes(w)),
    hasPersonalInfoRequest: INFO_WORDS.some((w) => lower.includes(w)),
    hasExternalLink:        LINK_RE.test(lower),
    hasPhoneNumber:         PHONE_RE.test(lower),
  };
}

function detectPlatforms(lower: string, context?: string): string[] {
  const contextLower = context?.toLowerCase() ?? "";
  return Object.entries(PLATFORM_KEYWORDS)
    .filter(([, keywords]) =>
      keywords.some((k) => lower.includes(k) || contextLower.includes(k)),
    )
    .map(([platform]) => platform);
}

// ─── Analyse de conversation ──────────────────────────────────────────────────

export function analyzeConversation(messages: readonly string[]): {
  overallScore: number;
  scamTypes: ScamType[];
  riskLevel: RiskLevel;
  messageAnalyses: readonly { score: number; scamTypes: ScamType[] }[];
  conversationFlags: {
    escalationDetected: boolean;
    repeatedRequests: boolean;
    urgencyIncreasing: boolean;
  };
} {
  const analyses = messages.map((msg) => analyzeMessage(msg));
  const scores   = analyses.map((a) => a.score);

  const maxScore = Math.max(...scores, 0);
  const avgScore = scores.length > 0
    ? scores.reduce((s, n) => s + n, 0) / scores.length
    : 0;

  const overallScore = Math.round(maxScore * 0.6 + avgScore * 0.4);

  const allScamTypes = new Set<ScamType>();
  for (const a of analyses) a.scamTypes.forEach((t) => allScamTypes.add(t));

  const urgencyCount    = analyses.filter((a) => a.details.hasUrgency).length;
  const financialCount  = analyses.filter((a) => a.details.hasFinancialRequest).length;

  return {
    overallScore,
    scamTypes:  Array.from(allScamTypes),
    riskLevel:  scoreToRisk(overallScore),
    messageAnalyses: analyses.map((a) => ({ score: a.score, scamTypes: a.scamTypes })),
    conversationFlags: {
      escalationDetected: urgencyCount > messages.length * 0.5,
      repeatedRequests:   financialCount > 1,
      urgencyIncreasing:  messages.length >= 3 &&
        analyses.slice(-2).every((a) => a.details.hasUrgency),
    },
  };
}

// ─── Détection de langue (exportée) ──────────────────────────────────────────

const FR_WORDS = new Set([
  "le","la","les","un","une","des","est","sont","je","tu","il",
  "nous","vous","ils","elle","et","ou","mais","donc","car","que",
  "qui","dans","sur","avec","pour","par","de",
]);
const EN_WORDS = new Set([
  "the","a","an","is","are","was","were","i","you","he","she","it",
  "we","they","have","has","had","and","or","but","so","because",
  "that","which","who","in","on","at","with","for","by","from",
]);

export function detectLanguage(text: string): string {
  let fr = 0, en = 0;
  for (const word of text.toLowerCase().split(/\s+/)) {
    if (FR_WORDS.has(word)) fr++;
    if (EN_WORDS.has(word)) en++;
  }
  if (fr > en) return "fr";
  if (en > fr) return "en";
  return "unknown";
}