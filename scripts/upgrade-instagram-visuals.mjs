#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import postgres from "postgres";

const appUrl = process.env.INGEST_URL ?? "https://content-central-alpha.vercel.app";
const token = process.env.INGEST_TOKEN;
const databaseUrl = process.env.CONTENT_CENTRAL_POSTGRES_URL ?? process.env.CONTENT_CENTRAL_DATABASE_URL;
const prepareOnly = process.argv.includes("--prepare-only");
const onlyDate = process.argv.find((argument) => argument.startsWith("--only="))?.slice("--only=".length);

if ((!token && !prepareOnly) || !databaseUrl) {
  throw new Error("CONTENT_CENTRAL_POSTGRES_URL is required; INGEST_TOKEN is also required unless --prepare-only is used");
}

const plan = (core_message, relationship, grammar, focal_point, secondary_information, accent_location, composition) => ({
  core_message,
  relationship,
  grammar,
  focal_point,
  secondary_information,
  accent_location,
  composition,
});

const clockSlides = [
  {
    title: "Your Stopwatch Can Lie",
    body: "A request can take 200 ms and still log −800 ms.",
    accent_phrase: "Lie",
    visual_tip: "A compact broken clock path sits directly below the cover message and exposes the impossible result.",
    visual_plan: plan("Wall-clock subtraction can report an impossible duration.", "error and correction", "illustration", "the negative elapsed result", "real work versus corrected wall time", "the descending lime path", "centered"),
    visual: {
      type: "illustration",
      label: "200 MS OF WORK / −800 MS REPORTED",
      nodes: [
        { id: "start", label: "START", detail: "00.900", x: 14, y: 38 },
        { id: "work", label: "+200 ms", x: 50, y: 38 },
        { id: "end", label: "−800 ms", detail: "reported", x: 86, y: 68, accent: true },
      ],
      links: [
        { from: "start", to: "work" },
        { from: "work", to: "end", accent: true },
      ],
    },
  },
  {
    title: "One Machine, Two Clocks",
    body: "Wall time has a shared epoch and may be adjusted by NTP. Monotonic time has a local origin and never steps backward, which makes it safe for elapsed work.",
    accent_phrase: "Two Clocks",
    visual_tip: "A large centralized comparison makes each clock's responsibility unmistakable.",
    visual_plan: plan("Applications need separate clocks for timestamps and durations.", "comparison", "comparison", "when versus how long", "shared epoch versus local origin", "monotonic clock", "centered"),
    visual: { type: "comparison", label: "DIFFERENT QUESTIONS / DIFFERENT INSTRUMENTS", left: "WALL CLOCK\nWHEN?\nISO timestamp", right: "MONOTONIC\nHOW LONG?\n187.4 ms", accent: "right" },
  },
  {
    title: "Why Date.now() Fails",
    body: "Date.now() reads adjustable civil time twice. If synchronization changes that clock between reads, the subtraction absorbs the correction and can become negative or wildly inflated.",
    accent_phrase: "Fails",
    visual_tip: "The faulty expression becomes the slide's central visual, with only the adjustable clock fragment highlighted.",
    visual_plan: plan("Date.now subtraction measures wall-clock adjustment too.", "implementation error", "code", "two adjustable wall-clock reads", "a correction between the reads", "Date.now()", "visual_dominant"),
    visual: { type: "code", label: "THE LATENT BUG", lines: ["const start = Date.now();", "await work();", "const elapsed = Date.now() - start;", "// elapsed: -800 ms"], highlight: "Date.now()" },
  },
  {
    title: "A Clock Step Becomes A Bug",
    body: "A clock step corrupts the duration first. That invalid value can then reach scheduling, retry, or weighted-selection logic where code assumes elapsed time is always non-negative.",
    accent_phrase: "Bug",
    visual_tip: "A full-width cause-and-effect path groups the source, turning point, and failure into one compact system.",
    visual_plan: plan("A clock correction propagates through application assumptions.", "cause and effect", "cause_effect", "the correction as turning point", "negative duration and panic", "clock steps", "visual_top"),
    visual: { type: "cause_effect", label: "THE FAILURE PATH", source: "wall-clock read", turning_point: "clock steps", outcome: "negative duration → panic" },
  },
  {
    title: "Small Number. Real Incident.",
    body: "During the 2017 leap second, negative durations reached Cloudflare’s DNS selection code and triggered panics. Peak impact was roughly 0.2% across machines in 102 data centers.",
    accent_phrase: "Real Incident",
    visual_tip: "A dominant 0.2% metric and short scale annotation fill the central canvas without decorative cards.",
    visual_plan: plan("Small percentages can represent a correlated global failure.", "measurement and scale", "numeric", "0.2 percent", "102 data centers", "0.2%", "centered"),
    visual: { type: "numeric", label: "CLOUDFLARE / 2017 LEAP SECOND", value: "0.2%", context: "DNS queries affected at peak", comparison: "correlated across machines in 102 data centers" },
  },
  {
    title: "Measure With performance.now()",
    body: "performance.now() is relative to a local origin and monotonic. Use it for latency, benchmarks, timeouts, and deadlines; keep Date for timestamps that must be stored or shared.",
    accent_phrase: "performance.now()",
    visual_tip: "A broad state change replaces the adjustable clock with the monotonic timing API.",
    visual_plan: plan("Replace wall-clock timing with a monotonic measurement.", "state correction", "transformation", "the corrected API", "same operation, correct instrument", "performance.now()", "visual_dominant"),
    visual: { type: "transformation", label: "CHANGE THE INSTRUMENT", before: "Date.now()\nadjustable wall time", action: "measure duration", after: "performance.now()\nmonotonic elapsed time" },
  },
  {
    title: "Deadlines Preserve The Budget",
    body: "Create one monotonic deadline. Before every nested call, subtract performance.now() and pass only the remaining time so auth, database, and upstream share the same 250 ms budget.",
    accent_phrase: "Preserve",
    visual_tip: "A full-width 250 ms timeline keeps all stages close to the headline and ends at one lime deadline.",
    visual_plan: plan("A shared monotonic deadline preserves one request budget.", "sequence and constraint", "timeline", "one final deadline", "auth, database, and upstream consumption", "remaining 14 ms", "headline_top"),
    visual: {
      type: "timeline",
      label: "ONE REQUEST / 250 MS TOTAL",
      items: [
        { label: "AUTH", detail: "42 ms" },
        { label: "DB", detail: "145 ms" },
        { label: "UPSTREAM", detail: "49 ms" },
        { label: "14 MS LEFT", detail: "deadline", accent: true },
      ],
    },
  },
  {
    title: "Keep Time In Its Lane",
    body: "Wall time tells when. Monotonic time tells how long.",
    accent_phrase: "Its Lane",
    visual_tip: "A resolved two-path flow becomes the final visual callback and stays grouped with the CTA.",
    visual_plan: plan("Reliable systems route each time question to the right clock.", "resolved flow", "flow", "two correct output paths", "timestamp and duration responsibilities", "monotonic path", "visual_dominant"),
    visual: {
      type: "flow",
      label: "THE RELIABLE MODEL",
      items: [
        { label: "WHEN?", detail: "wall clock" },
        { label: "HOW LONG?", detail: "monotonic", accent: true },
        { label: "CORRECT DATA", detail: "timestamp + duration" },
      ],
    },
  },
];

const poolSlides = [
  {
    title: "More Connections Can Be Slower",
    body: "Your database pool is a queue protecting a finite machine—not a bucket of speed.",
    accent_phrase: "Slower",
    visual_tip: "A quiet funnel shows many clients converging on one finite database boundary.",
    visual_plan: plan("More concurrent connections can reduce throughput.", "constraint and bottleneck", "illustration", "the finite database", "clients funnel through a bounded pool", "the pool boundary", "headline_top"),
    visual: {
      type: "illustration",
      label: "FINITE MACHINE",
      nodes: [
        { id: "clients", label: "100 clients", x: 12, y: 28 },
        { id: "pool", label: "pool / queue", x: 50, y: 55, accent: true },
        { id: "db", label: "PostgreSQL", x: 88, y: 55 },
      ],
      links: [
        { from: "clients", to: "pool", accent: true },
        { from: "pool", to: "db" },
      ],
    },
  },
  {
    title: "20 Connections Won",
    body: "AWS measured 426.8 TPS with 20 server connections versus 377.9 TPS with 100.",
    accent_phrase: "20 Connections",
    visual_tip: "One dominant throughput number exposes the counterintuitive winner.",
    visual_plan: plan("A smaller server-side pool completed more transactions.", "measurement and comparison", "numeric", "426.8 TPS", "20 connections versus 100", "the winning throughput", "centered"),
    visual: { type: "numeric", label: "AWS RDS PROXY TEST", value: "426.8", context: "TPS with 20 connections", comparison: "100 connections → 377.9 TPS" },
  },
  {
    title: "The Queue Always Exists",
    body: "Wait in the pool: cheap and observable. Wait inside PostgreSQL: contention, locks, cache churn, and I/O.",
    accent_phrase: "Queue",
    visual_tip: "A request flow contrasts the controlled queue with the expensive pressure zone.",
    visual_plan: plan("Overload waits either in the pool or inside the database.", "flow and tradeoff", "flow", "the controlled pool queue", "database contention after admission", "pool queue", "split_left"),
    visual: {
      type: "flow",
      label: "CHOOSE WHERE WORK WAITS",
      items: [
        { label: "REQUESTS", detail: "burst" },
        { label: "POOL QUEUE", detail: "bounded + observable", accent: true },
        { label: "DATABASE", detail: "CPU · locks · I/O" },
      ],
    },
  },
  {
    title: "Budget Globally",
    body: "DB limit 200 − reserve 30, across 8 instances = 21 max each. Leave room for deploys and diagnosis.",
    accent_phrase: "Globally",
    visual_tip: "Stacked capacity layers descend from database limit to the per-instance ceiling.",
    visual_plan: plan("Pool size is a global capacity allocation.", "hierarchy and distribution", "layered", "21 connections per instance", "global limit, reserve, and replica count", "per-instance ceiling", "visual_top"),
    visual: {
      type: "layered",
      label: "CAPACITY CASCADE",
      layers: [
        { label: "DATABASE LIMIT", detail: "200" },
        { label: "OPERATIONAL RESERVE", detail: "−30" },
        { label: "AUTOSCALE CEILING", detail: "÷ 8 instances" },
        { label: "PER INSTANCE", detail: "21 max", accent: true },
      ],
    },
  },
  {
    title: "Never Leak The Lease",
    body: "Use try/finally around pool.connect(). For one independent query, prefer pool.query().",
    accent_phrase: "Never Leak",
    visual_tip: "A compact real code block makes guaranteed release the only highlighted fragment.",
    visual_plan: plan("Every checked-out connection must return to the pool.", "implementation and guarantee", "code", "client.release() in finally", "the acquisition and work around it", "release", "visual_dominant"),
    visual: { type: "code", label: "GUARANTEED RETURN", lines: ["const client = await pool.connect();", "try {", "  await work(client);", "} finally {", "  client.release();", "}"], highlight: "client.release()" },
  },
  {
    title: "Bound Wait And Work",
    body: "Set acquisition and server-side statement timeouts. A local Promise timeout does not guarantee SQL stopped.",
    accent_phrase: "Bound",
    visual_tip: "Nested deadlines show shorter inner limits protecting the complete request budget.",
    visual_plan: plan("Every wait and execution phase needs a real bound.", "time hierarchy", "timeline", "ordered nested deadlines", "SQL, pool, API, and client budgets", "the SQL stop", "headline_top"),
    visual: {
      type: "timeline",
      label: "FAIL INSIDE → OUT",
      items: [
        { label: "SQL", detail: "1.5 s", accent: true },
        { label: "POOL", detail: "2 s" },
        { label: "API", detail: "4 s" },
        { label: "CLIENT", detail: "5 s" },
      ],
    },
  },
  {
    title: "Watch These Four Signals",
    body: "Acquisition p95, waiting count, hold time by route, and database CPU/locks reveal where pressure lives.",
    accent_phrase: "Four Signals",
    visual_tip: "Four spatial regions map app-side queue pressure to database-side saturation.",
    visual_plan: plan("Pool health needs queue and database signals together.", "distribution and diagnosis", "spatial", "the four diagnostic signals", "application side versus database side", "acquisition p95", "split_right"),
    visual: {
      type: "spatial",
      label: "ONE PRESSURE MAP",
      regions: [
        { label: "ACQUISITION P95", detail: "queue latency", accent: true },
        { label: "WAITING COUNT", detail: "queued demand" },
        { label: "HOLD TIME", detail: "by route" },
        { label: "DB CPU + LOCKS", detail: "inside the machine" },
      ],
      relation: "10/10 used alone is not an incident",
    },
  },
  {
    title: "Find The Measured Knee",
    body: "Sweep pool sizes under fixed load. Choose the smallest value near peak throughput.",
    accent_phrase: "Measured Knee",
    visual_tip: "The final state replaces a maximum-size guess with the smallest measured winner.",
    visual_plan: plan("Load testing should choose the smallest pool near peak throughput.", "state transformation", "transformation", "the measured operating point", "fixed-load sweep and throughput plateau", "measured knee", "visual_dominant"),
    visual: { type: "transformation", label: "SIZE BY EVIDENCE", before: "largest pool\nthat boots", action: "sweep fixed load", after: "smallest pool\nnear peak TPS" },
  },
];

const upgrades = new Map([
  ["2026-07-19", { slides: poolSlides, tweetSlides: [1, 2, 3, 4, 5, 7, 8] }],
  ["2026-07-20", {
    slides: clockSlides,
    tweets: [
      {
        text: "YOU’RE MEASURING REQUEST TIME WRONG.\n\nDate.now() can make a real 200 ms request report −800 ms. The arithmetic is fine—the wall clock moved.\n\nWall clocks can jump. Your duration clock must not. 🧵",
        image_slide: 1,
      },
      {
        text: "One machine exposes two different ideas of time:\n\nWall clock → a shared timestamp that NTP may correct.\nMonotonic clock → a process-local counter that never steps backward.\n\nUse the first for “when.” Use the second for “how long.”",
        image_slide: 2,
      },
      {
        text: "This is the latent bug:\n\nconst start = Date.now();\nawait work();\nconst ms = Date.now() - start;\n\nIf synchronization moves wall time between those reads, ms includes the correction. It can become negative or far larger than the work.",
        image_slide: 3,
      },
      {
        text: "Cloudflare hit this during the 2017 leap second.\n\nNegative elapsed values reached DNS resolver selection code and eventually a Go function that panics on negative input.\n\nPeak impact: ~0.2% of DNS queries, across machines in 102 data centers.",
        image_slide: 5,
      },
      {
        text: "The JavaScript fix is small:\n\nconst start = performance.now();\nawait work();\nconst ms = performance.now() - start;\n\nperformance.now() is monotonic and process-local, so clock synchronization cannot turn a valid interval negative.",
        image_slide: 6,
      },
      {
        text: "Use the same clock for deadlines.\n\nIf a request has 250 ms, create one monotonic deadline and pass the remaining budget downward.\n\nDo not give auth, database, and upstream a fresh 250 ms each—that silently turns one budget into 750 ms.",
        image_slide: 7,
      },
      {
        text: "A monotonic reading is not a timestamp.\n\nNever persist it, compare it across machines, or put it in a distributed event. Its origin belongs to one process and disappears on restart.\n\nStore wall time; use monotonic time only for the local countdown.",
      },
      {
        text: "Wall time tells you when. Monotonic time tells you how long.\n\nKeep both: an ISO timestamp for correlation, a monotonic duration for latency.\n\nWhich helper still subtracts two Date.now() values?\n\nFollow @Luciano655dev for more dev deep dives.",
        image_slide: 8,
      },
    ],
    instagram: {
      layout_style: "balanced",
      render_revision: "wall-clock-balanced-20260721-v3-depth",
      cta_handle: "@Luciano655dev",
    },
  }],
]);

const sql = postgres(databaseUrl, { ssl: "require", max: 1, prepare: false });
try {
  const [state] = await sql`select value from content_central_state where key = 'posts'`;
  const posts = state?.value ?? [];
  const preparedRows = [];
  await mkdir(".data", { recursive: true });

  for (const post of posts) {
    if (onlyDate && post.date !== onlyDate) continue;
    const upgrade = upgrades.get(post.date);
    if (!upgrade) continue;
    const bundle = {
      ...post,
      instagram: { ...post.instagram, ...upgrade.instagram, slides: upgrade.slides },
      twitter: {
        ...post.twitter,
        tweets: upgrade.tweets ?? post.twitter.tweets.map((tweet, index) => {
          const nextTweet = { ...tweet, image_slide: upgrade.tweetSlides[index] };
          delete nextTweet.image_tip;
          return nextTweet;
        }),
      },
    };
    delete bundle.id;
    delete bundle.status;
    delete bundle.created_at;

    const body = `${JSON.stringify(bundle, null, 2)}\n`;
    await writeFile(`.data/bundle-${post.date}.json`, body);
    if (post.date === "2026-07-20") await writeFile(".data/bundle.json", body);
    preparedRows.push({ ...post, instagram: bundle.instagram, twitter: bundle.twitter });

    if (prepareOnly) {
      console.log(JSON.stringify({ date: post.date, slides: upgrade.slides.length, prepared: true }));
      continue;
    }

    const response = await fetch(`${appUrl}/api/ingest`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(`${post.date}: ${response.status} ${JSON.stringify(result)}`);
    console.log(JSON.stringify({ date: post.date, slides: upgrade.slides.length, result }));
  }
  if (prepareOnly) {
    await writeFile(".data/posts.json", `${JSON.stringify(preparedRows, null, 2)}\n`);
  }
} finally {
  await sql.end();
}
