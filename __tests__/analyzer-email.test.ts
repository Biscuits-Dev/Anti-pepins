/**
 * @file analyzer-email.test.ts
 * Tests pour lib/analyzer/email.ts — isValidEmailFormat, isDisposableEmail,
 * analyzeEmail.
 */

import { isValidEmailFormat, isDisposableEmail, analyzeEmail } from '@/lib/analyzer/email';

// ─── isValidEmailFormat ───────────────────────────────────────────────────────

describe('isValidEmailFormat', () => {
  it('retourne true pour un email valide simple', () => {
    expect(isValidEmailFormat('user@example.com')).toBe(true);
  });

  it('retourne true pour un email avec sous-domaine', () => {
    expect(isValidEmailFormat('user@mail.google.com')).toBe(true);
  });

  it('retourne true pour un email avec tirets et points', () => {
    expect(isValidEmailFormat('first.last+tag@my-domain.fr')).toBe(true);
  });

  it('retourne false si pas de @', () => {
    expect(isValidEmailFormat('notanemail.com')).toBe(false);
  });

  it('retourne false si la partie domaine est absente', () => {
    expect(isValidEmailFormat('user@')).toBe(false);
  });

  it('retourne false pour une chaîne vide', () => {
    expect(isValidEmailFormat('')).toBe(false);
  });
});

// ─── isDisposableEmail ────────────────────────────────────────────────────────

describe('isDisposableEmail', () => {
  it('retourne true pour mailinator.com', () => {
    expect(isDisposableEmail('test@mailinator.com')).toBe(true);
  });

  it('retourne true pour yopmail.com', () => {
    expect(isDisposableEmail('random@yopmail.com')).toBe(true);
  });

  it('retourne true pour tempmail.com', () => {
    expect(isDisposableEmail('abc@tempmail.com')).toBe(true);
  });

  it('retourne false pour gmail.com', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false);
  });

  it('retourne false pour outlook.com', () => {
    expect(isDisposableEmail('contact@outlook.com')).toBe(false);
  });

  it('retourne false si pas de domaine (@)', () => {
    expect(isDisposableEmail('invalid')).toBe(false);
  });
});

// ─── analyzeEmail ─────────────────────────────────────────────────────────────

describe('analyzeEmail', () => {
  it('retourne un objet avec regex, details, score, scamTypes', () => {
    const result = analyzeEmail('user@gmail.com');
    expect(result).toHaveProperty('regex');
    expect(result).toHaveProperty('details');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('scamTypes');
  });

  it('score entre 0 et 100', () => {
    const result = analyzeEmail('user@mailinator.com');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('email légitime (gmail.com) → score faible (≤ 30)', () => {
    const result = analyzeEmail('alice@gmail.com');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('email légitime → details.isTrustedDomain = true', () => {
    const result = analyzeEmail('alice@gmail.com');
    expect(result.details.isTrustedDomain).toBe(true);
  });

  it('email jetable (mailinator.com) → details.isDisposable = true', () => {
    const result = analyzeEmail('test@mailinator.com');
    expect(result.details.isDisposable).toBe(true);
  });

  it('email jetable → score élevé (> 20)', () => {
    const result = analyzeEmail('test@mailinator.com');
    expect(result.score).toBeGreaterThan(20);
  });

  it('email jetable → scamTypes contient "social-engineering"', () => {
    const result = analyzeEmail('test@mailinator.com');
    expect(result.scamTypes).toContain('social-engineering');
  });

  it('email avec homoglyph sur gmail (gmai1.com) → hasSpoofing = true', () => {
    // gmai1.com : "1" → "l" donne "gmail.com" par normalisation homoglyph
    const result = analyzeEmail('hacker@gmai1.com');
    expect(result.details.hasSpoofing).toBe(true);
  });

  it('email avec spoofing → score élevé', () => {
    const result = analyzeEmail('hacker@gmai1.com');
    expect(result.score).toBeGreaterThan(20);
  });

  it('email invalide (pas de @) → details.isValidFormat = false', () => {
    const result = analyzeEmail('ceci-nest-pas-un-email');
    expect(result.details.isValidFormat).toBe(false);
  });

  it('email invalide → scamTypes contient "social-engineering"', () => {
    const result = analyzeEmail('ceci-nest-pas-un-email');
    expect(result.scamTypes).toContain('social-engineering');
  });

  it('scamTypes est un tableau', () => {
    const result = analyzeEmail('user@gmail.com');
    expect(Array.isArray(result.scamTypes)).toBe(true);
  });
});
