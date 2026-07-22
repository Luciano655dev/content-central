# Instagram Carousel Guide (English)

Instagram comes from the independent quick social research session, not from the long-form article topic. Every carousel is delivered as final 1080×1350 PNG slides by Content Central. `playbook/instagram-visual-system.md` is authoritative. Write exact compact copy, a private `visual_plan`, and structured `visual` data for every slide. Set `layout_style` to `balanced`, change `render_revision` for every render, and set `cta_handle` to `@Luciano655dev`.

Use built-in `$imagegen` artwork on only **2–4 slides and never every slide**. Save those selected bitmaps under `.data/generated`, set `generated_visual_path` and `generated_visual_alt` only on those slides, and omit all generated visual fields from the rest. Every bitmap is text-free; Content Central owns headlines, labels, code, numbers, CTAs, and typography. Never use `OPENAI_API_KEY` or a paid image API.

## Mandatory brand system

- Canvas: 1080×1350 px, portrait 4:5, 60–68 px safe margins
- Background `#0A0A0A`; panels `#111111` / `#141414`; border `#232323`
- Primary text `#F3F3F0`; secondary `#9A9A95`; muted `#6F6F69`
- Sole accent `#C7F246`; optional diagram lines `#3A3A36`
- Headline/body: Inter (Helvetica Neue/Arial fallback)
- Accent phrase: Instrument Serif Italic (Georgia/Times fallback), lime
- Code/labels: IBM Plex Mono (SFMono/Menlo/Consolas fallback)
- Bold editorial, premium, informal, high contrast, compact spacing
- Never use blue, purple, gradients, badges, slide counters, swipe text, clutter, generic icons, or a startup-ad look
- One main idea per slide. Mobile readability wins over decoration.

For every slide, provide `accent_phrase`: one exact word or short phrase that already appears in `title`. It is rendered in lime serif italic. Keep the rest of the headline in bold Inter.

Every slide needs a meaningful structured `visual`; typography-only slides and `{ "type": "none" }` are invalid for new bundles. Supported grammars are `timeline`, `comparison`, `flow`, `cause_effect`, `code`, `numeric`, `layered`, `transformation`, `loop`, `spatial`, and `illustration`. Examples:

```json
{ "type": "code", "label": "BROKEN", "lines": ["const start = Date.now();", "elapsed = Date.now() - start;"], "highlight": "Date.now()" }
{ "type": "flow", "label": "FAILURE CHAIN", "items": [{"label":"clock step"},{"label":"negative duration","accent":true},{"label":"panic"}] }
{ "type": "comparison", "label": "PICK THE CLOCK", "left": "Wall time\nWhen?", "right": "Monotonic\nHow long?" }
```

Keep code to 1–5 short lines, diagram sequences to 2–5 short nodes, and comparisons to compact phrases. The private `visual_plan` must name the core message, relationship, matching grammar, focal point, secondary information, accent location, and composition before rendering begins.

Optimize for saves, shares, and “wait, that’s useful.” Format: 4:5 portrait (1080×1350), usually 5–8 slides. The whole idea should be understandable without stopping to study.

## Slide 1 — the cover (this is 80% of the result)

- ONE bold claim, ideally 3–7 words, set in massive type and occupying roughly half the canvas. It is a billboard, not a paragraph
- Name the exact pain, shortcut, payoff, or surprising fact so the right person recognizes it immediately
- Must work as a standalone post — most viewers never swipe
- Pair the hook with one large topic-specific visual, crop, contrast block, or purpose-built component so the cover feels full rather than sparse
- `visual_tip`: describe the intended attention path and how the text and visual fill the canvas in one sentence. No decoration that competes with the words

## Slides 2 to N-1

- One instantly understandable idea per slide: title ≤8 words in large type, body normally **8–28 words** and never more than 36
- The body adds the useful action, example, condition, limitation, or payoff without turning into a lesson
- Prefer one or two casual sentences. Use plain words and contractions
- Delete vague copy such as “this causes problems” or “use the right tool.” Name what changes, where the value travels, why it breaks, or which tool to choose
- Slide 2 must deliver the payoff immediately
- Rhythm: vary meaningful visual grammar and composition on every slide; never alternate in typography-only filler
- Number the steps when there's a sequence — numbered progress pulls swipes
- Keep visual consistency: the renderer applies the brand system automatically; use the visual tip for composition, not repeated palette instructions
- Make each structured component fill its region and look native to its purpose; avoid generic small cards floating in the middle

## Final slide — CTA

- One-line recap of the promise delivered
- Use a topic-specific save line plus a casual "Follow @Luciano655dev for more useful dev stuff"
- `visual_tip`: profile handle large with an understated accent divider. No follow-button mockup or badge.

## Caption

- First line = hook restated (caption is truncated after ~1 line in feed)
- 2–4 short lines of value or context, then "Save this 🔖"
- 5 hashtags, mixing broad (#programming #softwareengineering #webdev) and specific to the day's topic
