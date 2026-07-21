# Instagram Carousel Image-Creation Prompt

Create a complete 4:5 Instagram carousel from the slide content I provide.

Match this visual direction:

- Use a near-black background: `#0A0A0A`
- Use warm white text: `#F3F3F0`
- Use gray secondary text: `#9A9A95`
- Use lime green as the only accent: `#C7F246`
- Use Inter for bold headlines and body text
- Use Instrument Serif Italic for one emphasized word or short phrase
- Use IBM Plex Mono for code, values, and technical labels

The style should feel like a premium developer portfolio or modern technology editorial: minimal, professional, dark, clean, technical, visually striking, and inspired by the luciano655.com aesthetic.

The first slide must be the most minimalistic:

- one very large headline
- one lime italic phrase
- one short supporting sentence
- one subtle topic-related visual
- lots of breathing room
- simple, catchy, and made to stop scrolling

For the other slides, do not create plain text posters. Give every slide a strong custom composition based on its meaning. Use visuals such as timelines, flows, comparisons, code fragments, diagrams, metrics, arrows, system maps, or state changes when they help explain the idea.

Keep visuals simple but substantial. They should occupy meaningful space, be easy to understand, and feel integrated with the text.

Layout rules:

- keep the composition more centralized
- avoid placing one element too high and another too low with a giant empty gap between them
- group related text and visuals closer together
- make each slide feel balanced and compact
- use the canvas intentionally so the design feels complete, not sparse or unfinished
- keep strong spacing, but do not let empty space break the composition

Visual quality rules:

- visuals must never feel broken
- do not allow overlapping text, lines, diagrams, or components
- do not let labels collide with shapes
- do not crop important parts of diagrams
- make every diagram clean, readable, and structurally correct
- if a visual is used, it must be large enough to read and polished enough to look intentional

Vary the layout across slides:

- visual on one side and text on the other
- diagram above with headline below
- large code or metric as the main visual
- full-width timeline or flow
- comparison occupying most of the canvas

Do not repeat the exact same layout on every slide.

Use thin, precise lines for diagrams:

- normal lines: `#3A3A36`
- subtle borders: `#232323`
- important path or state: `#C7F246`

If there is a CTA or final slide, use:

- Follow `@Luciano655dev`
- Highlight `@Luciano655dev` in `#C7F246`

Avoid:

- slide counters
- “swipe” text
- generic top labels
- repeated footers
- decorative badges
- unnecessary cards
- tiny visuals
- awkward empty gaps
- overlapping components
- broken diagrams
- blue or purple
- gradients
- generic Canva or startup-ad styling

Keep the carousel minimal, but not empty. Each slide should have one clear focal point, one meaningful visual idea, and a balanced composition.

Body-slide editorial density:

- This applies to every slide except the first and final slide
- Aim for 20 to 38 words of body copy; keep 18 to 45 words as a flexible fit range
- Use the space to explain a mechanism plus its consequence, evidence, constraint, or engineering decision
- The body must add new information instead of repeating the headline
- Prefer two compact sentences when one sentence would become vague
- Include at least one concrete API, condition, number, failure path, comparison, or action
- Keep the copy readable as one mobile carousel image; if the explanation needs more than 45 words, narrow the slide to one sharper idea

## Content Central render contract

Plan every slide privately before rendering and store the result in `visual_plan`; never print planning fields on the image. Every slide needs an exact title-contained `accent_phrase` and a meaningful structured `visual` whose type matches `visual_plan.grammar`.

Supported visual types are `timeline`, `comparison`, `flow`, `cause_effect`, `code`, `numeric`, `layered`, `transformation`, `loop`, `spatial`, and `illustration`. Supported compositions are `headline_top`, `visual_top`, `split_left`, `split_right`, `centered`, and `visual_dominant`.

Set these Instagram bundle fields for every newly generated or replaced carousel:

```json
{
  "layout_style": "balanced",
  "render_revision": "a new unique revision for this render",
  "cta_handle": "@Luciano655dev"
}
```

`render_revision` must change whenever images are replaced. Content Central uses it to invalidate old browser image URLs. The final PNGs are rendered programmatically at exactly 1080 × 1350 using real font layers and deterministic vector/canvas graphics; do not call a paid image API.
