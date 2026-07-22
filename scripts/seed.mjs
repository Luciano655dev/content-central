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
  social_topic: "Copy any DevTools value straight to your clipboard",
  social_topic_rationale:
    "The copy() console utility solves a tiny annoyance in seconds, needs no setup, and is useful often enough to save for later.",
  social_research_sources: [
    {
      title: "Chrome DevTools — Console Utilities API",
      url: "https://developer.chrome.com/docs/devtools/console/utilities",
    },
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
        text: "STOP RE-TYPING CONSOLE DATA\n\nChrome DevTools can copy any value or object straight to your clipboard with one tiny command 🧵",
        image_slide: 1,
      },
      {
        text: "Here’s the whole trick:\n\ncopy(myVariable)\n\nRun it in the DevTools console and the value lands in your clipboard, no selecting giant console output by hand",
        image_slide: 2,
      },
      {
        text: "Objects work too\n\ncopy({ user, flags, response })\n\nDevTools serializes the value for the clipboard, which is way cleaner than dragging across a collapsed object preview",
        image_slide: 3,
      },
      {
        text: "It also works with query results\n\ncopy($$('a').map(link => link.href))\n\nThat grabs every link on the page and puts the list right where you need it",
        image_slide: 4,
      },
      {
        text: "That’s it, one command you’ll use constantly once you remember it\n\nSave copy(value) for the next time the console gives you something annoying to move",
      },
    ],
  },
  instagram: {
    caption:
      "Stop selecting giant console output by hand\n\nRun copy(value) in Chrome DevTools and it goes straight to your clipboard\n\nSave this one 🔖\n\n#programming #webdev #javascript #devtools #productivity",
    layout_style: "balanced",
    render_revision: "seed-copy-devtools-v1",
    cta_handle: "@Luciano655dev",
    slides: [
      {
        title: "Stop Re-Typing Console Data",
        accent_phrase: "Console Data",
        body: "One DevTools command sends any value straight to your clipboard",
        visual_tip: "A minimal console-to-clipboard transformation makes the shortcut obvious at a glance.",
        visual_plan: { core_message: "DevTools can copy values directly", relationship: "before and after", grammar: "transformation", focal_point: "copy(value)", secondary_information: "console to clipboard", accent_location: "clipboard result", composition: "headline_top" },
        visual: { type: "transformation", before: "console value", action: "copy(value)", after: "clipboard" },
      },
      {
        title: "Use copy()",
        accent_phrase: "copy()",
        body: "Run copy(myVariable) in the console and paste the result anywhere",
        visual_tip: "A compact code card keeps the one-line command dominant.",
        visual_plan: { core_message: "The command takes one value", relationship: "instruction", grammar: "code", focal_point: "copy(myVariable)", secondary_information: "one console line", accent_location: "copy", composition: "visual_dominant" },
        visual: { type: "code", label: "DEVTOOLS CONSOLE", lines: ["copy(myVariable)"], highlight: "copy" },
      },
      {
        title: "Objects Stay Useful",
        accent_phrase: "Useful",
        body: "Copy a real object instead of selecting text from its collapsed preview",
        visual_tip: "A clean comparison shows manual selection losing to a direct object copy.",
        visual_plan: { core_message: "Direct copy preserves useful object output", relationship: "comparison", grammar: "comparison", focal_point: "direct object copy", secondary_information: "manual selection", accent_location: "copy object", composition: "split_left" },
        visual: { type: "comparison", left: "select output\nby hand", right: "copy(object)\nthen paste", accent: "right" },
      },
      {
        title: "Grab Every Link",
        accent_phrase: "Every Link",
        body: "Combine copy() with $$() to collect all page links in seconds",
        visual_tip: "A short three-node flow connects the page query to the clipboard.",
        visual_plan: { core_message: "Console utilities combine into quick extraction", relationship: "sequence", grammar: "flow", focal_point: "clipboard list", secondary_information: "query all anchors", accent_location: "copied URLs", composition: "visual_top" },
        visual: { type: "flow", items: [{ label: "$$('a')" }, { label: "map href" }, { label: "copy URLs", accent: true }] },
      },
      {
        title: "Keep This Shortcut",
        accent_phrase: "Shortcut",
        body: "Save copy(value) for the next annoying console result",
        visual_tip: "A quiet final code card repeats the useful command beside the branded CTA.",
        visual_plan: { core_message: "Remember the reusable shortcut", relationship: "recap", grammar: "code", focal_point: "copy(value)", secondary_information: "save for later", accent_location: "copy", composition: "centered" },
        visual: { type: "code", lines: ["copy(value)"], highlight: "copy" },
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
