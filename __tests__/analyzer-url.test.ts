/**
 * @file analyzer-url.test.ts
 * Tests pour lib/analyzer/url.ts — extractDomain, isTrustedDomain,
 * isKnownScamDomain, analyzeURL.
 */

import { extractDomain, isTrustedDomain, isKnownScamDomain, analyzeURL } from '@/lib/analyzer/url';

// ─── extractDomain ────────────────────────────────────────────────────────────

describe('extractDomain', () => {
  it('extrait le hostname depuis une URL https', () => {
    expect(extractDomain('https://google.com/search?q=test')).toBe('google.com');
  });

  it('extrait le hostname depuis une URL http', () => {
    expect(extractDomain('http://example.com/page')).toBe('example.com');
  });

  it('ajoute https:// si pas de schéma', () => {
    expect(extractDomain('paypal.com')).toBe('paypal.com');
  });

  it('retourne le hostname en minuscules', () => {
    expect(extractDomain('https://GOOGLE.COM')).toBe('google.com');
  });

  it('inclut le sous-domaine dans le hostname', () => {
    expect(extractDomain('https://mail.google.com')).toBe('mail.google.com');
  });

  it('retourne la valeur brute en minuscules si URL invalide', () => {
    expect(extractDomain('pas une url valide !!')).toBe('pas une url valide !!');
  });
});

// ─── isTrustedDomain ──────────────────────────────────────────────────────────

describe('isTrustedDomain', () => {
  it('retourne true pour google.com', () => {
    expect(isTrustedDomain('google.com')).toBe(true);
  });

  it('retourne true pour paypal.com', () => {
    expect(isTrustedDomain('paypal.com')).toBe(true);
  });

  it('retourne true pour github.com', () => {
    expect(isTrustedDomain('github.com')).toBe(true);
  });

  it('retourne false pour un domaine inconnu', () => {
    expect(isTrustedDomain('domaine-inconnu-xyz.com')).toBe(false);
  });

  it('est insensible à la casse', () => {
    expect(isTrustedDomain('GOOGLE.COM')).toBe(true);
  });

  it('retourne false pour un domaine spoofé', () => {
    expect(isTrustedDomain('g00gle.com')).toBe(false);
  });
});

// ─── isKnownScamDomain ────────────────────────────────────────────────────────

describe('isKnownScamDomain', () => {
  it('retourne true pour amaz0n.com (spoofing Amazon)', () => {
    expect(isKnownScamDomain('amaz0n.com')).toBe(true);
  });

  it('retourne true pour g00gle.com (spoofing Google) bis', () => {
    expect(isKnownScamDomain('g00gle.com')).toBe(true);
  });

  it('retourne true pour g00gle.com (spoofing Google)', () => {
    expect(isKnownScamDomain('g00gle.com')).toBe(true);
  });

  it('retourne false pour google.com (domaine légitime)', () => {
    expect(isKnownScamDomain('google.com')).toBe(false);
  });

  it('retourne false pour un domaine quelconque inconnu', () => {
    expect(isKnownScamDomain('example.com')).toBe(false);
  });

  it('est insensible à la casse', () => {
    expect(isKnownScamDomain('AMAZ0N.COM')).toBe(true);
  });
});

// ─── analyzeURL ───────────────────────────────────────────────────────────────

describe('analyzeURL', () => {
  it('retourne un objet avec les propriétés regex, details, score, scamTypes', () => {
    const result = analyzeURL('https://google.com');
    expect(result).toHaveProperty('regex');
    expect(result).toHaveProperty('details');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('scamTypes');
  });

  it('score entre 0 et 100', () => {
    const result = analyzeURL('https://amaz0n.com/verify');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('URL légitime (google.com) → score faible (≤ 30)', () => {
    const result = analyzeURL('https://google.com');
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it('URL légitime (paypal.com) → details.isTrustedDomain = true', () => {
    const result = analyzeURL('https://paypal.com');
    expect(result.details.isTrustedDomain).toBe(true);
  });

  it('domaine arnaque connu (amaz0n.com) → score élevé (> 50)', () => {
    const result = analyzeURL('https://amaz0n.com');
    expect(result.score).toBeGreaterThan(50);
  });

  it('domaine arnaque connu → scamTypes contient "phishing"', () => {
    const result = analyzeURL('https://amaz0n.com');
    expect(result.scamTypes).toContain('phishing');
  });

  it('URL raccourcie (bit.ly) → details.isShortened = true', () => {
    const result = analyzeURL('https://bit.ly/abc123');
    expect(result.details.isShortened).toBe(true);
  });

  it('URL raccourcie (bit.ly) → score modéré (> 10)', () => {
    const result = analyzeURL('https://bit.ly/abc123');
    expect(result.score).toBeGreaterThan(10);
  });

  it('URL avec sous-domaine suspect (paypal.malicious.com) → hasSuspiciousSubdomain = true', () => {
    const result = analyzeURL('https://paypal.malicious.com/login');
    expect(result.details.hasSuspiciousSubdomain).toBe(true);
  });

  it('URL avec IP → details.isIP = true et score élevé', () => {
    const result = analyzeURL('http://192.168.1.1/login');
    expect(result.details.isIP).toBe(true);
    expect(result.score).toBeGreaterThan(20);
  });

  it('URL avec credentials → details.hasCredentials = true', () => {
    const result = analyzeURL('http://user:pass@malicious.xyz/page');
    expect(result.details.hasCredentials).toBe(true);
  });

  it('URL invalide → details.hasSuspiciousTLD = true', () => {
    const result = analyzeURL('pas-une-url');
    expect(result.details.hasSuspiciousTLD).toBe(true);
  });

  it('URL avec paramètre suspect (redirect) → hasSuspiciousParams = true', () => {
    const result = analyzeURL('https://example.com/?redirect=http://evil.com');
    expect(result.details.hasSuspiciousParams).toBe(true);
  });

  it('scamTypes est un tableau', () => {
    const result = analyzeURL('https://google.com');
    expect(Array.isArray(result.scamTypes)).toBe(true);
  });
});
