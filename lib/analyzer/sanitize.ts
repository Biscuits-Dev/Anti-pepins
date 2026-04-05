/**
 * @file sanitize.ts
 * Sanitisation et validation stricte de toutes les entrées utilisateur.
 *
 * Toutes les valeurs passent par ce module AVANT toute analyse,
 * ce qui protège contre les injections, les attaques ReDoS et les
 * données malformées.
 */

import type { AnalyzableType, SanitizedString } from "./types";

// ─── Limites de taille ────────────────────────────────────────────────────────

const MAX_LENGTHS: Readonly<Record<AnalyzableType, number>> = {
  url:     2_048,
  email:     320,
  phone:      30,
  message: 10_000,
  text:    10_000,
};

// ─── Erreurs métier ───────────────────────────────────────────────────────────

export class SanitizationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = "SanitizationError";
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Sanitise une entrée selon son type et retourne une SanitizedString.
 * Lance une SanitizationError si la valeur est invalide.
 */
export function sanitize(raw: string, type: AnalyzableType): SanitizedString {
  if (typeof raw !== "string") {
    throw new SanitizationError("La valeur doit être une chaîne de caractères.", "value");
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    throw new SanitizationError("La valeur ne peut pas être vide.", "value");
  }

  const maxLen = MAX_LENGTHS[type];
  if (trimmed.length > maxLen) {
    throw new SanitizationError(
      `Valeur trop longue (max ${maxLen} caractères pour le type ${type}).`,
      "value",
    );
  }

  // Suppression des caractères de contrôle (U+0000–U+001F sauf \t\n\r)
  // Protège contre les attaques par injection de null bytes et autres
  const sanitized = trimmed.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized as SanitizedString;
}

/**
 * Sanitise un contexte optionnel (limité à 2 000 chars, moins critique).
 */
export function sanitizeContext(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  return raw.trim().substring(0, 2_000).replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Vérifie si une chaîne dépasse la limite de temps d'exécution regex
 * en détectant les patterns qui pourraient provoquer un ReDoS.
 *
 * Règle simple : on refuse les chaînes contenant des répétitions
 * imbriquées pathologiques (> 200 répétitions d'un même caractère consécutif).
 */
export function isReDoSSafe(value: string): boolean {
  return !/(.)\1{200,}/.test(value);
}