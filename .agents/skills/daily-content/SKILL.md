---
name: daily-content
description: Research, write, validate, and ingest one Content Central daily developer-content bundle. Use for the scheduled daily content run, a manual replacement run, or when asked to generate today's Dev.to, TabNews, Twitter/X, and Instagram drafts. Do not use for dashboard code changes or publishing directly to social platforms.
---

# Daily Content

Produce exactly one bundle from two independent research sessions and verify it reached the production dashboard.

## Boundaries

- Use the current ChatGPT/Codex session and its included subscription allowance.
- Never use `OPENAI_API_KEY`, Anthropic, Claude, a model SDK, or any pay-as-you-go model API. Instagram visual layers use the built-in `$imagegen` skill and the included subscription allowance.
- Work in the local checkout, not an isolated worktree; `.vercel/.env.production.local` is ignored and stays in the main checkout.
- Do not commit, push, or publish to social platforms.
- Do not print, copy into content, or otherwise expose `INGEST_TOKEN`.

## Workflow

For an explicit targeted rerun, the existing complete bundle is provided in `.data/bundle.json`. A platform rerun changes only that platform and uses its session's existing research. An `articles` session rerun replaces the technical topic, research, Dev.to, and TabNews together. A `social` session rerun replaces the social topic, research, Twitter, and Instagram together. Keep every field outside the requested scope unchanged. An Instagram rerun uses a fresh `render_revision`; Twitter preserves Instagram and reuses matching slides only through `image_slide`. The trusted runner rejects protected-field changes.

1. Read `AGENT.md` completely, then read every file in `playbook/` completely. Follow them as the authoritative editorial workflow.
2. Run the production preflight:

   ```bash
   node --env-file=.vercel/.env.production.local .agents/skills/daily-content/scripts/ingest.mjs --check
   ```

   Stop and report the exact error if authentication or connectivity fails. For a normal scheduled run, stop when today's date already exists. For an explicit manual or automation-runner request, continue and choose a distinct topic even when another post already exists today.
3. Follow `AGENT.md` Steps 2–7. Run the deep article research and quick social research separately, prefer primary sources, and keep within each session's search budget.
4. Save the final JSON bundle to `.data/bundle.json`. Ensure its date is today's UTC date and run every validation and reading-time check in `AGENT.md`. Dev.to and TabNews should each feel like a substantial, enjoyable 4–8 minute read; word counts guide editing but never justify filler or a vague shortcut.
   The Instagram fields are a hybrid render specification: every slide needs an exact title-contained `accent_phrase`, a complete private `visual_plan`, and a meaningful structured `visual`. Use built-in `$imagegen` artwork on only 2–4 slides and never every slide. Generated artwork must be simple, symbolic, text-free, and leave an intentional text region; set `generated_visual_path` and `generated_visual_alt` only on those slides. Omit every generated visual field from the rest. The uploader replaces local paths with `generated_visual_key`. Typography-only slides and `visual.type: "none"` are invalid. Follow `playbook/instagram-visual-system.md` exactly, set `layout_style` to `balanced`, set `cta_handle` to `@Luciano655dev`, and assign a new `render_revision` every time a carousel is created or replaced. Twitter opens forcefully, stays highly informal, and never ends a sentence with `.`. Twitter may reuse a matching Instagram PNG only through `image_slide`. Never call the pay-as-you-go image API.
5. Unless the prompt explicitly says the trusted automation runner will upload the bundle, upload generated visual layers, then ship and verify:

   ```bash
   node --env-file=.vercel/.env.production.local scripts/upload-instagram-visuals.mjs .data/bundle.json
   node --env-file=.vercel/.env.production.local .agents/skills/daily-content/scripts/ingest.mjs .data/bundle.json
   ```

6. For direct runs, finish only when the command reports that production contains the bundle date. If upload fails with a validation error, fix only the failing fields and retry. Retry server/network failures no more than three times. For automation-runner requests, finish after writing the fully validated `.data/bundle.json`; the runner performs the trusted upload outside the Codex sandbox.
