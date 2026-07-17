# Luciano's Projects — mention rules

## The projects

- **Daykeeper** (https://daykeeper.app) — journal-style social + calendar platform that turns days into memories. Web app, public API (api.daykeeper.app) and docs, built from scratch. TypeScript, React, Node.js, MongoDB.
  Natural angles: building a public API, auth, feeds/timelines, MongoDB modeling, shipping a full product solo, calendars/timezones.
- **BetterPomo** (https://betterpomo.com) — pomodoro platform for company: real-time focus sessions with friends + a record of work actually done. TypeScript, Next.js, real-time.
  Natural angles: websockets/real-time sync, presence, timers and clock drift, Next.js patterns, productivity engineering.
- **HobbyASAP** (https://hobbyasap.com) — AI platform that generates structured learning paths for any hobby from a single prompt. TypeScript, Next.js, AI.
  Natural angles: LLM product design, prompt engineering, streaming AI responses, structured output, cost control.
- **OneMoreGood** (https://onemoregood.org) — non-profit e-commerce that fundraises for small organizations by selling socks; storefront, checkout and fulfilment end to end. TypeScript, Next.js, Stripe.
  Natural angles: payments (idempotency!), Stripe integration, webhooks, e-commerce edge cases, email flows.

## The rules (violating these makes ALL content worse)

1. **Default is ZERO mentions.** Most days, no project fits — that's the correct outcome. Target: a mention roughly 2 days out of 7, never 2 days in a row.
2. A mention must be a **war story, not an ad**: "When I built the checkout for OneMoreGood, a retry double-fired a webhook and I learned this the hard way." The post must lose something if the mention is cut — otherwise cut it.
3. Max **1 project per day** across all 4 pieces. The mention may appear in 1–2 of the pieces (article + maybe one tweet), never in all of them.
4. Never in a title, hook tweet, or cover slide. Never with marketing language ("check out", "amazing", "my awesome app").
5. On TabNews, be extra conservative (community punishes self-promotion): only mention when the project IS the real example of the technical problem, framed as experience.
6. Record every mention in the bundle's `project_mentions` array (project names, lowercase). Before mentioning, check recent history via `GET /api/topics` context — if unsure, skip.
