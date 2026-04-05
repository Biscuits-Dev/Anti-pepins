/**
 * @file constants.ts
 */

import type { RiskLevel, ScamType } from "./types";

// ─── Seuils de risque ─────────────────────────────────────────────────────────

export const RISK_SCORE_THRESHOLDS: Readonly<Record<RiskLevel, readonly [number, number]>> = {
  safe:       [0,  15],
  low:        [16, 29],
  suspicious: [30, 50],
  dangerous:  [51, 75],
  critical:   [76, 100],
} as const;

/**
 * Détermine le niveau de risque à partir d'un score.
 * O(n) sur 5 entrées = pratiquement O(1).
 */
export function scoreToRisk(score: number): RiskLevel {
  for (const [level, [min, max]] of Object.entries(RISK_SCORE_THRESHOLDS) as [RiskLevel, readonly [number, number]][]) {
    if (score >= min && score <= max) return level;
  }
  return "critical";
}

// ─── Niveaux de sévérité ──────────────────────────────────────────────────────

export const SEVERITY_SCORES = {
  critical: 25,
  high:     15,
  medium:    8,
  low:       3,
} as const;

// ─── Types d'arnaque valides ──────────────────────────────────────────────────

export const VALID_SCAM_TYPES = new Set<ScamType>([
  "phishing", "fake-website", "scam-call", "investment", "romance",
  "social-engineering", "tech-support", "fake-delivery", "brouteur",
  "lottery", "crypto-scam", "impersonation", "unknown",
]);

export const VALID_RISK_LEVELS = new Set<RiskLevel>([
  "safe", "low", "suspicious", "dangerous", "critical",
]);

// ─── TLDs de confiance ────────────────────────────────────────────────────────

export const TRUSTED_TLDS = new Set([
  "com", "org", "net", "edu", "gov", "mil",
  "fr", "de", "uk", "it", "es", "be", "ch", "ca", "us", "eu",
]);

// ─── Domaines de confiance ────────────────────────────────────────────────────

export const TRUSTED_DOMAINS = new Set([
  // Domaines officiels Biscuits IA / Anti-Pépins
  "biscuits-ia.com", "anti-pepins.biscuits-ia.com",
  // Autres domaines de confiance
  "google.com", "google.fr", "gmail.com",
  "apple.com", "icloud.com",
  "microsoft.com", "outlook.com", "hotmail.com", "live.com",
  "amazon.com", "amazon.fr",
  "facebook.com", "fb.com", "instagram.com", "whatsapp.com",
  "twitter.com", "x.com",
  "linkedin.com",
  "paypal.com",
  "netflix.com",
  "spotify.com",
  "github.com",
  "wikipedia.org",
  "lemonde.fr", "lefigaro.fr", "france24.com",
  "impots.gouv.fr", "ameli.fr", "service-public.fr",
  "laposte.fr", "colissimo.fr",
  "orange.fr", "sfr.fr", "bouygues-telecom.fr", "free.fr",
  "boursorama.com", "credit-agricole.fr", "bnpparibas.fr", "societe-generale.fr",
  "leboncoin.fr",
  "cdiscount.com", "fnac.com", "darty.com",
]);

// ─── Domaines email de confiance ──────────────────────────────────────────────

export const TRUSTED_EMAIL_DOMAINS = new Set([
  // Domaines officiels Biscuits IA / Anti-Pépins
  "biscuits-ia.com",
  // Autres domaines de confiance
  "gmail.com", "yahoo.com", "yahoo.fr", "outlook.com", "hotmail.com", "live.com",
  "icloud.com", "me.com", "mac.com",
  "protonmail.com", "proton.me",
  "laposte.net", "orange.fr", "sfr.fr", "free.fr", "wanadoo.fr",
]);

// ─── Domaines d'emails jetables ───────────────────────────────────────────────

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "tempmail.com", "throwaway.email", "guerrillamail.com", "mailinator.com",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "fakeinbox.com", "temp-mail.org", "tempail.com",
  "mohmal.com", "burnermail.io", "maildrop.cc", "harakirimail.com",
  "trashmail.com", "wegwerfmail.de", "spamgourmet.com", "mytemp.email",
]);

// ─── Domaines connus d'arnaque ────────────────────────────────────────────────

export const KNOWN_SCAM_DOMAINS = new Set([
  "amaz0n.com", "paypaI.com", "g00gle.com",
]);

// ─── Descriptions des types d'arnaque ────────────────────────────────────────

export const SCAM_TYPE_DESCRIPTIONS: Readonly<Record<ScamType, string>> = {
  "phishing":           "Tentative de vol d'informations personnelles via un faux site ou email",
  "fake-website":       "Site web frauduleux conçu pour tromper les visiteurs",
  "scam-call":          "Arnaque par appel téléphonique",
  "investment":         "Arnaque à l'investissement ou trading frauduleux",
  "romance":            "Arnaque sentimentale (brouteur)",
  "social-engineering": "Manipulation psychologique pour obtenir des informations",
  "tech-support":       "Faux support technique visant à accéder à votre appareil",
  "fake-delivery":      "Arnaque aux faux colis ou livraisons",
  "brouteur":           "Arnaque de type 'brouteur' (arnaque sentimentale ou financière)",
  "lottery":            "Arnaque à la loterie ou à l'héritage",
  "crypto-scam":        "Arnaque liée aux cryptomonnaies",
  "impersonation":      "Usurpation d'identité d'une personne ou organisation connue",
  "unknown":            "Type d'arnaque non identifié",
} as const;

// ─── Recommandations par niveau de risque ─────────────────────────────────────

export const RECOMMENDATIONS: Readonly<Record<RiskLevel, { text: string; actions: readonly string[] }>> = {
  safe: {
    text: "Aucun risque détecté. Ce contenu semble légitime.",
    actions: [
      "Continuez à rester vigilant",
      "Ne partagez jamais vos informations personnelles",
      "Vérifiez toujours l'authenticité des demandes",
    ],
  },
  low: {
    text: "Risque faible. Quelques indices mineurs ont été détectés.",
    actions: [
      "Restez prudent et vérifiez la source",
      "Ne cliquez pas sur des liens suspects",
      "En cas de doute, contactez-nous par email ou utilisez le chat. Nous vous aiderons à comprendre.",
    ],
  },
  suspicious: {
    text: "Risque modéré. Plusieurs indices suspects ont été détectés.",
    actions: [
      "Ne répondez pas à ce message",
      "Ne cliquez sur aucun lien",
      "Ne fournissez aucune information personnelle",
      "Signalez ce contenu si possible",
      "En cas de doute, contactez-nous par email ou utilisez le chat. Nous vous aiderons à comprendre.",
    ],
  },
  dangerous: {
    text: "Risque élevé. Ce contenu présente de forts indices d'arnaque.",
    actions: [
      "Ne répondez surtout pas",
      "Bloquez l'expéditeur",
      "Ne cliquez sur aucun lien",
      "Signalez immédiatement ce contenu",
      "Conservez une copie comme preuve",
      "Prévenez vos proches si c'est une arnaque connue",
    ],
  },
  critical: {
    text: "Danger critique ! Ce contenu est très probablement une arnaque.",
    actions: [
      "SUPPRIMEZ ce message immédiatement",
      "BLOQUEZ l'expéditeur",
      "NE CLIQUEZ SUR AUCUN LIEN",
      "NE FOURNISSEZ AUCUNE INFORMATION",
      "SIGNALEZ aux autorités (Signal-Arnaques, Pharos)",
      "Si vous avez déjà répondu, contactez votre banque",
      "Portez plainte si vous avez subi un préjudice",
    ],
  },
} as const;