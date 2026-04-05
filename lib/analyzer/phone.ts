/**
 * @file phone.ts
 * Analyse des numéros de téléphone : surtaxés, internationaux suspects, urgence.
 */

import type { RegexResult, ScamType } from "./types";
import { analyzeWithRegex } from "./regex";

// ─── Données de référence ─────────────────────────────────────────────────────

interface CountryRisk {
  readonly country: string;
  readonly risk: "high" | "medium";
}

/** Indicatifs connus pour être fréquemment utilisés dans des arnaques */
const SUSPICIOUS_COUNTRY_CODES: Readonly<Record<string, CountryRisk>> = {
  "229": { country: "Bénin",          risk: "high"   },
  "225": { country: "Côte d'Ivoire",  risk: "high"   },
  "237": { country: "Cameroun",       risk: "high"   },
  "221": { country: "Sénégal",        risk: "medium" },
  "226": { country: "Burkina Faso",   risk: "medium" },
  "228": { country: "Togo",           risk: "high"   },
  "242": { country: "Congo",          risk: "high"   },
  "243": { country: "RD Congo",       risk: "medium" },
  "233": { country: "Ghana",          risk: "medium" },
  "234": { country: "Nigeria",        risk: "high"   },
  "224": { country: "Guinée",         risk: "medium" },
  "223": { country: "Mali",           risk: "medium" },
  "222": { country: "Mauritanie",     risk: "medium" },
  "373": { country: "Moldavie",       risk: "high"   },
  "252": { country: "Somalie",        risk: "high"   },
  "211": { country: "Soudan du Sud",  risk: "high"   },
} as const;

/** Numéros français spéciaux */
const FR_EMERGENCY     = new Set(["15", "17", "18", "112", "114", "115", "119", "3919"]);
const FR_PREMIUM_PREFIXES = ["081", "082", "087", "088", "089"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhoneAnalysisDetails {
  readonly formattedNumber: string;
  readonly countryCode: string;
  readonly country: string;
  readonly isFrenchNumber: boolean;
  readonly isEmergency: boolean;
  readonly isPremiumRate: boolean;
  readonly isSuspiciousInternational: boolean;
  readonly isValidFormat: boolean;
  readonly numberType: "mobile" | "landline" | "special" | "unknown";
  readonly scamTypes: readonly ScamType[];
}

// ─── Analyse principale ───────────────────────────────────────────────────────

export function analyzePhone(phone: string): {
  regex: RegexResult;
  details: PhoneAnalysisDetails;
  score: number;
  scamTypes: ScamType[];
} {
  const regexResult = analyzeWithRegex(phone, "phone");
  const details     = parsePhone(phone);

  let delta = 0;
  const scamTypes = new Set<ScamType>(details.scamTypes);

  if (details.isEmergency)               delta -= 50;
  if (details.isPremiumRate)           { delta += 20; scamTypes.add("scam-call"); }
  if (details.isSuspiciousInternational){ delta += 30; scamTypes.add("romance"); scamTypes.add("social-engineering"); }
  if (!details.isValidFormat)            delta += 15;

  const finalScore = Math.max(0, Math.min(100, regexResult.score + delta));

  return {
    regex: regexResult,
    details,
    score: finalScore,
    scamTypes: Array.from(scamTypes),
  };
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function normalize(phone: string): string {
  const cleaned = phone.replaceAll(/[\s\-().]/g, "");
  return cleaned.startsWith("00") ? `+${cleaned.slice(2)}` : cleaned;
}

function parsePhone(phone: string): PhoneAnalysisDetails {
  const norm = normalize(phone);

  const isFrench = norm.startsWith("+33") ||
    (norm.startsWith("0") && norm.length === 10);

  const { countryCode, country, isSuspiciousInternational } = resolveCountry(norm, isFrench);
  const isEmergency   = checkEmergency(norm);
  const isPremiumRate = checkPremiumRate(norm, isFrench);
  const numberType    = isFrench ? frenchNumberType(norm) : "unknown";
  const isValidFormat = /^\+?\d{8,15}$/.test(norm);

  const scamTypes: ScamType[] = [];
  if (isSuspiciousInternational) scamTypes.push("romance", "social-engineering");
  if (isPremiumRate)              scamTypes.push("scam-call");

  return {
    formattedNumber: formatFrench(norm),
    countryCode,
    country,
    isFrenchNumber: isFrench,
    isEmergency,
    isPremiumRate,
    isSuspiciousInternational,
    isValidFormat,
    numberType,
    scamTypes,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveCountry(norm: string, isFrench: boolean): {
  countryCode: string;
  country: string;
  isSuspiciousInternational: boolean;
} {
  if (isFrench) return { countryCode: "33", country: "France", isSuspiciousInternational: false };

  if (norm.startsWith("+")) {
    // Essai sur 3, 2, 1 chiffres (codes pays de longueur variable)
    for (const len of [3, 2, 1] as const) {
      const code = norm.slice(1, 1 + len);
      if (code === "33") return { countryCode: code, country: "France", isSuspiciousInternational: false };
      const info = SUSPICIOUS_COUNTRY_CODES[code];
      if (info) {
        return {
          countryCode: code,
          country: info.country,
          isSuspiciousInternational: info.risk === "high",
        };
      }
    }
  }

  return { countryCode: "", country: "Inconnu", isSuspiciousInternational: false };
}

function checkEmergency(norm: string): boolean {
  const short = norm.replace(/^\+33|^0/, "");
  return FR_EMERGENCY.has(short) || FR_EMERGENCY.has(norm);
}

function checkPremiumRate(norm: string, isFrench: boolean): boolean {
  if (isFrench) {
    const local = norm.startsWith("+33") ? "0" + norm.slice(3) : norm;
    return FR_PREMIUM_PREFIXES.some((p) => local.startsWith(p));
  }
  return /^\+?\d{1,3}9(?:00|06|07|08|09)/.test(norm);
}

function frenchNumberType(norm: string): PhoneAnalysisDetails["numberType"] {
  const local = norm.startsWith("+33") ? "0" + norm.slice(3) : norm;
  if (local.startsWith("06") || local.startsWith("07"))                           return "mobile";
  if (/^0[1-5]/.test(local))                                                      return "landline";
  if (local.startsWith("08") || local.startsWith("09"))                           return "special";
  return "unknown";
}

function formatFrench(norm: string): string {
  const d = norm.replaceAll(/\D/g, "");
  if (d.startsWith("33") && d.length === 11) {
    const l = "0" + d.slice(2);
    return `${l.slice(0,2)} ${l.slice(2,4)} ${l.slice(4,6)} ${l.slice(6,8)} ${l.slice(8,10)}`;
  }
  if (d.startsWith("0") && d.length === 10) {
    return `${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4,6)} ${d.slice(6,8)} ${d.slice(8,10)}`;
  }
  return norm;
}

// ─── Utilitaires exportés ─────────────────────────────────────────────────────

export function isEmergencyNumber(phone: string): boolean {
  const n = normalize(phone);
  return checkEmergency(n);
}

export function isPremiumRateNumber(phone: string): boolean {
  const n = normalize(phone);
  const isFrench = n.startsWith("+33") || (n.startsWith("0") && n.length === 10);
  return checkPremiumRate(n, isFrench);
}

export function identifyCountry(phone: string): { code: string; country: string; risk: string } {
  const n = normalize(phone);
  const isFrench = n.startsWith("+33") || (n.startsWith("0") && n.length === 10);
  const { countryCode, country, isSuspiciousInternational } = resolveCountry(n, isFrench);

  if (countryCode === "33") return { code: "33", country: "France", risk: "low" };

  const info = SUSPICIOUS_COUNTRY_CODES[countryCode];
  if (info) return { code: countryCode, country: info.country, risk: info.risk };

  return {
    code:    countryCode,
    country: country || (countryCode ? `Pays +${countryCode}` : "Inconnu"),
    risk:    isSuspiciousInternational ? "high" : "unknown",
  };
}