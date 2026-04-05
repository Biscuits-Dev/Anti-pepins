import { NextResponse } from 'next/server';

/**
 * Supprime les balises HTML, les entités HTML et les caractères de contrôle.
 * Utilisé dans toutes les routes API avant insertion en base.
 */
export function sanitizeInput(value: string): string {
  return value
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/&[a-z]+;/gi, ' ')
    .replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export const API_HEADERS = {
  'Content-Type':           'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control':          'no-store',
} as const;

export function jsonResponse(
  body: object,
  status: number,
  extra?: Record<string, string>,
): NextResponse {
  return NextResponse.json(body, { status, headers: { ...API_HEADERS, ...extra } });
}
