# Article Topic Selection — the deep technical quality bar

This file applies only to the Dev.to/TabNews research session. Use `social-topics.md` for the separate Twitter/Instagram topic.

The entire system lives or dies on this choice. A perfectly written post about a boring topic is worthless.

## What qualifies

A topic must pass ALL of these gates:

1. **Timeless.** Still useful to read in 3 years. No news, no releases, no "X just launched", no drama, no benchmarks of this month's model.
2. **Teaches something concrete.** The reader finishes knowing how to DO something, or understanding WHY something works, that they didn't before. "Awareness" posts fail this gate.
3. **The bookmark test.** Would a mid-level developer save this to reread? Would a senior send it to a junior and say "read this"?
4. **Has meat.** There are real examples, real code, real numbers, real failure modes to show. If the post could be written without research, the topic is too shallow.
5. **A strong opinion or surprising angle is possible.** "Intro to Docker" fails. "Everything your Dockerfile does wrong, ranked by how much it costs you" passes.

## Proven topic families (rotate between them, never repeat an angle)

- **Invisible fundamentals** — things everyone uses and nobody understands: event loop, DNS resolution, TCP handshakes, database indexes, character encodings, floating point, timezones, CORS, JWT internals.
- **Failure-mode engineering** — idempotency, retries and backoff, race conditions, cache invalidation, distributed clocks, N+1 queries, connection pooling, graceful shutdown.
- **"You're doing X wrong"** — common practices that are actually harmful, with evidence: premature microservices, useless unit tests, over-abstraction, misused ORMs.
- **Visualized/explained internals** — how V8 optimizes, how React reconciles, how Git stores objects, how an LLM tokenizes, how SQL planners decide.
- **Career-compounding skills** — code review technique, debugging methodology, reading unfamiliar codebases, estimating, writing design docs. (Max 1 in 7 days; dev audiences saturate on career content.)
- **AI for builders (timeless layer only)** — prompt-injection fundamentals, evals, RAG failure modes, agent design patterns, context-window economics. Never model news.

## Banned

- Anything that starts from a news event or product launch
- "Top N tools/extensions/sites" listicles with no teaching inside
- Motivational fluff ("just build projects!") with no technique
- Language wars and framework wars framed as wars (a technical comparison with criteria is fine)
- Anything already covered in the topic history (check `GET /api/topics` — also reject *near*-duplicates: "How DNS works" after "DNS explained" is a repeat)

## How to pick

Brainstorm at least 5 candidates from different families. For each, write one line: the surprising claim the post will make. Pick the one whose claim you'd most want to click. If none feels like a must-click, brainstorm 5 more — never settle.
