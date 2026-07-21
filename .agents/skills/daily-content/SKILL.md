---
name: daily-content
description: Research, write, validate, and ingest one Content Central daily developer-content bundle. Use for the scheduled daily content run, a manual replacement run, or when asked to generate today's Dev.to, TabNews, Twitter/X, and Instagram drafts. Do not use for dashboard code changes or publishing directly to social platforms.
---

# Daily Content

Produce exactly one bundle and verify it reached the production dashboard.

## Boundaries

- Use the current ChatGPT/Codex session and its included subscription allowance.
- Never use `OPENAI_API_KEY`, Anthropic, Claude, a model SDK, or any pay-as-you-go model API.
- Work in the local checkout, not an isolated worktree; `.vercel/.env.production.local` is ignored and stays in the main checkout.
- Do not commit, push, or publish to social platforms.
- Do not print, copy into content, or otherwise expose `INGEST_TOKEN`.

## Workflow

1. Read `AGENT.md` completely, then read every file in `playbook/` completely. Follow them as the authoritative editorial workflow.
2. Run the production preflight:

   ```bash
   node --env-file=.vercel/.env.production.local .agents/skills/daily-content/scripts/ingest.mjs --check
   ```

   Stop and report the exact error if authentication or connectivity fails. For a normal scheduled run, stop when today's date already exists. For an explicit manual or automation-runner request, continue and choose a distinct topic even when another post already exists today.
3. Follow `AGENT.md` Steps 2–5. Use web search for the required research, prefer primary sources, and keep within its search budget.
4. Save the final JSON bundle to `.data/bundle.json`. Ensure its date is today's UTC date and run every validation and reading-time check in `AGENT.md`. Dev.to and TabNews should each feel like a substantial, enjoyable 4–8 minute read; word counts guide editing but never justify filler or a vague shortcut.
   The Instagram fields are a render specification: every slide needs an exact title-contained `accent_phrase`, a complete private `visual_plan`, a meaningful content-matched structured `visual`, and a useful caption. Typography-only slides and `visual.type: "none"` are invalid. Middle-slide bodies should normally contain 20–38 useful words and explain a mechanism plus its implication. Follow `playbook/instagram-visual-system.md` exactly. Set `layout_style` to `balanced`, set `cta_handle` to `@Luciano655dev`, and assign a new unique `render_revision` every time a carousel is created or replaced. Twitter tweet 1 must open with a forceful topic-specific accusation, correction, warning, or command and immediately prove it with a concrete consequence. Twitter body tweets should normally use 150–260 characters for one concrete explanation. Twitter may reuse a matching Instagram PNG only through `image_slide`; omit the field when no slide fits. Do not call an image API—the dashboard renders the final 1080×1350 PNGs deterministically from the bundle.
5. Unless the prompt explicitly says the trusted automation runner will upload the bundle, ship and verify:

   ```bash
   node --env-file=.vercel/.env.production.local .agents/skills/daily-content/scripts/ingest.mjs .data/bundle.json
   ```

6. For direct runs, finish only when the command reports that production contains the bundle date. If upload fails with a validation error, fix only the failing fields and retry. Retry server/network failures no more than three times. For automation-runner requests, finish after writing the fully validated `.data/bundle.json`; the runner performs the trusted upload outside the Codex sandbox.
