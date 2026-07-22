# Instagram Carousel Image-Creation Prompt
Create a complete 4:5 Instagram carousel from the slide content I provide.

==================================================
HYBRID RENDERING CONTRACT
==================================================

Use built-in `$imagegen` on only **2–4 selected slides and never every slide**. The other slides use Content Central's clean deterministic structured graphics. A generated bitmap is visual artwork only: never render a headline, paragraph, code, metric, label, CTA, username, logo, badge, letter, number, or watermark inside it. Content Central adds all exact typography afterward.

For a slide selected for generated artwork:
- generate one **simple, symbolic, topic-specific** visual with deliberate empty space matching the planned text position
- prefer one object, one relationship, or one visual metaphor that can be understood in a glance
- keep the background near-black and use lime as the only accent
- save the selected asset inside `.data/generated`
- set `generated_visual_path` and a short `generated_visual_alt` only on that slide
- retain the structured `visual` as the semantic source of truth

For every other slide, omit `generated_visual_path`, `generated_visual_key`, `generated_visual_url`, and `generated_visual_alt`. Its structured `visual` is the complete rendered visual.

Never generate complex scenes, realistic people, photorealistic hardware, cinematic 3D objects, meaningless abstract forms, decorative technology imagery, or detailed environments. If the image does not communicate the slide's idea without text, do not generate it.

Never use an OpenAI API key or paid image API. Use only built-in image generation from the signed-in Codex/ChatGPT subscription.

Important goal:
Do not turn this into a rigid template.
All slides in the carousel should feel visually related, but each post must still feel original and custom-made for its own topic.

The carousel should share the same brand language every time:
- near-black background
- warm white text
- gray supporting text
- lime green accent
- Inter for clean bold text
- Instrument Serif Italic for emphasis
- IBM Plex Mono for code and technical labels
- premium, modern, minimal, editorial, developer-focused style

But the composition, visual idea, and layout should adapt to the content of each specific post.

==================================================
VISUAL SYSTEM
==================================================

Use:
- Background: #0A0A0A
- Primary text: #F3F3F0
- Secondary text: #9A9A95
- Muted text: #6F6F69
- Accent: #C7F246
- Border: #232323
- Diagram line: #3A3A36

Fonts:
- Headline and body: Inter, Helvetica Neue, Arial, sans-serif
- Emphasized word or phrase: Instrument Serif Italic, Georgia, Times New Roman, serif
- Code and labels: IBM Plex Mono, SFMono-Regular, Menlo, Consolas, monospace

==================================================
STYLE DIRECTION
==================================================

The design should feel like:
- a premium developer portfolio
- a modern technology editorial
- minimal, clean, sharp, technical, and professional
- visually elegant and intentional
- simple, but not empty
- creative, but not chaotic
- immediately understandable instead of visually impressive for its own sake

Avoid:
- looking like a fixed reusable template
- repeated post structures that make all posts feel the same
- generic Canva-style slides
- startup-ad styling
- random decorations
- heavy gradients
- badges
- blue or purple
- repeated top labels
- repeated footer labels on every slide
- generic filler elements that do not help the post

==================================================
MOST IMPORTANT CREATIVE RULE
==================================================

Each post must have its own visual identity inside the brand system.

That means:
- keep the same colors, fonts, and overall style
- but do not repeat the same layout every time
- do not always place the headline in the exact same place
- do not always place the visual in the exact same position
- do not always use the same type of diagram
- do not make every first slide look like the same template with different text

Instead:
For each post, choose a composition and visual language that best matches the topic.

Examples:
- A post about timing can use a timeline or path
- A post about overload can use pressure or amplification visuals
- A post about architecture can use layers or blocks
- A post about tradeoffs can use comparison layouts
- A post about errors can use broken or diverging flows
- A post about sequence can use steps or transitions

The result should feel like:
"same brand, new custom design"
not
"same post template, different words"

==================================================
FIRST SLIDE RULES
==================================================

The first slide must be the most minimal and the most catchy.

Use:
- one very large headline
- one emphasized word or phrase in lime green using Instrument Serif Italic
- one short supporting sentence
- one subtle but meaningful topic-related visual
- strong negative space
- a composition that feels polished and balanced

Important:
The first slide should not always look identical across posts.
It should always feel minimal and premium, but the arrangement can change depending on the topic.

Examples of acceptable cover variations:
- visual on the right, text on the left
- visual lightly behind the text
- visual below the headline
- visual as a cropped technical fragment
- text block higher or lower depending on balance

Do not force the same cover composition every time.

The cover must identify the exact problem or payoff in one glance. A person should know within a second whether the post is relevant to them.

When the cover uses generated artwork, treat the artwork as a background layer and give the headline its own intentional region. `text_bottom` is preferred when the image occupies the upper or full background; split layouts are good when the visual has a clear side. Never scatter text over the busiest part of the image.

Typography rule:
The accent phrase should sit naturally with the rest of the headline.
Do not isolate it awkwardly into a separate column or disconnected area unless that is clearly the best composition.
For example, if "Lie" works best next to "Can", keep it near "Can".

==================================================
MIDDLE SLIDE RULES
==================================================

Every middle slide must:
- explain one main idea
- include one custom visual or structural element
- have a strong composition
- feel integrated and intentional
- avoid looking like a text poster
- stay simple enough to understand while scrolling

Possible custom visuals:
- timelines
- request/response flows
- comparison layouts
- step progressions
- system diagrams
- state transitions
- code snippets
- metrics
- visual equations
- pressure maps
- relationship maps
- architectural layers
- cause and effect graphics
- before and after structures

The visual must be chosen based on the meaning of the content, not reused blindly.

Do not force clocks, boxes, or flows into every post.
Choose what fits the slide best.

==================================================
LAYOUT RULES
==================================================

Canvas:
- 1080 x 1350 px
- 4:5 portrait

Margins:
- keep safe margins of about 72 px minimum
- never place important content too close to edges

Composition:
- keep the slide balanced and more centralized
- do not create huge empty gaps between top and bottom content
- group related items together
- make the slide feel intentionally composed
- use negative space carefully, not lazily
- the layout should feel complete, not sparse or unfinished

Variation:
- vary layout from slide to slide
- text-left visual-right is okay sometimes
- visual-top text-bottom is okay sometimes
- centered structures are okay sometimes
- wide full-width diagrams are okay sometimes
- asymmetry is okay if balanced well

Do not:
- use the exact same composition on every slide
- place every visual too small in the middle of unused space
- push headline too far up while the visual sits too far down
- let layout feel disconnected

==================================================
PROFESSIONAL TYPOGRAPHY RULES
==================================================

The typography must look refined and intentional.

Use:
- strong headline hierarchy
- compact, elegant line breaks
- clear grouping of words
- readable support text
- thoughtful spacing

Do not:
- stretch the text block awkwardly
- force ugly line breaks
- separate words in unnatural ways
- place the accent word too far away from the main headline
- create a headline that reads like separate disconnected columns
- make body text too wide or too long
- allow multi-line body copy to become a giant text wall

The headline should feel designed, not auto-wrapped.

==================================================
BUG PREVENTION RULES
==================================================

This is critical.

Do not generate broken layouts.

Never allow:
- overlapping text and visuals
- overlapping diagram labels
- text flowing outside containers
- boxes larger than the layout can support
- cropped diagrams where important content is cut off
- text that spills outside the canvas
- components misaligned with each other
- unreadable labels
- body text running into diagrams
- visuals that feel incomplete or malformed
- unbalanced layouts where one side is overloaded and the other side is empty

Every slide must be checked before final render for:
- proper alignment
- readable text
- correct spacing
- no clipping
- no overflow
- no collision between elements
- visually coherent component sizing

If a visual does not fit cleanly, simplify it.
Do not keep a broken visual just because it was planned.

==================================================
VISUAL QUALITY RULES
==================================================

Custom visuals should be:
- simple
- clean
- polished
- large enough to read
- integrated into the composition
- geometrically precise
- professional-looking
- meaningful without a long explanation

Use thin, precise lines:
- structure: #3A3A36
- subtle borders: #232323
- emphasis: #C7F246

Avoid visuals that are:
- tiny
- overly complex
- under-designed
- randomly placed
- floating without relationship to the text
- visually broken
- too weak to carry meaning
- realistic or complex without a direct informational purpose

If a slide includes a visual, it should feel worth having.

==================================================
FINAL SLIDE / CTA
==================================================

If a final CTA slide is needed:
- keep it premium and minimal
- make it feel like a designed ending, not a generic promo
- use a strong summary or invitation
- include "Follow @Luciano655dev"
- highlight @Luciano655dev in lime green
- optionally include luciano655.com
- keep the CTA subtle and professional

==================================================
IMPLEMENTATION MINDSET
==================================================

Before designing each slide, decide:
1. What is the core idea?
2. What is the best visual structure for this idea?
3. What layout best balances the text and the visual?
4. How can this slide feel custom to this topic while still matching the brand?

Then design the slide.

Do not just place the content into a repeated template.

==================================================
FINAL QUALITY CHECK
==================================================

Before exporting, verify:
- the slide uses the brand colors and fonts
- the design feels professional and polished
- the slide does not look like a reused template
- the slide is visually balanced
- the accent phrase is integrated naturally
- the visual is clean and meaningful
- there are no overlaps, overflows, stretched text blocks, or broken components
- the slide feels complete and intentional
- the carousel feels like one brand, but each post still feels unique
