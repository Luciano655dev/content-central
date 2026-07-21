# Instagram Carousel Guide (English)

Every carousel is delivered as final 1080×1350 PNG slides by Content Central. `playbook/instagram-visual-system.md` contains the exact current image-creation prompt and is authoritative; follow it completely. You are the art director: write exact, compact copy, a private `visual_plan`, and structured `visual` data for every slide. Set `layout_style` to `balanced`, change `render_revision` for every new render, and set `cta_handle` to `@Luciano655dev`. Do not ask a paid image model to typeset the slide.

## Mandatory brand system

- Canvas: 1080×1350 px, portrait 4:5, 72 px safe margins
- Background `#0A0A0A`; panels `#111111` / `#141414`; border `#232323`
- Primary text `#F3F3F0`; secondary `#9A9A95`; muted `#6F6F69`
- Sole accent `#C7F246`; optional diagram lines `#3A3A36`
- Headline/body: Inter (Helvetica Neue/Arial fallback)
- Accent phrase: Instrument Serif Italic (Georgia/Times fallback), lime
- Code/labels: IBM Plex Mono (SFMono/Menlo/Consolas fallback)
- Minimal, premium, technical, editorial, high contrast, left aligned, generous negative space
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

Carousels get ~4x the engagement of single images and the algorithm re-serves them (if the viewer doesn't swipe, Instagram shows slide 2 next time). The metric to optimize is SAVES — educational carousels are save machines. Format: 4:5 portrait (1080×1350), 6–10 slides.

## Slide 1 — the cover (this is 80% of the result)

- ONE bold claim, max ~10 words, set in huge type. It's a billboard, not a paragraph
- Same energy as the Twitter hook: threat, surprising claim, or identity bait
- Must work as a standalone post — most viewers never swipe
- `visual_tip`: describe the intended composition in one sentence, consistent with the mandatory brand system. No decoration that competes with the words

## Slides 2 to N-1

- One idea per slide, mirroring the thread's beats but COMPRESSED: title ≤ 8 words, body ≤ 45 words
- Give each body enough editorial depth to be useful: normally **20–38 words**, with **18–45 words** as a flexible band when code or the visual already carries part of the explanation
- The body must add information the title does not: explain the mechanism and then its consequence, evidence, constraint, or engineering decision. Never use the body as a longer paraphrase of the headline
- Prefer 2 concise sentences when they improve clarity. Include at least one concrete API, condition, number, failure path, comparison, or action on every middle slide
- Delete vague copy such as “this causes problems” or “use the right tool.” Name what changes, where the value travels, why it breaks, or which tool to choose
- Slide 2 must pay off the cover immediately — swipe-drop happens at slide 3, so front-load
- Rhythm: vary meaningful visual grammar and composition on every slide; never alternate in typography-only filler
- Number the steps when there's a sequence — numbered progress pulls swipes
- Keep visual consistency: the renderer applies the brand system automatically; use the visual tip for composition, not repeated palette instructions

## Final slide — CTA

- One-line recap of the promise delivered
- "Save this for your next project 🔖" (saves > likes for reach) + "Follow @Luciano655dev for daily dev deep dives"
- `visual_tip`: profile handle large with an understated accent divider. No follow-button mockup or badge.

## Caption

- First line = hook restated (caption is truncated after ~1 line in feed)
- 2–4 short lines of value or context, then "Save this 🔖"
- 5 hashtags, mixing broad (#programming #softwareengineering #webdev) and specific to the day's topic
