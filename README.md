# Content Central

A daily dev-content studio. Every night at 3:00 AM a Claude Code cloud routine researches one timeless developer topic and writes it four ways:

- **Dev.to** post (English)
- **TabNews** post (Português, adapted — not translated)
- **Twitter/X** thread (aggressive tone + image suggestions)
- **Instagram** carousel plan (slide-by-slide copy + visual direction)

You open this dashboard, review, and publish with one-click copy buttons.

## How it works

```
cloud routine (3am, daily)          this app (Vercel)
┌──────────────────────────┐        ┌─────────────────────────┐
│ clones this repo         │  GET   │ /api/topics  (dedup)    │
│ reads AGENT.md +         │───────▶│                         │
│ playbook/*.md            │  POST  │ /api/ingest  (bundle)   │
│ researches + writes      │───────▶│      │                  │
└──────────────────────────┘        │      ▼                  │
                                    │  Supabase → dashboard   │
                                    └─────────────────────────┘
```

The editorial brain lives in `playbook/` — edit those files to change how the bot picks topics and writes. `AGENT.md` is the routine's step-by-step workflow.

## Local development

```bash
npm install
npm run dev
```

Without Supabase env vars the app stores posts in `.data/posts.json` (local mode). Seed an example bundle:

```bash
node scripts/seed.mjs   # uses http://localhost:3000 and INGEST_TOKEN=dev-token
```

## Environment (production)

| Var | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `INGEST_TOKEN` | Bearer token for the daily agent (`openssl rand -hex 32`) |
| `ACCESS_PASSWORD` | Dashboard login passcode |
| `SESSION_SECRET` | Signs the session cookie (`openssl rand -hex 32`) |

Run `supabase/schema.sql` once in the Supabase SQL editor.
