/**
 * @file email.ts
 * Analyse structurelle des adresses email : spoofing, jetables, TLDs suspects.
 */

import type { RegexResult, ScamType } from "./types";
import { analyzeWithRegex } from "./regex";
import { isTrustedDomain, isKnownScamDomain } from "./url";
import { TRUSTED_EMAIL_DOMAINS, DISPOSABLE_EMAIL_DOMAINS } from "./constants";

// ─── TLDs suspects pour les emails ────────────────────────────────────────────

const SUSPICIOUS_EMAIL_TLDS = new Set([
  "xyz", "top", "tk", "ml", "ga", "cf", "gq",
  "buzz", "club", "work", "ru", "cn", "ng",
]);

// ─── Domaines cibles du spoofing (Levenshtein ≤ 2) ───────────────────────────

const SPOOFING_TARGETS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "apple.com", "microsoft.com", "amazon.com", "paypal.com",
  "netflix.com", "facebook.com", "instagram.com",
  "laposte.net", "orange.fr", "wanadoo.fr",
] as const;

// ─── Substitutions homoglyphes numériques ─────────────────────────────────────

const HOMOGLYPH_MAP: Readonly<Record<string, string>> = {
  "0": "o", "1": "l", "3": "e", "4": "a", "5": "s",
  "7": "t", "8": "b", "9": "g",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailAnalysisDetails {
  readonly localPart: string;
  readonly domain: string;
  readonly isTrustedDomain: boolean;
  readonly isDisposable: boolean;
  readonly isKnownScam: boolean;
  readonly hasSpoofing: boolean;
  readonly hasNumericPattern: boolean;
  readonly hasSuspiciousTLD: boolean;
  readonly isValidFormat: boolean;
  readonly scamTypes: readonly ScamType[];
}

// ─── Validation de format ─────────────────────────────────────────────────────

// Compilée une seule fois
const EMAIL_FORMAT_RE = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

// ─── Analyse principale ───────────────────────────────────────────────────────

export function analyzeEmail(email: string): {
  regex: RegexResult;
  details: EmailAnalysisDetails;
  score: number;
  scamTypes: ScamType[];
} {
  const regexResult = analyzeWithRegex(email, "email");
  const details = parseEmail(email);

  let delta = 0;
  const scamTypes = new Set<ScamType>(details.scamTypes);

  if (!details.isValidFormat)  { delta += 30; scamTypes.add("social-engineering"); }
  if (details.isDisposable)    { delta += 25; scamTypes.add("social-engineering"); }
  if (details.isKnownScam)     { delta += 40; scamTypes.add("phishing"); }
  if (details.hasSpoofing)     { delta += 35; scamTypes.add("impersonation"); }
  if (details.hasNumericPattern) delta += 10;
  if (details.hasSuspiciousTLD)  delta += 10;
  if (details.isTrustedDomain)   delta -= 20;

  const finalScore = Math.max(0, Math.min(100, regexResult.score + delta));

  if (scamTypes.size === 0 && finalScore > 50) scamTypes.add("phishing");

  return {
    regex: regexResult,
    details,
    score: finalScore,
    scamTypes: Array.from(scamTypes),
  };
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parseEmail(email: string): EmailAnalysisDetails {
  const match = EMAIL_FORMAT_RE.exec(email);

  if (!match) {
    return {
      localPart: email,
      domain: "",
      isTrustedDomain: false,
      isDisposable: false,
      isKnownScam: false,
      hasSpoofing: false,
      hasNumericPattern: false,
      hasSuspiciousTLD: true,
      isValidFormat: false,
      scamTypes: ["social-engineering"],
    };
  }

  const localPart = match[1];
  const domain    = match[2].toLowerCase();
  const tld       = domain.split(".").pop() ?? "";
  const apex      = domain.split(".").slice(-2).join(".");

  return {
    localPart,
    domain,
    isTrustedDomain:   isTrustedDomain(domain) || TRUSTED_EMAIL_DOMAINS.has(domain),
    isDisposable:      DISPOSABLE_EMAIL_DOMAINS.has(domain) || DISPOSABLE_EMAIL_DOMAINS.has(apex),
    isKnownScam:       isKnownScamDomain(domain),
    hasSpoofing:       detectSpoofing(domain),
    hasNumericPattern: /\d{5,}/.test(localPart),
    hasSuspiciousTLD:  SUSPICIOUS_EMAIL_TLDS.has(tld),
    isValidFormat:     true,
    scamTypes: [],
  };
}

// ─── Détection de spoofing ────────────────────────────────────────────────────

function detectSpoofing(domain: string): boolean {
  const lower = domain.toLowerCase();

  // Correspondance exacte → pas de spoofing
  if (SPOOFING_TARGETS.includes(lower as (typeof SPOOFING_TARGETS)[number])) return false;

  // Substitution homoglyphe
  const normalized = lower.replaceAll(/[01345789]/g, (c) => HOMOGLYPH_MAP[c] ?? c);
  if (SPOOFING_TARGETS.includes(normalized as (typeof SPOOFING_TARGETS)[number])) return true;

  // Distance de Levenshtein ≤ 2
  return SPOOFING_TARGETS.some(
    (target) => lower !== target && levenshtein(lower, target) <= 2,
  );
}

/**
 * Distance de Levenshtein optimisée : une seule ligne de travail
 * au lieu d'une matrice 2D complète.
 * Complexité : O(|a| × |b|) mais empreinte mémoire O(min(|a|, |b|)).
 */
function levenshtein(a: string, b: string): number {
  // S'assurer que |a| ≤ |b| pour minimiser la mémoire
  if (a.length > b.length) [a, b] = [b, a];

  const row = Array.from({ length: a.length + 1 }, (_, i) => i);

  for (let j = 1; j <= b.length; j++) {
    let prev = j;
    for (let i = 1; i <= a.length; i++) {
      const val = b[j - 1] === a[i - 1]
        ? row[i - 1]
        : 1 + Math.min(row[i - 1], row[i], prev);
      row[i - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }

  return row[a.length];
}

// ─── Utilitaires exportés ─────────────────────────────────────────────────────

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  const apex = domain.split(".").slice(-2).join(".");
  return DISPOSABLE_EMAIL_DOMAINS.has(domain) || DISPOSABLE_EMAIL_DOMAINS.has(apex);
}

export function isValidEmailFormat(email: string): boolean {
  return EMAIL_FORMAT_RE.test(email);
}