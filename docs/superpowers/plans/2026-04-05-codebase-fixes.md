# Correctifs codebase Anti-Pépins — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 6 problèmes majeurs identifiés lors de l'audit du projet open-source Anti-Pépins.

**Architecture:** Corrections incrémentales sans réécriture — chaque tâche est indépendante et committable seule.

**Tech Stack:** Next.js 16 App Router · TypeScript · Supabase · Upstash Redis · Jest

---

## Fichiers modifiés / créés

| Fichier | Action | Responsabilité |
|---|---|---|
| `types/supabase.ts` | Modifier | Ajouter table `reports` manquante |
| `app/api/report/route.ts` | Modifier | Supprimer `as any`, utiliser types propres |
| `app/api/contact/route.ts` | Modifier | Supprimer `@ts-ignore` |
| `app/api/temoignage/route.ts` | Modifier | Supprimer `as any` |
| `lib/api-helpers.ts` | Créer | `sanitizeInput()`, `HEADERS`, `jsonResponse()` centralisés |
| `lib/validation/report.ts` | Modifier | Importer `sanitizeInput` depuis api-helpers |
| `lib/ratelimit/index.ts` | Modifier | Fail-closed en production |
| `lib/analyzer/database.ts` | Modifier | Fonctions async + sync Supabase |
| `lib/analyzer/index.ts` | Modifier | `await` sur les appels blacklist/whitelist |
| `app/api/analyze/route.ts` | Modifier | Init DB depuis Supabase au démarrage |
| `jest.config.ts` | Créer | Configuration Jest avec ts-jest |
| `__tests__/sanitize.test.ts` | Créer | Tests unitaires sanitize |
| `__tests__/scoring.test.ts` | Créer | Tests unitaires scoring |
| `__tests__/ratelimit.test.ts` | Créer | Tests unitaires rate limiting |
| `CONTRIBUTING.md` | Créer | Guide de contribution |

---

## Tâche 1 — Ajouter la table `reports` aux types Supabase + supprimer les `as any`

**Pourquoi :** `types/supabase.ts` ne contient pas la table `reports`, forçant un `as any` dans `app/api/report/route.ts`. Les tables `contacts` et `temoignages` sont bien définies mais ont aussi des `as any` / `@ts-ignore` inutiles.

**Fichiers :**
- Modifier : `types/supabase.ts`
- Modifier : `app/api/report/route.ts`
- Modifier : `app/api/contact/route.ts`
- Modifier : `app/api/temoignage/route.ts`

- [ ] **Étape 1 : Ajouter la table `reports` dans `types/supabase.ts`**

Insérer avant la ligne `chat_messages` (ligne 81) :

```typescript
      reports: {
        Row: {
          id: string;
          scam_type: string;
          incident_date: string;
          description: string;
          amount: number | null;
          contact_email: string | null;
          receive_copy: boolean;
          need_help: boolean;
          ip_address: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scam_type: string;
          incident_date: string;
          description: string;
          amount?: number | null;
          contact_email?: string | null;
          receive_copy?: boolean;
          need_help?: boolean;
          ip_address: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scam_type?: string;
          incident_date?: string;
          description?: string;
          amount?: number | null;
          contact_email?: string | null;
          receive_copy?: boolean;
          need_help?: boolean;
          ip_address?: string;
          user_agent?: string | null;
          created_at?: string;
        };
      };
```

- [ ] **Étape 2 : Supprimer `as any` dans `app/api/report/route.ts` (ligne 54)**

Remplacer :
```typescript
const { error: dbError } = await (supabase as any)
  .from('reports')
  .insert({
```
Par :
```typescript
const { error: dbError } = await supabase
  .from('reports')
  .insert({
```
Supprimer aussi le commentaire `// eslint-disable-next-line @typescript-eslint/no-explicit-any` au-dessus.

- [ ] **Étape 3 : Supprimer `@ts-ignore` dans `app/api/contact/route.ts` (lignes 93-94)**

Remplacer :
```typescript
    const { error: dbError } = await supabase
      .from('contacts')
      // @ts-ignore Supabase types
      .insert({
```
Par :
```typescript
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
```

- [ ] **Étape 4 : Supprimer `as any` dans `app/api/temoignage/route.ts` (ligne 100)**

Remplacer :
```typescript
  const { error: dbError } = await (supabase as any).from('temoignages').insert({
```
Par :
```typescript
  const { error: dbError } = await supabase.from('temoignages').insert({
```
Supprimer le commentaire `// eslint-disable-next-line @typescript-eslint/no-explicit-any` au-dessus.

- [ ] **Étape 5 : Vérifier que TypeScript compile sans erreur**

```bash
cd /home/sweetosky/Documents/htdoc/Anti-pepins
npx tsc --noEmit
```
Résultat attendu : aucune erreur liée aux types Supabase dans ces fichiers.

- [ ] **Étape 6 : Commit**

```bash
git add types/supabase.ts app/api/report/route.ts app/api/contact/route.ts app/api/temoignage/route.ts
git commit -m "fix: add reports table to Supabase types, remove as-any casts in API routes"
```

---

## Tâche 2 — Centraliser les helpers API

**Pourquoi :** `sanitizeString()` est définie 3 fois (`contact/route.ts`, `temoignage/route.ts`, `lib/validation/report.ts`). `HEADERS` et `json()` sont dupliqués dans `contact` et `report`. Un bug corrigé dans une copie ne se propage pas aux autres.

**Fichiers :**
- Créer : `lib/api-helpers.ts`
- Modifier : `app/api/contact/route.ts`
- Modifier : `app/api/report/route.ts` (indirectement via validation)
- Modifier : `app/api/temoignage/route.ts`
- Modifier : `lib/validation/report.ts`

- [ ] **Étape 1 : Créer `lib/api-helpers.ts`**

```typescript
// lib/api-helpers.ts
import { NextResponse } from 'next/server';

/**
 * Supprime les balises HTML et les caractères de contrôle.
 * Utilisé dans toutes les routes API avant insertion en base.
 */
export function sanitizeInput(value: string): string {
  return value
    .replaceAll(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
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
```

- [ ] **Étape 2 : Mettre à jour `app/api/contact/route.ts`**

Remplacer :
```typescript
function sanitize(value: string): string {
  return value
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
```
et :
```typescript
const HEADERS = {
  'Content-Type':           'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control':          'no-store',
} as const;

function json(body: object, status: number, extra?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { ...HEADERS, ...extra } });
}
```

Par cet import en haut du fichier (après les imports existants) :
```typescript
import { sanitizeInput, jsonResponse as json } from '@/lib/api-helpers';
```

Et dans le schéma Zod, remplacer `.transform(sanitize)` par `.transform(sanitizeInput)`.

- [ ] **Étape 3 : Mettre à jour `app/api/report/route.ts`**

Ajouter après les imports existants :
```typescript
import { jsonResponse as json } from '@/lib/api-helpers';
```

Supprimer les lignes :
```typescript
const HEADERS = {
  'Content-Type':           'application/json',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control':          'no-store',
} as const;

function json(body: object, status: number, extra?: Record<string, string>) {
  return NextResponse.json(body, { status, headers: { ...HEADERS, ...extra } });
}
```

- [ ] **Étape 4 : Mettre à jour `app/api/temoignage/route.ts`**

Remplacer :
```typescript
function sanitizeString(value: string): string {
  return value
    .replaceAll(/<[^>]*>/g, '')
    .replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}
```
Par :
```typescript
import { sanitizeInput as sanitizeString } from '@/lib/api-helpers';
```
(ajouter dans les imports en haut)

- [ ] **Étape 5 : Mettre à jour `lib/validation/report.ts`**

Remplacer :
```typescript
function sanitizeString(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}
```
Par :
```typescript
import { sanitizeInput as sanitizeString } from '@/lib/api-helpers';
```
(ajouter dans les imports en haut, supprimer la fonction locale)

- [ ] **Étape 6 : Vérifier la compilation**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreur.

- [ ] **Étape 7 : Commit**

```bash
git add lib/api-helpers.ts app/api/contact/route.ts app/api/report/route.ts app/api/temoignage/route.ts lib/validation/report.ts
git commit -m "refactor: centralize sanitizeInput, API_HEADERS, jsonResponse in lib/api-helpers"
```

---

## Tâche 3 — Rate limiting fail-closed en production

**Pourquoi :** Si Upstash est indisponible ou que le token expire en production, toutes les API deviennent sans limitation (DDoS possible). Le fail-open est acceptable en dev local, jamais en production.

**Fichiers :**
- Modifier : `lib/ratelimit/index.ts`

- [ ] **Étape 1 : Modifier le bloc catch dans `lib/ratelimit/index.ts` (lignes 57-62)**

Remplacer :
```typescript
  } catch (err) {
    // Upstash indisponible ou token sans permissions EVALSHA → on laisse passer
    // plutôt que de crasher toutes les routes. Logguer pour investiguer.
    console.error('[Ratelimit] Upstash error, fallback allow-all:', err);
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }
```
Par :
```typescript
  } catch (err) {
    console.error('[Ratelimit] Upstash error:', err);
    // En production : fail-closed pour éviter le DDoS si Redis est indisponible.
    // En dev : on laisse passer pour ne pas bloquer le développement local.
    if (process.env.NODE_ENV === 'production') {
      return { allowed: false, remaining: 0, resetAt: Date.now() + windowMs };
    }
    return { allowed: true, remaining: max - 1, resetAt: Date.now() + windowMs };
  }
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreur.

- [ ] **Étape 3 : Commit**

```bash
git add lib/ratelimit/index.ts
git commit -m "fix: rate limiting fails closed in production when Upstash is unavailable"
```

---

## Tâche 4 — Migrer blacklist/whitelist vers Supabase

**Pourquoi :** `lib/analyzer/database.ts` stocke blacklist, whitelist, historique dans des `Map` JavaScript. Tout est perdu à chaque déploiement. Les entrées ajoutées par les admins disparaissent. C'est le bug fonctionnel le plus grave du projet.

**Approche :** Hybride — les Maps restent comme cache en mémoire (lookups rapides), Supabase est la source de vérité. Au démarrage (cold start), les listes sont chargées depuis Supabase. Chaque écriture met à jour les deux.

**Fichiers :**
- Créer : `supabase/migrations/20260405_analyzer_lists.sql`
- Modifier : `types/supabase.ts`
- Modifier : `lib/analyzer/database.ts`
- Modifier : `lib/analyzer/index.ts`
- Modifier : `app/api/analyze/route.ts`

- [ ] **Étape 1 : Créer la migration SQL**

Créer `supabase/migrations/20260405_analyzer_lists.sql` :

```sql
-- Listes persistantes pour le moteur d'analyse anti-arnaque

CREATE TABLE IF NOT EXISTS analyzer_blacklist (
  id        uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  value     text        NOT NULL UNIQUE,
  type      text        NOT NULL,
  reason    text        NOT NULL,
  added_by  text        NOT NULL DEFAULT 'user',
  added_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analyzer_whitelist (
  id        uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  value     text        NOT NULL UNIQUE,
  type      text        NOT NULL,
  reason    text        NOT NULL,
  added_by  text        NOT NULL DEFAULT 'user',
  added_at  timestamptz NOT NULL DEFAULT now()
);

-- Activer RLS — seul le service role peut écrire
ALTER TABLE analyzer_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_whitelist ENABLE ROW LEVEL SECURITY;

-- Lecture publique (nécessaire pour l'analyse anonyme)
CREATE POLICY "lecture publique blacklist"  ON analyzer_blacklist FOR SELECT USING (true);
CREATE POLICY "lecture publique whitelist"  ON analyzer_whitelist FOR SELECT USING (true);

-- Écriture uniquement via service role (pas de politique INSERT/DELETE → bloqué sauf service role)

-- Données initiales (correspondant à DEFAULT_BLACKLIST / DEFAULT_WHITELIST)
INSERT INTO analyzer_blacklist (value, type, reason, added_by) VALUES
  ('amaz0n.com',  'url', 'Domain spoofing – imitation d''Amazon',  'system'),
  ('paypaI.com',  'url', 'Domain spoofing – imitation de PayPal',  'system'),
  ('g00gle.com',  'url', 'Domain spoofing – imitation de Google',  'system')
ON CONFLICT (value) DO NOTHING;

INSERT INTO analyzer_whitelist (value, type, reason, added_by) VALUES
  ('biscuits-ia.com',              'url', 'Domaine officiel Biscuits IA',                    'system'),
  ('anti-pepins.biscuits-ia.com',  'url', 'Domaine officiel Anti-Pépins',                    'system'),
  ('google.com',                   'url', 'Domaine de confiance',                             'system'),
  ('amazon.com',                   'url', 'Domaine de confiance',                             'system'),
  ('paypal.com',                   'url', 'Domaine de confiance',                             'system'),
  ('impots.gouv.fr',               'url', 'Site gouvernemental français',                     'system'),
  ('ameli.fr',                     'url', 'Site officiel de l''Assurance Maladie',            'system'),
  ('laposte.fr',                   'url', 'Site officiel de La Poste',                        'system'),
  ('service-public.fr',            'url', 'Portail officiel de l''administration française',  'system')
ON CONFLICT (value) DO NOTHING;
```

Exécuter la migration dans le dashboard Supabase (SQL Editor) ou via CLI :
```bash
# Si supabase CLI installé :
supabase db push
```

- [ ] **Étape 2 : Ajouter les tables dans `types/supabase.ts`**

Insérer avant la ligne `reports:` (après la clé `contacts`) :

```typescript
      analyzer_blacklist: {
        Row: {
          id: string;
          value: string;
          type: string;
          reason: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          value: string;
          type: string;
          reason: string;
          added_by?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          reason?: string;
          added_by?: string;
          added_at?: string;
        };
      };
      analyzer_whitelist: {
        Row: {
          id: string;
          value: string;
          type: string;
          reason: string;
          added_by: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          value: string;
          type: string;
          reason: string;
          added_by?: string;
          added_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          type?: string;
          reason?: string;
          added_by?: string;
          added_at?: string;
        };
      };
```

- [ ] **Étape 3 : Ajouter les fonctions Supabase dans `lib/analyzer/database.ts`**

En haut du fichier, ajouter l'import :
```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
```

Ajouter à la fin du fichier (avant `maskValue`) :

```typescript
// ─── Synchronisation Supabase ─────────────────────────────────────────────────

let _listsLoaded = false;

/**
 * Charge blacklist et whitelist depuis Supabase dans les Maps en mémoire.
 * Appelé une fois par cold start. Les Maps servent de cache rapide.
 */
export async function loadListsFromSupabase(): Promise<void> {
  if (_listsLoaded) return;
  try {
    const supabase = createServerSupabaseClient();
    const [bl, wl] = await Promise.all([
      supabase.from('analyzer_blacklist').select('value,type,reason,added_by,added_at'),
      supabase.from('analyzer_whitelist').select('value,type,reason,added_by,added_at'),
    ]);
    if (bl.data) {
      for (const row of bl.data) {
        db.blacklist.set(row.value, {
          value: row.value,
          type: row.type as import('./types').AnalyzableType,
          reason: row.reason,
          addedBy: row.added_by,
          addedAt: row.added_at,
        });
      }
    }
    if (wl.data) {
      for (const row of wl.data) {
        db.whitelist.set(row.value, {
          value: row.value,
          type: row.type as import('./types').AnalyzableType,
          reason: row.reason,
          addedBy: row.added_by,
          addedAt: row.added_at,
        });
      }
    }
    _listsLoaded = true;
  } catch (err) {
    console.error('[database] Erreur chargement listes depuis Supabase:', err);
    // On continue avec les données par défaut en mémoire
  }
}

/** Resets le flag de chargement (utile pour les tests). */
export function resetLoadFlag(): void {
  _listsLoaded = false;
}

async function persistBlacklistEntry(entry: ListEntry): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_blacklist').upsert({
      value:    entry.value,
      type:     entry.type,
      reason:   entry.reason,
      added_by: entry.addedBy,
      added_at: entry.addedAt,
    }, { onConflict: 'value' });
  } catch (err) {
    console.error('[database] Erreur persistance blacklist:', err);
  }
}

async function persistWhitelistEntry(entry: ListEntry): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_whitelist').upsert({
      value:    entry.value,
      type:     entry.type,
      reason:   entry.reason,
      added_by: entry.added_by,
      added_at: entry.added_at,
    }, { onConflict: 'value' });
  } catch (err) {
    console.error('[database] Erreur persistance whitelist:', err);
  }
}

async function deleteBlacklistEntry(value: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_blacklist').delete().eq('value', value);
  } catch (err) {
    console.error('[database] Erreur suppression blacklist:', err);
  }
}

async function deleteWhitelistEntry(value: string): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('analyzer_whitelist').delete().eq('value', value);
  } catch (err) {
    console.error('[database] Erreur suppression whitelist:', err);
  }
}
```

- [ ] **Étape 4 : Rendre `addToBlacklist` et `addToWhitelist` async**

Remplacer `addToBlacklist` :
```typescript
export async function addToBlacklist(
  value: string,
  type: AnalyzableType,
  reason: string,
  addedBy = "user",
): Promise<ListEntry> {
  const entry: ListEntry = {
    value:   normalizeKey(value),
    type,
    reason,
    addedAt: new Date().toISOString(),
    addedBy,
  };
  db.blacklist.set(entry.value, entry);
  await persistBlacklistEntry(entry);
  return entry;
}
```

Remplacer `removeFromBlacklist` :
```typescript
export async function removeFromBlacklist(value: string): Promise<boolean> {
  const key = normalizeKey(value);
  const existed = db.blacklist.delete(key);
  await deleteBlacklistEntry(key);
  return existed;
}
```

Remplacer `addToWhitelist` :
```typescript
export async function addToWhitelist(
  value: string,
  type: AnalyzableType,
  reason: string,
  addedBy = "user",
): Promise<ListEntry> {
  const entry: ListEntry = {
    value:   normalizeKey(value),
    type,
    reason,
    addedAt: new Date().toISOString(),
    addedBy,
  };
  db.whitelist.set(entry.value, entry);
  await persistWhitelistEntry(entry);
  return entry;
}
```

Remplacer `removeFromWhitelist` :
```typescript
export async function removeFromWhitelist(value: string): Promise<boolean> {
  const key = normalizeKey(value);
  const existed = db.whitelist.delete(key);
  await deleteWhitelistEntry(key);
  return existed;
}
```

- [ ] **Étape 5 : Ajouter `loadListsFromSupabase` dans les exports de `lib/analyzer/index.ts`**

Ajouter dans le bloc d'exports de `database` :
```typescript
export {
  // ... exports existants ...
  loadListsFromSupabase,
  resetLoadFlag,
} from "./database";
```

- [ ] **Étape 6 : Appeler `loadListsFromSupabase()` dans `app/api/analyze/route.ts`**

Ajouter `loadListsFromSupabase` dans l'import depuis `@/lib/analyzer` (ligne 12) :
```typescript
import {
  analyze,
  detectType,
  analyzeQuick,
  loadListsFromSupabase,
  // ... reste des imports
} from "@/lib/analyzer";
```

Dans la fonction `POST` (avant le traitement), ajouter en tout premier :
```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  await loadListsFromSupabase(); // charge les listes depuis Supabase (no-op si déjà chargé)
  // ... reste de la fonction
```

Faire pareil pour la fonction `GET`.

- [ ] **Étape 7 : Mettre à jour les callers de `addToBlacklist` / `addToWhitelist` dans `app/api/analyze/route.ts`**

Ces fonctions sont maintenant async. Chercher les appels et ajouter `await` :
```typescript
// Remplacer
addToBlacklist(body.value, body.type ?? "url", body.reason ?? "Ajout manuel", "admin");
// Par
await addToBlacklist(body.value, body.type ?? "url", body.reason ?? "Ajout manuel", "admin");
```
Idem pour `addToWhitelist`, `removeFromBlacklist`, `removeFromWhitelist`.

- [ ] **Étape 8 : Vérifier la compilation**

```bash
npx tsc --noEmit
```
Résultat attendu : 0 erreur.

- [ ] **Étape 9 : Commit**

```bash
git add supabase/migrations/20260405_analyzer_lists.sql types/supabase.ts lib/analyzer/database.ts lib/analyzer/index.ts app/api/analyze/route.ts
git commit -m "feat: persist blacklist/whitelist to Supabase, hybrid in-memory cache"
```

---

## Tâche 5 — Ajouter les tests Jest

**Pourquoi :** Zéro test = impossible de valider les PRs des contributeurs. On commence par les fonctions les plus critiques : sanitize, scoring, rate limiting.

**Fichiers :**
- Créer : `jest.config.ts`
- Créer : `__tests__/sanitize.test.ts`
- Créer : `__tests__/scoring.test.ts`
- Créer : `__tests__/ratelimit.test.ts`

- [ ] **Étape 1 : Créer `jest.config.ts`**

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathPattern: '__tests__',
  collectCoverageFrom: [
    'lib/analyzer/**/*.ts',
    'lib/ratelimit/**/*.ts',
    'lib/api-helpers.ts',
    '!lib/analyzer/index.ts', // réexports
  ],
};

export default config;
```

- [ ] **Étape 2 : Vérifier que `ts-jest` est installé**

```bash
npm list ts-jest
```
Si absent : `npm install --save-dev ts-jest @types/jest`

- [ ] **Étape 3 : Créer `__tests__/sanitize.test.ts`**

```typescript
import { sanitizeInput } from '@/lib/api-helpers';

describe('sanitizeInput', () => {
  it('supprime les balises HTML', () => {
    expect(sanitizeInput('<script>alert(1)</script>texte')).toBe('texte');
  });

  it('supprime les caractères de contrôle', () => {
    expect(sanitizeInput('texte\x00\x1F normal')).toBe('texte normal');
  });

  it('trim et normalise les espaces', () => {
    expect(sanitizeInput('  hello   world  ')).toBe('hello world');
  });

  it('conserve le texte propre intact', () => {
    expect(sanitizeInput('Bonjour, je suis un message normal.')).toBe(
      'Bonjour, je suis un message normal.',
    );
  });

  it('supprime les entités HTML', () => {
    expect(sanitizeInput('AT&amp;T')).toBe('AT T');
  });

  it('gère une chaîne vide', () => {
    expect(sanitizeInput('')).toBe('');
  });
});
```

- [ ] **Étape 4 : Lancer les tests sanitize pour vérifier qu'ils passent**

```bash
npx jest __tests__/sanitize.test.ts --no-coverage
```
Résultat attendu : 6 tests PASS.

- [ ] **Étape 5 : Créer `__tests__/scoring.test.ts`**

```typescript
import { scoreToRisk } from '@/lib/analyzer/constants';
import { calculateConfidence } from '@/lib/analyzer/scoring';
import type { RegexResult, AIResult } from '@/lib/analyzer/types';

describe('scoreToRisk', () => {
  it('retourne safe pour score 0', ()  => expect(scoreToRisk(0)).toBe('safe'));
  it('retourne safe pour score 15',  () => expect(scoreToRisk(15)).toBe('safe'));
  it('retourne low pour score 16',   () => expect(scoreToRisk(16)).toBe('low'));
  it('retourne low pour score 35',   () => expect(scoreToRisk(35)).toBe('low'));
  it('retourne suspicious pour 36',  () => expect(scoreToRisk(36)).toBe('suspicious'));
  it('retourne dangerous pour 56',   () => expect(scoreToRisk(56)).toBe('dangerous'));
  it('retourne critical pour 76',    () => expect(scoreToRisk(76)).toBe('critical'));
  it('retourne critical pour 100',   () => expect(scoreToRisk(100)).toBe('critical'));
});

describe('calculateConfidence', () => {
  const baseRegex: RegexResult = {
    score: 50,
    triggers: [{ rule: 'test', score: 50, category: 'phishing', description: 'test' }],
    details: {},
  };

  const baseAI: AIResult = {
    score: 50,
    risk: 'suspicious',
    type: 'phishing',
    explanation: 'test',
    confidence: 80,
    language: 'fr',
    indicators: [],
  };

  it('retourne une valeur entre 0 et 100', () => {
    const conf = calculateConfidence(baseRegex, baseAI);
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(100);
  });

  it('est plus élevé quand regex et AI concordent', () => {
    const highConf = calculateConfidence(
      { ...baseRegex, score: 80 },
      { ...baseAI,    score: 80 },
    );
    const lowConf = calculateConfidence(
      { ...baseRegex, score: 20 },
      { ...baseAI,    score: 80 },
    );
    expect(highConf).toBeGreaterThan(lowConf);
  });

  it('fonctionne sans résultat AI (null)', () => {
    const conf = calculateConfidence(baseRegex, null);
    expect(conf).toBeGreaterThanOrEqual(0);
    expect(conf).toBeLessThanOrEqual(100);
  });
});
```

- [ ] **Étape 6 : Lancer les tests scoring**

```bash
npx jest __tests__/scoring.test.ts --no-coverage
```
Résultat attendu : tous les tests PASS. Si un test échoue à cause d'un import manquant, vérifier l'export dans `lib/analyzer/constants.ts` et `lib/analyzer/scoring.ts`.

- [ ] **Étape 7 : Créer `__tests__/ratelimit.test.ts`**

```typescript
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';

// Mock Upstash pour les tests (pas de Redis réel en CI)
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: Object.assign(
    jest.fn().mockImplementation(() => ({
      limit: jest.fn().mockResolvedValue({ success: true, remaining: 9, reset: Date.now() + 60_000 }),
    })),
    { slidingWindow: jest.fn().mockReturnValue({}) },
  ),
}));

describe('checkRateLimit — sans Upstash configuré', () => {
  const originalUrl   = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env.UPSTASH_REDIS_REST_URL   = originalUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
  });

  it('laisse passer en dev sans Upstash', async () => {
    const result = await checkRateLimit('test:ip', { max: 5, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });
});

describe('getClientIp', () => {
  it('extrait l\'IP depuis x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('extrait l\'IP depuis x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  it('retourne "unknown" si aucun header', () => {
    const req = new Request('http://localhost');
    expect(getClientIp(req)).toBe('unknown');
  });
});
```

- [ ] **Étape 8 : Lancer tous les tests**

```bash
npx jest --no-coverage
```
Résultat attendu : 3 suites, tous PASS.

- [ ] **Étape 9 : Vérifier la couverture sur les modules critiques**

```bash
npx jest --coverage --collectCoverageFrom='lib/api-helpers.ts'
```
Résultat attendu : couverture > 80% sur `lib/api-helpers.ts`.

- [ ] **Étape 10 : Commit**

```bash
git add jest.config.ts __tests__/
git commit -m "test: add Jest tests for sanitize, scoring, rate limiting"
```

---

## Tâche 6 — CONTRIBUTING.md

**Pourquoi :** Projet open-source collectif sans guide de contribution = barrière à l'entrée pour les bénévoles. Comment créer une branche ? Quels standards ? Comment lancer les tests ?

**Fichiers :**
- Créer : `CONTRIBUTING.md`

- [ ] **Étape 1 : Créer `CONTRIBUTING.md` à la racine**

```markdown
# Contribuer à Anti-Pépins

Merci de vouloir contribuer à ce projet associatif open-source ! 🛡️

## Prérequis

- Node.js 20+
- Un compte Supabase (gratuit) pour les variables d'environnement
- Optionnel : compte Upstash Redis pour le rate limiting

## Démarrage rapide

```bash
git clone https://github.com/<org>/anti-pepins.git
cd anti-pepins
npm install
cp .env.example .env.local   # remplir les variables
npm run dev
```

## Variables d'environnement

Copier `.env.example` et remplir les valeurs. Pour contribuer sans Supabase, les routes API lèveront une erreur — concentrez-vous sur les composants frontend ou le moteur d'analyse (`lib/analyzer/`).

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anonyme publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui (API) | Clé service role (ne jamais `NEXT_PUBLIC_`) |
| `UPSTASH_REDIS_REST_URL` | Non | Rate limiting (fallback si absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Non | Rate limiting |
| `MISTRAL_API_KEY` | Non | Analyse IA (fallback heuristique si absent) |

## Workflow de contribution

1. **Forker** le repo et créer une branche depuis `main` :
   ```bash
   git checkout -b feat/ma-fonctionnalite
   ```
2. **Écrire les tests** avant le code (`__tests__/`) — voir les exemples existants
3. **Vérifier** avant de pousser :
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   ```
4. **Ouvrir une Pull Request** vers `main` avec une description claire

## Standards de code

- TypeScript strict — pas de `as any` ni `@ts-ignore` sans justification en commentaire
- Sanitiser tout input utilisateur via `sanitizeInput()` de `lib/api-helpers.ts`
- Toute nouvelle route API doit : rate-limiter → vérifier Content-Type → valider (Zod) → écrire en base
- Messages d'erreur utilisateur en **français**
- Logs internes en **anglais** (ex: `console.error('[ContactAPI] Supabase error:', err)`)

## Architecture rapide

```
lib/analyzer/     — moteur anti-arnaque (regex + IA Mistral)
lib/ratelimit/    — rate limiting Upstash Redis
lib/api-helpers.ts — sanitize, headers, json helper partagés
app/api/          — routes Next.js (analyze, report, contact, temoignage, chat)
app/admin/        — panel bénévole (Supabase Realtime)
components/       — UI React
```

## Lancer les tests

```bash
npm test                          # tous les tests
npx jest __tests__/sanitize.test.ts  # un fichier
npx jest --coverage               # avec couverture
```

## Questions ?

Ouvrir une [issue GitHub](../../issues) avec le tag `question`. On est bienveillants 🙂
```

- [ ] **Étape 2 : Créer `.env.example` si absent**

```bash
ls /home/sweetosky/Documents/htdoc/Anti-pepins/.env.example 2>/dev/null || echo "absent"
```

Si absent, créer `.env.example` :
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# Upstash Redis (optionnel — rate limiting)
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# Mistral AI (optionnel — analyse IA)
MISTRAL_API_KEY=xxxx

# Sanity CMS (optionnel — blog)
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxx
NEXT_PUBLIC_SANITY_DATASET=production
```

- [ ] **Étape 3 : Commit**

```bash
git add CONTRIBUTING.md .env.example
git commit -m "docs: add CONTRIBUTING.md and .env.example for open-source contributors"
```

---

## Récapitulatif des commits

| # | Commit | Durée estimée |
|---|---|---|
| 1 | `fix: add reports table to Supabase types, remove as-any casts` | 15 min |
| 2 | `refactor: centralize sanitizeInput, API_HEADERS, jsonResponse` | 20 min |
| 3 | `fix: rate limiting fails closed in production` | 5 min |
| 4 | `feat: persist blacklist/whitelist to Supabase, hybrid cache` | 60 min |
| 5 | `test: add Jest tests for sanitize, scoring, rate limiting` | 30 min |
| 6 | `docs: add CONTRIBUTING.md and .env.example` | 10 min |

**Total estimé : ~2h30 en exécution séquentielle.**
