/**
 * @file url.ts
 * Analyse structurelle des URLs pour détecter le phishing et le domain spoofing.
 */

import type { RegexResult, ScamType } from "./types";
import { analyzeWithRegex } from "./regex";
import { TRUSTED_DOMAINS, TRUSTED_TLDS, KNOWN_SCAM_DOMAINS } from "./constants";

// ─── Services de raccourcissement connus ──────────────────────────────────────

const SHORTENER_HOSTS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl",
  "ow.ly", "is.gd", "cutt.ly", "rebrand.ly",
]);

// ─── Sous-domaines qui usurpent des marques connues ───────────────────────────

const BRAND_SUBDOMAIN_KEYWORDS = [
  "paypal", "amazon", "google", "apple", "microsoft",
  "facebook", "netflix", "impots", "ameli", "laposte",
] as const;

// ─── Paramètres de query suspects ─────────────────────────────────────────────

const SUSPICIOUS_PARAMS = new Set([
  "cmd", "exec", "command", "eval", "script",
  "javascript", "onerror", "onload", "redirect", "url", "next", "return",
]);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface URLAnalysisDetails {
  readonly domain: string;
  readonly subdomain: string;
  readonly tld: string;
  readonly isTrustedDomain: boolean;
  readonly isKnownScam: boolean;
  readonly hasSuspiciousTLD: boolean;
  readonly hasSuspiciousSubdomain: boolean;
  readonly isShortened: boolean;
  readonly isIP: boolean;
  readonly hasCredentials: boolean;
  readonly hasSuspiciousParams: boolean;
  readonly protocol: string;
  readonly scamTypes: readonly ScamType[];
}

// ─── Analyse principale ───────────────────────────────────────────────────────

export function analyzeURL(url: string): {
  regex: RegexResult;
  details: URLAnalysisDetails;
  score: number;
  scamTypes: ScamType[];
} {
  const regexResult = analyzeWithRegex(url, "url");
  const details = parseURL(url);

  let delta = 0;
  const scamTypes = new Set<ScamType>(details.scamTypes);

  if (details.isTrustedDomain)        delta -= 30;
  if (details.isKnownScam)          { delta += 50; scamTypes.add("phishing"); }
  if (details.hasSuspiciousTLD)       delta += 15;
  if (details.hasSuspiciousSubdomain){ delta += 20; scamTypes.add("phishing"); }
  if (details.isShortened)            delta += 10;
  if (details.isIP)                 { delta += 25; scamTypes.add("phishing"); }
  if (details.hasCredentials)       { delta += 20; scamTypes.add("phishing"); }
  if (details.hasSuspiciousParams)    delta += 15;
  if (details.protocol === "http:" && !details.isTrustedDomain) delta += 5;

  const finalScore = Math.max(0, Math.min(100, regexResult.score + delta));

  // Type par défaut si aucun détecté
  if (scamTypes.size === 0) {
    if (finalScore > 50)      scamTypes.add("phishing");
    else if (finalScore > 25) scamTypes.add("fake-website");
  }

  return {
    regex: regexResult,
    details,
    score: finalScore,
    scamTypes: Array.from(scamTypes),
  };
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

function parseURL(rawUrl: string): URLAnalysisDetails {
  let parsed: URL;

  try {
    const withScheme = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;
    parsed = new URL(withScheme);
  } catch {
    return {
      domain: rawUrl,
      subdomain: "",
      tld: "",
      isTrustedDomain: false,
      isKnownScam: false,
      hasSuspiciousTLD: true,
      hasSuspiciousSubdomain: false,
      isShortened: false,
      isIP: false,
      hasCredentials: false,
      hasSuspiciousParams: false,
      protocol: "invalid",
      scamTypes: ["fake-website"],
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const parts    = hostname.split(".");
  const tld      = parts.at(-1) ?? "";
  const apex     = parts.length >= 2 ? `${parts.at(-2)}.${tld}` : hostname;
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join(".") : "";

  const isTrusted     = TRUSTED_DOMAINS.has(hostname) || TRUSTED_DOMAINS.has(apex);
  const isKnownScam   = KNOWN_SCAM_DOMAINS.has(hostname) || KNOWN_SCAM_DOMAINS.has(apex);
  const isIP          = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isShortened   = SHORTENER_HOSTS.has(apex);
  const hasCredentials = parsed.username.length > 0 || parsed.password.length > 0;

  const hasSuspiciousSubdomain = subdomain.length > 0 &&
    BRAND_SUBDOMAIN_KEYWORDS.some((kw) => subdomain.includes(kw));

  const hasSuspiciousParams = Array.from(parsed.searchParams.keys()).some(
    (k) => SUSPICIOUS_PARAMS.has(k.toLowerCase()),
  );

  return {
    domain: apex,
    subdomain,
    tld,
    isTrustedDomain:       isTrusted,
    isKnownScam,
    hasSuspiciousTLD:      !TRUSTED_TLDS.has(tld),
    hasSuspiciousSubdomain,
    isShortened,
    isIP,
    hasCredentials,
    hasSuspiciousParams,
    protocol:              parsed.protocol,
    scamTypes: [],
  };
}

// ─── Utilitaires exportés ─────────────────────────────────────────────────────

export function isTrustedDomain(domain: string): boolean {
  return TRUSTED_DOMAINS.has(domain.toLowerCase());
}

export function isKnownScamDomain(domain: string): boolean {
  return KNOWN_SCAM_DOMAINS.has(domain.toLowerCase());
}

export function extractDomain(url: string): string {
  try {
    const withScheme = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
    return new URL(withScheme).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}