/**
 * @file analyzer-database.test.ts
 * Tests pour les fonctions synchrones de lib/analyzer/database.ts.
 *
 * On mock @/lib/supabase/server pour éviter les appels réseau et les erreurs
 * de variables d'environnement manquantes.
 */

// Mock Supabase server avant tout import de database.ts
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
      update: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
      order: jest.fn(() => ({
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      })),
    })),
  })),
}));

import {
  resetDatabase,
  isInBlacklist,
  isInWhitelist,
  getBlacklist,
  getWhitelist,
} from '@/lib/analyzer/database';

// ─── resetDatabase + valeurs par défaut ───────────────────────────────────────

describe('resetDatabase', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('getBlacklist retourne les entrées par défaut après reset', () => {
    const bl = getBlacklist();
    expect(bl.length).toBeGreaterThanOrEqual(3);
  });

  it('getWhitelist retourne les entrées par défaut après reset', () => {
    const wl = getWhitelist();
    expect(wl.length).toBeGreaterThanOrEqual(5);
  });

  it('les entrées de la blacklist par défaut contiennent amaz0n.com', () => {
    const bl = getBlacklist();
    const values = bl.map((e) => e.value);
    expect(values).toContain('amaz0n.com');
  });

  it('les entrées de la blacklist contiennent au moins un domaine spoofé', () => {
    const bl = getBlacklist();
    // amaz0n.com, g00gle.com ou paypaI.com
    const hasSpoofed = bl.some((e) =>
      ['amaz0n.com', 'g00gle.com', 'paypaI.com'].includes(e.value),
    );
    expect(hasSpoofed).toBe(true);
  });

  it('les entrées de la whitelist par défaut contiennent google.com', () => {
    const wl = getWhitelist();
    const values = wl.map((e) => e.value);
    expect(values).toContain('google.com');
  });

  it('les entrées de la whitelist contiennent paypal.com', () => {
    const wl = getWhitelist();
    const values = wl.map((e) => e.value);
    expect(values).toContain('paypal.com');
  });
});

// ─── isInBlacklist ────────────────────────────────────────────────────────────

describe('isInBlacklist', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('retourne true pour amaz0n.com (présent par défaut)', () => {
    expect(isInBlacklist('amaz0n.com')).toBe(true);
  });

  it('retourne true pour g00gle.com (présent par défaut)', () => {
    expect(isInBlacklist('g00gle.com')).toBe(true);
  });

  it('retourne false pour google.com (domaine légitime, pas en blacklist)', () => {
    expect(isInBlacklist('google.com')).toBe(false);
  });

  it('retourne false pour un domaine inconnu quelconque', () => {
    expect(isInBlacklist('domaine-inconnu-test.net')).toBe(false);
  });

  it('normalise : https:// est ignoré', () => {
    expect(isInBlacklist('https://amaz0n.com')).toBe(true);
  });

  it('normalise : www. est ignoré', () => {
    expect(isInBlacklist('www.amaz0n.com')).toBe(true);
  });
});

// ─── isInWhitelist ────────────────────────────────────────────────────────────

describe('isInWhitelist', () => {
  beforeEach(() => {
    resetDatabase();
  });

  it('retourne true pour google.com (présent par défaut)', () => {
    expect(isInWhitelist('google.com')).toBe(true);
  });

  it('retourne true pour paypal.com (présent par défaut)', () => {
    expect(isInWhitelist('paypal.com')).toBe(true);
  });

  it('retourne true pour amazon.com (présent par défaut)', () => {
    expect(isInWhitelist('amazon.com')).toBe(true);
  });

  it('retourne false pour un domaine inconnu', () => {
    expect(isInWhitelist('domaine-inconnu-xyz.com')).toBe(false);
  });

  it('normalise : https:// est ignoré', () => {
    expect(isInWhitelist('https://google.com')).toBe(true);
  });

  it('normalise : www. est ignoré', () => {
    expect(isInWhitelist('www.google.com')).toBe(true);
  });

  it('retourne false pour amaz0n.com (en blacklist, pas whitelist)', () => {
    expect(isInWhitelist('amaz0n.com')).toBe(false);
  });
});
