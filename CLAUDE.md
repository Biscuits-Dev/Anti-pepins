# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Next.js)
npm run build      # production build
npm run lint       # ESLint
npm test           # Jest
npm run types:supabase  # regenerate types/supabase.ts from Supabase schema
```

No test files exist yet — Jest is configured but the suite is empty.

## Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
MISTRAL_API_KEY          # optional — enables AI analysis in lib/analyzer/ai.ts
```

Sanity CMS variables are also needed for the blog (`/blog`). Without Upstash vars, rate limiting falls back to "allow all" in dev only (see `lib/ratelimit/index.ts`).

## Architecture overview

**Stack:** Next.js 16 App Router · React 19 · TypeScript · Supabase · Tailwind 4 · Upstash Redis

### Public surface

The site is an anti-scam platform. Key user flows:
- `/analyze` — paste a URL, email, phone, or message to check for scams
- `/report` — submit a scam report (saved to Supabase `reports` table)
- `/temoignage` — submit a testimonial (saved to `temoignages`, requires moderation)
- `/contact` — contact form (saved to `contacts`)
- `/blog` — articles from Sanity CMS
- Chat widget (`components/chat.tsx`) — floating chat available on all pages

### Admin panel (`/admin`)

Protected server-side by `proxy.ts` — requires a Supabase user with `app_metadata.role === 'admin'`. The panel (`app/admin/page.tsx`) is a real-time chat dashboard for volunteers (bénévoles) to respond to visitors.

### Analyzer (`lib/analyzer/`)

Self-contained analysis engine. Entry point: `lib/analyzer/index.ts`. Internally:
- **Regex rules** per type (`url.ts`, `email.ts`, `phone.ts`, `message.ts`)
- **Scoring** combines regex + optional Mistral AI results (`ai.ts`)
- **In-memory database** (`database.ts`) — blacklist, whitelist, history. **This state resets on every cold start in serverless.**

Exposed via `POST /api/analyze` (public) with admin-gated actions (`manage-list`, `import`, and most GET actions).

### Chat system (Supabase Realtime)

Two channel types:
- `chat:session:{id}` — per-visitor session, carries messages and typing indicators
- `chat:admin-presence` — shared channel using **Supabase Presence** (not broadcast) so admin online status survives late-joins

User side: `hooks/useChat.ts` — subscribes to both channels; state: `{ messages, isAdminOnline, isAdminTyping, isConnected }`.  
Admin side: `hooks/useAdminChat.ts` — subscribes to `chat:admin` (receives forwarded messages from all sessions) and tracks presence on `chat:admin-presence`.

Messages are broadcast over realtime first, then persisted via `POST /api/chat/message` (service role key, server-generated timestamp). History is fetched via `GET /api/chat/session/[sessionId]`.

### Rate limiting

`lib/ratelimit/index.ts` — async `checkRateLimit(key, { max, windowMs })` backed by Upstash sliding window. All API routes use this. The old `lib/ratelimit/ratelimit.ts` (exports `contactRatelimit`) is a legacy file kept for reference.

### Supabase clients

| File | Key used | Purpose |
|---|---|---|
| `lib/supabase.ts` | anon | Browser realtime channels |
| `lib/supabase/server.ts` | service role | Server-side DB writes (singleton) |
| `app/admin/server.ts` | anon + cookies | SSR auth session for admin pages |
| `lib/supabase/auth.ts` | anon + cookies | `isAdminRequest()` helper for API routes |

### Validation pattern

API routes follow this order: rate limit → Content-Type check → parse body → validate (Zod or custom) → DB insert. Input sanitization strips HTML tags and control characters before storage.
