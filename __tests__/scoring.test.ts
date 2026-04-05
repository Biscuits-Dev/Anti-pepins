import { scoreToRisk } from '@/lib/analyzer/constants';
import { calculateConfidence } from '@/lib/analyzer/scoring';
import type { RegexResult, AIResult } from '@/lib/analyzer/types';

// ─── scoreToRisk ──────────────────────────────────────────────────────────────
// Thresholds: safe [0-15], low [16-29], suspicious [30-50],
//             dangerous [51-75], critical [76-100]

describe('scoreToRisk', () => {
  it('retourne safe pour score 0',         () => expect(scoreToRisk(0)).toBe('safe'));
  it('retourne safe pour score 15',        () => expect(scoreToRisk(15)).toBe('safe'));
  it('retourne low pour score 16',         () => expect(scoreToRisk(16)).toBe('low'));
  it('retourne low pour score 29',         () => expect(scoreToRisk(29)).toBe('low'));
  it('retourne suspicious pour 30',        () => expect(scoreToRisk(30)).toBe('suspicious'));
  it('retourne suspicious pour 50',        () => expect(scoreToRisk(50)).toBe('suspicious'));
  it('retourne dangerous pour 51',         () => expect(scoreToRisk(51)).toBe('dangerous'));
  it('retourne dangerous pour 75',         () => expect(scoreToRisk(75)).toBe('dangerous'));
  it('retourne critical pour 76',          () => expect(scoreToRisk(76)).toBe('critical'));
  it('retourne critical pour 100',         () => expect(scoreToRisk(100)).toBe('critical'));
});

// ─── calculateConfidence ──────────────────────────────────────────────────────

describe('calculateConfidence', () => {
  // Construit un RegexResult minimal valide selon lib/analyzer/types.ts
  // RegexTrigger: { type, pattern, match, severity, description }
  const makeTrigger = (n: number): RegexResult['triggers'][number][] =>
    Array.from({ length: n }, () => ({
      type: 'suspicious-keyword',
      pattern: 'test',
      match: 'test',
      severity: 'medium' as const,
      description: 'test trigger',
    }));

  const makeRegex = (score: number, triggerCount = 0): RegexResult => ({
    score,
    triggers: makeTrigger(triggerCount),
    details: {},
  });

  const makeAI = (score: number, confidence: number): AIResult => ({
    score,
    risk: 'suspicious',
    type: 'phishing',
    explanation: 'test',
    confidence,
    language: 'fr',
    indicators: [],
  });

  it('retourne une valeur entre 0 et 100', () => {
    const conf = calculateConfidence(makeRegex(50, 2), makeAI(50, 80));
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(100);
  });

  it('fonctionne sans résultat AI (null)', () => {
    const conf = calculateConfidence(makeRegex(50, 1), null);
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(100);
  });

  it('retourne un entier', () => {
    const conf = calculateConfidence(makeRegex(60, 3), makeAI(70, 90));
    expect(Number.isInteger(conf)).toBe(true);
  });

  it('sans trigger et sans AI retourne 15 (défaut IA uniquement)', () => {
    // fromRegex = min(30, 0*10) = 0, fromAI = 15 (défaut) => total = 15
    const conf = calculateConfidence(makeRegex(0, 0), null);
    expect(conf).toBe(15);
  });

  it('3 triggers sans AI retourne 30 + 15 = 45', () => {
    // fromRegex = min(30, 3*10) = 30, fromAI = 15 => total = 45
    const conf = calculateConfidence(makeRegex(50, 3), null);
    expect(conf).toBe(45);
  });

  it('4+ triggers plafonnent fromRegex à 30', () => {
    const conf5 = calculateConfidence(makeRegex(50, 5), null);
    const conf4 = calculateConfidence(makeRegex(50, 4), null);
    // Les deux = 30 + 15 = 45
    expect(conf5).toBe(45);
    expect(conf4).toBe(45);
  });
});
