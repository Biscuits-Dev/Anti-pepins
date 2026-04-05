# Contribuer à Anti-Pépins

Merci de vouloir contribuer à ce projet associatif open-source ! 🛡️

Anti-Pépins est une plateforme française d'aide aux victimes d'arnaques en ligne,
développée et maintenue par un collectif bénévole.

## Prérequis

- Node.js 20+
- Un compte [Supabase](https://supabase.com) (gratuit)
- Optionnel : compte [Upstash](https://upstash.com) pour le rate limiting
- Optionnel : clé API [Mistral](https://console.mistral.ai) pour l'analyse IA

## Démarrage rapide

```bash
git clone https://github.com/<org>/anti-pepins.git
cd anti-pepins
npm install
cp .env.example .env.local   # remplir les variables requises
npm run dev                   # http://localhost:3000
```

## Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anonyme (safe côté client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui (API) | Clé service role — **jamais préfixer avec `NEXT_PUBLIC_`** |
| `UPSTASH_REDIS_REST_URL` | Non | Rate limiting distribué (désactivé si absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Non | Rate limiting distribué |
| `MISTRAL_API_KEY` | Non | Analyse IA (fallback heuristique si absent) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Non | Blog (section `/blog` désactivée si absent) |
| `NEXT_PUBLIC_SANITY_DATASET` | Non | Blog — généralement `production` |

## Commandes utiles

```bash
npm run dev          # serveur de développement
npm run build        # build de production
npm run lint         # ESLint
npm test             # Jest (28 tests)
npx tsc --noEmit     # vérification TypeScript
npm run types:supabase  # régénérer types/supabase.ts depuis le schéma Supabase
```

## Workflow de contribution

1. **Forker** le repo et créer une branche depuis `main` :
   ```bash
   git checkout -b feat/ma-fonctionnalite
   ```

2. **Écrire les tests en premier** (`__tests__/`) — voir les exemples existants

3. **Vérifier avant de pousser** :
   ```bash
   npm run lint && npx tsc --noEmit && npm test
   ```

4. **Ouvrir une Pull Request** vers `main` avec une description claire de la fonctionnalité ou du fix

## Standards de code

- **TypeScript strict** — pas de `as any` ni `@ts-ignore` sans justification en commentaire
- **Sanitiser les inputs** utilisateur via `sanitizeInput()` de `lib/api-helpers.ts`
- **Toute nouvelle route API** doit respecter l'ordre : rate limit → Content-Type → validation (Zod) → écriture en base
- **Messages d'erreur** affichés à l'utilisateur : en **français**
- **Logs internes** (`console.error`, `console.warn`) : en **anglais** avec préfixe `[module]`
- **Pas de `NEXT_PUBLIC_`** sur les variables serveur sensibles

## Architecture résumée

```
lib/analyzer/     — moteur anti-arnaque (regex + IA Mistral)
lib/ratelimit/    — rate limiting Upstash Redis
lib/api-helpers.ts — sanitize, headers, json helper partagés
app/api/          — routes Next.js (analyze, report, contact, temoignage, chat)
app/admin/        — panel bénévole en temps réel (Supabase Realtime)
components/       — composants React
hooks/            — hooks React (useChat, useAdminChat)
supabase/migrations/ — migrations SQL (à appliquer dans le dashboard Supabase)
```

## Base de données

Les tables Supabase sont documentées dans `types/supabase.ts`. Les migrations SQL sont dans `supabase/migrations/`.

Pour appliquer une migration : colle le contenu du fichier `.sql` dans le **SQL Editor** de ton projet Supabase.

## Questions et aide

- Ouvre une [issue GitHub](../../issues) avec le tag `question`
- On répond à toutes les questions, les débutants sont les bienvenus 🙂
