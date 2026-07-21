# Repo guide (for coding agents)

Content Central = a Next.js dashboard + an editorial playbook for a daily cloud content agent.

- `src/` — the dashboard (Next.js 16 / React 19 / Tailwind v4, Supabase storage with local-file fallback in `.data/`)
- `playbook/` + `AGENT.md` — editorial instructions consumed by the daily cloud routine, not by the app. `AGENT.md` is NOT for you unless you were explicitly told you are the daily content agent.
- `supabase/schema.sql` — database schema
- `scripts/seed.mjs` — seeds an example bundle into a running instance
- `.agents/skills/daily-content/` — the Codex workflow used by the local scheduled task

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
