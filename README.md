# Anti-Pépins — Collectif contre les arnaques

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F)](https://www.sanity.io/)
[![License](https://img.shields.io/badge/License-AGPL%20v3-blue)](LICENSE)

**Anti-Pépins** est un collectif citoyen open source dédié à la lutte contre les arnaques en ligne. La plateforme permet d'analyser des URLs, e-mails, numéros de téléphone et messages suspects, de signaler des escroqueries, et de partager des témoignages pour protéger la communauté.

---

## Fonctionnalités

| Page | Description |
|---|---|
| `/analyze` | Analyse d'URL, e-mail, téléphone ou message via regex + IA |
| `/report` | Signalement d'une arnaque (sauvegardé en base) |
| `/temoignage` | Dépôt d'un témoignage (modéré avant publication) |
| `/contact` | Formulaire de contact |
| `/blog` | Articles éducatifs via Sanity CMS |
| Chat widget | Chat flottant sur toutes les pages, avec réponse en temps réel par des bénévoles |
| `/admin` | Panel bénévole — tableau de bord de chat en temps réel (accès admin requis) |

---

## Stack technique

| Catégorie | Technologies |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript 5 |
| Style | Tailwind CSS 4 |
| Base de données | Supabase (PostgreSQL + Realtime) |
| CMS | Sanity.io (blog `/blog`) |
| Rate limiting | Upstash Redis (sliding window) |
| Analyse IA | Mistral AI (optionnel, fallback heuristique) |
| État global | Zustand |
| Tests | Jest |
| Qualité code | ESLint, Prettier, Husky |
| Analytics | Vercel Analytics |

---

## Installation

### Prérequis

- Node.js 20+
- npm 10+
- Compte [Supabase](https://supabase.com) (obligatoire)
- Compte [Upstash](https://upstash.com) (optionnel — rate limiting)
- Clé [Mistral AI](https://console.mistral.ai) (optionnel — analyse IA)
- Compte [Sanity](https://www.sanity.io) (optionnel — blog)

### Démarrage rapide

```bash
git clone https://github.com/Biscuits-Dev/Anti-pepins.git
cd Anti-pepins
npm install
cp .env.example .env.local   # puis remplir les variables (voir ci-dessous)
npm run dev                   # http://localhost:3000
```

### Variables d'environnement

| Variable | Obligatoire | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui | Clé anonyme (côté client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui | Clé service role — **jamais exposée côté client** |
| `UPSTASH_REDIS_REST_URL` | Non | Rate limiting distribué (désactivé si absent) |
| `UPSTASH_REDIS_REST_TOKEN` | Non | Rate limiting distribué |
| `MISTRAL_API_KEY` | Non | Analyse IA (fallback heuristique si absent) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Non | Blog (section `/blog` désactivée si absent) |
| `NEXT_PUBLIC_SANITY_DATASET` | Non | Dataset Sanity — généralement `production` |

---

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm test` | Tests Jest |
| `npm run types:supabase` | Régénère `types/supabase.ts` depuis le schéma Supabase |

---

## Architecture

```
app/
├── api/              — Routes API (analyze, report, contact, temoignage, chat)
├── admin/            — Panel bénévole (SSR, accès restreint rôle admin)
└── [pages]/          — Pages publiques

lib/
├── analyzer/         — Moteur d'analyse (regex + Mistral AI)
│   ├── index.ts      — Point d'entrée
│   ├── url.ts / email.ts / phone.ts / message.ts  — Règles regex par type
│   ├── ai.ts         — Intégration Mistral
│   └── database.ts   — Blacklist/whitelist en mémoire (reset au cold start)
├── ratelimit/        — Rate limiting Upstash (sliding window)
├── supabase/         — Clients Supabase (server, auth)
└── api-helpers.ts    — Sanitize, headers, helpers partagés

hooks/
├── useChat.ts        — Chat côté visiteur (Supabase Realtime)
└── useAdminChat.ts   — Chat côté bénévole

supabase/migrations/  — Migrations SQL (à appliquer via SQL Editor Supabase)
```

### Système de chat (Supabase Realtime)

- `chat:session:{id}` — Canal par visiteur (messages + indicateur de frappe)
- `chat:admin-presence` — Présence partagée via Supabase Presence (survit aux reconnexions tardives)

Les messages sont diffusés via Realtime puis persistés via `POST /api/chat/message`.

### Panel admin

Protégé côté serveur par `proxy.ts` — requiert un utilisateur Supabase avec `app_metadata.role === 'admin'`.

---

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour le guide complet : workflow Git, standards de code, conventions de nommage et architecture à respecter.

En résumé :

1. Forker le repo et créer une branche depuis `main`
2. Écrire les tests en premier (`__tests__/`)
3. Vérifier avant de pousser : `npm run lint && npx tsc --noEmit && npm test`
4. Ouvrir une Pull Request vers `Dev`

Toutes les contributions sont les bienvenues : corrections de bugs, nouvelles fonctionnalités, documentation, traductions.

---

## Licence

Ce projet est sous licence **GNU Affero General Public License v3.0**. Voir [LICENSE](LICENSE).

---

## Support

- Ouvrir une [issue GitHub](https://github.com/Biscuits-Dev/Anti-pepins/issues)
- Contacter l'équipe via le [formulaire de contact](https://anti-pepins.biscuits-ia.com/contact)

---

*Anti-Pépins est une initiative de l'association **Biscuits IA**, dédiée à la protection des utilisateurs contre les arnaques en ligne.*
