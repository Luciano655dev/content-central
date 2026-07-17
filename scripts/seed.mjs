// Seeds one example bundle into the running app (local or deployed).
// Usage: node scripts/seed.mjs [base-url] [ingest-token]
//   Local (file store, no token check unless INGEST_TOKEN set): node scripts/seed.mjs
//   Deployed: node scripts/seed.mjs https://your-app.vercel.app $INGEST_TOKEN

const base = process.argv[2] ?? "http://localhost:3000";
const token = process.argv[3] ?? process.env.INGEST_TOKEN ?? "dev-token";

const today = new Date().toISOString().slice(0, 10);

const bundle = {
  date: today,
  topic: "Idempotency: the API design property nobody teaches you",
  topic_rationale:
    "Every backend dev eventually double-charges a customer or double-sends an email because of a retry. Idempotency is timeless, rarely taught well, and full of concrete patterns to show.",
  research_sources: [
    { title: "Stripe docs — Idempotent requests", url: "https://stripe.com/docs/api/idempotent_requests" },
    { title: "RFC 9110 — HTTP Semantics (idempotent methods)", url: "https://www.rfc-editor.org/rfc/rfc9110" },
  ],
  devto: {
    title: "Your API Will Double-Charge Someone. Here's How to Make Sure It Can't.",
    tags: ["webdev", "backend", "api", "tutorial"],
    body_markdown:
      "A user clicks *Pay*. The request times out. They click again.\n\nDid you just charge them twice?\n\nIf you can't answer that instantly, this post is for you.\n\n## What idempotency actually means\n\nAn operation is **idempotent** when running it N times has the same effect as running it once.\n\n```http\nPOST /payments\nIdempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324\n```\n\n## The pattern\n\n1. Client generates a unique key per *intent*\n2. Server stores the key with the first response\n3. Retries with the same key return the stored response\n\n```ts\nconst existing = await db.idempotencyKeys.find(key);\nif (existing) return existing.response;\n```\n\nThat's it. That's the whole trick Stripe uses.",
  },
  tabnews: {
    title: "Sua API vai cobrar alguém duas vezes. Veja como garantir que não vai.",
    body_markdown:
      "Um usuário clica em *Pagar*. A requisição dá timeout. Ele clica de novo.\n\nVocê acabou de cobrar duas vezes?\n\nSe você não sabe responder na hora, esse post é pra você.\n\n## O que idempotência significa de verdade\n\nUma operação é **idempotente** quando executá-la N vezes tem o mesmo efeito de executá-la uma vez.\n\n```http\nPOST /payments\nIdempotency-Key: 8e03978e-40d5-43e8-bc93-6894a57f9324\n```\n\n## O padrão\n\n1. O cliente gera uma chave única por *intenção*\n2. O servidor guarda a chave com a primeira resposta\n3. Retries com a mesma chave devolvem a resposta guardada\n\nÉ isso. É esse o truque que a Stripe usa.",
  },
  twitter: {
    tweets: [
      {
        text: "Your API has a bug that will double-charge a customer.\n\nYou just haven't hit it yet.\n\nHere's the 40-year-old idea that fixes it (thread) 🧵",
        image_tip: "Screenshot of a payment button with a loading spinner, glitch effect overlay. Dark background, red accent.",
      },
      {
        text: "The scenario:\n\n1. User clicks Pay\n2. Request times out\n3. User clicks Pay again\n\nTwo requests. One intent. If your server can't tell the difference, you charge twice.",
      },
      {
        text: "The fix is called idempotency.\n\nRun an operation N times = same result as running it once.\n\nDELETE is naturally idempotent. POST is not. And POST is where the money moves.",
        image_tip: "Simple table graphic: HTTP methods vs 'safe to retry?' with ✅/❌. Monospace font, terminal aesthetic.",
      },
      {
        text: "The pattern Stripe uses:\n\n→ Client sends a unique Idempotency-Key per intent\n→ Server stores key + response\n→ Same key again? Return stored response. No re-execution.\n\n3 steps. That's the whole thing.",
        image_tip: "Code snippet card of the key-check logic, syntax highlighted.",
      },
      {
        text: "Stop shipping APIs that punish users for retrying.\n\nRetries are not the edge case. They're the network being the network.\n\nFollow for more backend patterns that actually matter.",
      },
    ],
  },
  instagram: {
    caption:
      "The API design property nobody teaches you — until it costs someone money. Save this for your next backend project. 🔖\n\n#backend #api #softwareengineering #webdev #programming",
    slides: [
      {
        title: "Your API will double-charge someone.",
        body: "Unless you know this one property. Swipe →",
        visual_tip: "Bold white text on near-black background, red glitch accent on 'double-charge'. Big type, nothing else.",
      },
      {
        title: "The scenario",
        body: "User clicks Pay. Timeout. Clicks again.\nTwo requests. One intent.",
        visual_tip: "Minimal illustration: two arrows hitting a server icon, one labeled 'retry'.",
      },
      {
        title: "Idempotency",
        body: "Running an operation N times = the same effect as running it once.",
        visual_tip: "Definition card style: word + phonetics on top like a dictionary entry.",
      },
      {
        title: "The 3-step pattern",
        body: "1. Unique key per intent\n2. Store key + response\n3. Same key → same response",
        visual_tip: "Numbered steps, monospace font, terminal-window frame.",
      },
      {
        title: "Retries aren't the edge case.",
        body: "They're the network being the network. Design for them.\n\nFollow @you for daily backend patterns.",
        visual_tip: "CTA slide: handle + follow button mockup, accent color border.",
      },
    ],
  },
  project_mentions: [],
};

const res = await fetch(`${base}/api/ingest`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(bundle),
});

console.log(res.status, await res.text());
