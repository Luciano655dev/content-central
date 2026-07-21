# Dev.to Style Guide (English)

What the all-time top Dev.to posts have in common: educational depth + aspirational framing + visual signaling. "JavaScript Visualized: Event Loop" (4.4k reactions), "9 Projects to become a Frontend Master" (4.7k). The audience skews junior-to-mid; they reward posts that make hard things feel learnable — and they bookmark posts that feel like the DEFINITIVE take.

## The bar

You are writing the article that gives the reader a useful mental model and something they can apply today. It should feel substantial without feeling like homework: aim for a **4–8 minute read**, usually **1,000–1,700 words**. A flexible **900–2,000 word** band is acceptable when the topic genuinely needs it.

These numbers are editorial guidance, not a rigid pass/fail quota. Never pad a short draft. Never amputate a necessary explanation to hit the ceiling. If the article is running long, narrow the angle, remove repeated examples, and keep the clearest path through the idea. Every paragraph must add a concrete thing: an example, a failure mode, a number, a piece of code, or a decision rule.

The real completeness gate: by the end, the reader can explain the mechanism, use the solution, recognize a production failure mode, and make one concrete engineering decision. A 1,400-word post that does this is better than a 3,000-word encyclopedia.

## Title

- Promise a concrete transformation or reveal: "Here's how", "What actually happens when", "…and how to make sure it can't happen to you"
- Specificity beats cleverness: numbers, named technologies, named failure modes
- 8–14 words. One emoji at the start is on-brand for Dev.to (optional, never more than one)
- Formulas that work: "X Visualized", "What every dev gets wrong about X", "I did X so you don't have to", "X: the missing guide", "Stop doing X — do Y instead"

## The first 3 lines (non-negotiable)

The post is judged by its first screen. Open with one of:
- A **scenario the reader has lived**: "A user clicks Pay. The request times out. They click again."
- A **surprising claim**: "Your test suite is probably testing nothing."
- A **question they can't answer** but feel they should

Never open with "In this article we will…", a definition, or background history. Context comes AFTER the hook.

## Structure — a narrative arc, not a list of facts

The article must READ like a story the reader can't put down, with each section creating the question the next section answers:

1. **The hook scene** — the problem as the reader experiences it
2. **Why the obvious solution fails** — walk through the naive approach and break it in front of the reader
3. **The mechanism** — how the thing actually works underneath; this is the teaching core, go deep (internals, specs, real behavior — cite them)
4. **Building the real solution** — step by step, code-first, each step motivated by a failure of the previous one
5. **Production concerns** — edge cases, costs, monitoring, "what bit me": the section that makes seniors respect the post
6. **Common mistakes** — 3–5 specific mistakes with the WHY behind each
7. **Recap + one takeaway** — "If you remember one thing…" + a genuine question to the reader (comments drive the Dev.to algorithm)

Not every topic needs seven separate sections. Combine beats when that makes the reading smoother, but preserve the arc: problem → failed naive attempt → mechanism → solution → production reality. Prefer **5–7 purposeful sections** over a long catalogue.

## Depth requirements (hard rules)

- Across the article, include at least **3 concrete artifacts**: runnable code, a sourced number, a war story, a table, or an ASCII diagram. Place them where they clarify the argument; do not force one into every short transition section
- Usually include **2–3 substantial code blocks** — minimal, runnable, language-tagged. When code is the lesson, show the broken version and the fix. When the topic is conceptual, one excellent example plus a diagram may be stronger than artificial code
- At least **one real-world case** from a named source (engineering blog, postmortem, RFC, official docs) woven into the narrative — "when GitHub hit this in 2018…" beats any abstract explanation
- **The specificity test**: if a sentence could appear unchanged in an article about a different topic, delete it. "This can cause serious issues in production" — delete. "This holds a connection from the pool for the full 30s timeout, so 40 concurrent retries exhaust a default pg pool" — keep

## Clean reading (how it should FEEL)

- Short paragraphs: 1–3 sentences. White space is a feature
- Vary the rhythm: a one-line paragraph after two dense ones lands like a punch
- `##` headers every 180–300 words or whenever the argument turns; the headers alone should read as a coherent outline
- Use **bold** for the sentences you'd highlight if the reader only skims — one per section, not five
- Zero filler: no "it's important to note", "in today's fast-paced world", "let's dive in". Every sentence either teaches or moves the story

## Tags

Exactly 4, all lowercase, no spaces. First tag = biggest relevant community (`javascript`, `webdev`, `python`, `ai`, `programming`); include `beginners` or `tutorial` when honest — they are huge on Dev.to.

## Voice

Peer-to-peer, generous, a little playful. You're the colleague who explains things well, not a professor. First person is good. Admitting past mistakes ("I shipped this bug twice") builds trust and gets comments.
