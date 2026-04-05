import { sanitizeInput } from '@/lib/api-helpers';

describe('sanitizeInput', () => {
  it('supprime les balises HTML (conserve le contenu entre les balises)', () => {
    // La regex /<[^>]*>/g retire les tags mais pas leur contenu
    expect(sanitizeInput('<script>alert(1)</script>texte')).toBe('alert(1)texte');
  });

  it('supprime les balises HTML imbriquées (conserve le texte)', () => {
    expect(sanitizeInput('<b><i>texte</i></b>')).toBe('texte');
  });

  it('supprime les caractères de contrôle', () => {
    expect(sanitizeInput('texte\x00\x1F normal')).toBe('texte normal');
  });

  it('trim et normalise les espaces multiples', () => {
    expect(sanitizeInput('  hello   world  ')).toBe('hello world');
  });

  it('conserve le texte propre intact', () => {
    expect(sanitizeInput('Bonjour, je suis un message normal.')).toBe(
      'Bonjour, je suis un message normal.',
    );
  });

  it('remplace les entités HTML par des espaces (toutes les occurrences)', () => {
    // &amp; → ' ', &lt; → ' ', &gt; → ' ' puis normalisation des espaces
    expect(sanitizeInput('AT&amp;T &lt;cool&gt;')).toBe('AT T cool');
  });

  it('gère une chaîne vide', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('gère une chaîne avec uniquement des espaces', () => {
    expect(sanitizeInput('   ')).toBe('');
  });
});
