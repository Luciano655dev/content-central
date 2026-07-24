# Content Central

A daily dev-content studio. Every day at 4:00 AM a local Codex runner researches one timeless developer topic and writes it four ways:

- **Dev.to** post (English)
- **TabNews** post (Português, adapted — not translated)
- **Twitter/X** thread (aggressive tone + matching Instagram images)
- **Instagram** carousel (finished 1080×1350 posters + caption)

You open this dashboard, review, and use **Quick post** to fill each platform's composer without publishing it for you.

## How it works

```
Codex runner (4am, daily)           this app (Vercel)
┌──────────────────────────┐        ┌─────────────────────────┐
│ runs in this repo        │  GET   │ /api/topics  (dedup)    │
│ uses $daily-content      │───────▶│                         │
│ playbook/*.md            │  POST  │ /api/ingest  (bundle)   │
│ researches + writes      │───────▶│      │                  │
└──────────────────────────┘        │      ▼                  │
                                    │  Supabase → dashboard   │
                                    └─────────────────────────┘
```

The editorial brain lives in `playbook/` — edit those files to change how the bot picks topics and writes. `AGENT.md` is the detailed workflow, and `.agents/skills/daily-content/` packages it for Codex.

## Codex scheduled task (no API billing)

This project uses Codex through your ChatGPT sign-in and included subscription limits. It does not use an OpenAI API key, the Codex SDK, Claude, or Anthropic.

1. Run `vercel env pull .vercel/.env.production.local --environment=production` whenever production secrets change. The file is ignored by Git.
2. Make sure `codex login status` says `Logged in using ChatGPT`.
3. Install the local macOS scheduler: `node scripts/install-codex-scheduler.mjs`.
4. Configure the time or click **Run new one** in the dashboard. The default is daily at 4:00 AM in `America/Fortaleza`.
5. Keep this Mac awake and connected at execution time. The lightweight runner checks the website every five minutes and only starts Codex when work is due.

The runner removes `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` from the Codex process, uses your ChatGPT login, and uploads the finished bundle with the existing ingest token.

Test the production connection without generating a post:

```bash
node --env-file=.vercel/.env.production.local .agents/skills/daily-content/scripts/ingest.mjs --check
```

## Quick post companion

The dashboard's **Quick post** button talks to a loopback-only companion on this Mac. It opens a visible, persistent browser profile, fills the selected platform's composer, and attaches matching Instagram PNGs. It deliberately stops before every Publish, Post all, Publicar, or Share action.

Install or refresh it after pulling dependencies:

```bash
npm run quick-post:install
```

The first use of Dev.to, TabNews, X, or Instagram may open a sign-in screen in the companion browser. Sign in once, return to Content Central, and click **Quick post** again. The profile stays under ignored `.data/quick-post-playwright/`; generated upload files stay under ignored `.data/quick-post-assets/`.

Instagram posters are rendered as 1080×1350 PNGs from the Codex-authored structured slide specification. **Download all** returns an ordered ZIP (`01`, `02`, …), and X reuses only the Instagram slides explicitly assigned with `image_slide`. This renderer is deterministic and does not call a paid image API.

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
| `INGEST_TOKEN` | Bearer token for the Codex task (`openssl rand -hex 32`) |
| `ACCESS_PASSWORD` | Dashboard login passcode |
| `SESSION_SECRET` | Signs the session cookie (`openssl rand -hex 32`) |
| `CONTENT_CENTRAL_URL` | Optional runner override for the production URL |

Run `supabase/schema.sql` once in the Supabase SQL editor.
