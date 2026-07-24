#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = (process.env.CONTENT_CENTRAL_URL || "https://content-central-alpha.vercel.app").replace(/\/$/, "");
const token = process.env.INGEST_TOKEN;
const controlUrl = `${baseUrl}/api/agent/control`;
const bundlePath = path.join(repoRoot, ".data", "bundle.json");

if (!token) {
  console.error("INGEST_TOKEN is missing. Run with --env-file=.vercel/.env.production.local.");
  process.exit(1);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: repoRoot, stdio: "inherit", ...options });
    child.on("error", reject);
    child.on("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
  });
}

async function api(body, method = "POST") {
  const response = await fetch(controlUrl, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Control API ${response.status}: ${data.error || "unknown error"}`);
  return data;
}

async function complete(runId, ok, message) {
  try {
    await api({ action: "complete", runId, ok, message });
  } catch (error) {
    console.error(`Could not report completion: ${error.message}`);
  }
}

async function reportProgress(runId, update) {
  try {
    await api({ action: "progress", runId, ...update });
  } catch (error) {
    console.error(`Could not report progress: ${error.message}`);
  }
}

async function runWithHeartbeat(command, args, options, heartbeat) {
  const timer = setInterval(() => {
    void heartbeat();
  }, 15_000);
  try {
    return await run(command, args, options);
  } finally {
    clearInterval(timer);
  }
}

if (process.argv.includes("--self-test")) {
  const state = await api(null, "GET");
  const auth = await run(process.env.CODEX_BIN || "codex", ["login", "status"]);
  console.log(`Control API ready; schedule=${state.enabled ? state.time : "disabled"} ${state.timezone}`);
  process.exit(auth.code);
}

let claim;
let existingBundle;
try {
  ({ claim, bundle: existingBundle } = await api({ action: "claim" }));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!claim) process.exit(0);

console.log(`Starting ${claim.trigger} Codex ${claim.scope} run ${claim.runId}`);
await reportProgress(claim.runId, {
  progress: 10,
  phase: "Preparing content",
  message: "Preparing the existing post and generation instructions",
  log: "Prepared the trusted workspace and generation brief",
});
if (claim.scope !== "all") {
  if (!existingBundle) {
    await complete(claim.runId, false, "The control API did not return the post bundle");
    process.exit(1);
  }
  await writeFile(bundlePath, `${JSON.stringify(existingBundle, null, 2)}\n`, "utf8");
}
const startedAt = Date.now();
const childEnv = { ...process.env };
delete childEnv.OPENAI_API_KEY;
delete childEnv.ANTHROPIC_API_KEY;

const prompt = claim.scope === "all"
  ? [
      "Use $daily-content to research and write one new Content Central bundle.",
      `This is a ${claim.trigger} automation-runner request.`,
      claim.trigger === "manual"
        ? "Create a new, distinct topic even if another post already exists today."
        : "Create today's scheduled post.",
      "Run two independent research sessions: deep technical research for Dev.to and TabNews, then separate quick-useful research for Twitter and Instagram. The two sessions must have distinct topics, rationales, and sources.",
      "Save the validated result to .data/bundle.json.",
      "For Instagram, make an attention-first carousel with massive cover typography, compact spacing, large purpose-built graphics, and no dead zones. Use built-in $imagegen only on a few slides where simple meaningful artwork improves the idea. Keep the remaining slides as bold structured graphics. Save selected artwork inside .data/generated and set generated_visual_path plus generated_visual_alt only on those slides.",
      "Do not upload it yourself; the trusted local runner will ingest it after you finish.",
      "Do not use any model API key, SDK, Claude, or Anthropic.",
    ].join(" ")
  : claim.scope === "articles"
    ? [
        "Use $daily-content for an explicit article-session replacement run.",
        "Open .data/bundle.json and choose a new technical topic, run fresh deep research, then regenerate topic, topic_rationale, research_sources, devto, and tabnews.",
        "Keep date, all social_* fields, twitter, instagram, and every other protected field unchanged.",
        "Dev.to and TabNews must share the new technical research but be independently written for their communities.",
        "Save the complete validated bundle back to .data/bundle.json. Do not upload it yourself.",
      ].join(" ")
    : claim.scope === "social"
      ? [
          "Use $daily-content for an explicit social-session replacement run.",
          "Open .data/bundle.json and choose a new quick, useful social topic, run fresh independent research, then regenerate social_topic, social_topic_rationale, social_research_sources, twitter, and instagram.",
          "Keep date, topic, topic_rationale, research_sources, devto, tabnews, project_mentions, and every other protected field unchanged.",
          "Make Twitter highly informal, start forcefully, and never end a sentence with a period. Make Instagram instantly scannable, saveable, bold, and visually full.",
          "Use massive cover typography, compact spacing, and large purpose-built components. Use built-in $imagegen only on a few slides, with simple meaningful artwork composed around a tightly sized deterministic text layer. Leave the other slides without generated artwork.",
          "Assign a new render_revision, save selected artwork inside .data/generated, and set generated_visual_path plus generated_visual_alt only on those slides.",
          "Save the complete validated bundle back to .data/bundle.json. Do not upload it yourself.",
        ].join(" ")
  : [
      "Use $daily-content for an explicit targeted replacement run.",
      `Open .data/bundle.json and regenerate only the ${claim.scope} field for that existing post.`,
      "Keep both sessions' topic, rationale, research sources, project_mentions, and every other platform field exactly unchanged.",
      claim.scope === "instagram"
        ? "Follow the current instagram-visual-system.md prompt, create materially new attention-first topic-specific compositions and visuals, and assign a new unique render_revision. Use massive cover typography, compact spacing, large purpose-built components, and no dead zones. Use built-in $imagegen on only a few slides for simple text-free artwork composed around the exact text region; save those assets inside .data/generated and set generated_visual_path plus generated_visual_alt only on those slides. Preserve Twitter text and image_slide mappings."
        : "Preserve the existing Instagram carousel and its render_revision.",
      claim.scope === "twitter"
        ? "Write in the current highly informal style, never end a sentence with a period, and reuse only genuinely matching existing Instagram slides through image_slide; do not regenerate Instagram."
        : "Do not change the Twitter thread.",
      "Use the existing research sources for that platform's session; do not choose a new topic or redo unrelated content.",
      "Save the complete validated bundle back to .data/bundle.json.",
      "Do not upload it yourself; the trusted local runner will ingest it after you finish.",
      "Do not use any model API key, SDK, Claude, or Anthropic.",
    ].join(" ");

await reportProgress(claim.runId, {
  progress: 15,
  phase: claim.scope === "instagram" || claim.scope === "social" ? "Designing social content" : "Generating content",
  message:
    claim.scope === "instagram" || claim.scope === "social"
      ? "Codex is designing and generating each carousel visual"
      : `Codex is regenerating ${claim.scope === "all" ? "all platforms" : claim.scope}`,
  log:
    claim.scope === "instagram" || claim.scope === "social"
      ? "Started slide planning, artwork generation, and copy validation"
      : "Started Codex content generation and validation",
});
const codexStartedAt = Date.now();
const estimatedCodexMs =
  (claim.scope === "instagram" ? 17 : claim.scope === "social" ? 20 : claim.scope === "articles" ? 16 : claim.scope === "all" ? 30 : claim.scope === "twitter" ? 4 : 8) *
  60_000;
const codex = await runWithHeartbeat(
  process.env.CODEX_BIN || "codex",
  [
    "--search",
    "--ask-for-approval",
    "never",
    "--sandbox",
    "workspace-write",
    "--cd",
    repoRoot,
    "exec",
    "--ephemeral",
    prompt,
  ],
  { env: childEnv },
  async () => {
    const fraction = Math.min(1, (Date.now() - codexStartedAt) / estimatedCodexMs);
    const progress = 15 + Math.round(fraction * 55);
    await reportProgress(claim.runId, {
      progress,
      phase: claim.scope === "instagram" || claim.scope === "social" ? "Creating social content" : "Writing and checking",
      message:
        claim.scope === "instagram" || claim.scope === "social"
          ? "Creating text-free artwork, checking layouts, and preparing the carousel"
          : "Writing, validating, and checking the replacement content",
    });
  }
);

if (codex.code !== 0) {
  await complete(claim.runId, false, `Codex exited with code ${codex.code}`);
  process.exit(codex.code);
}

let bundleChanged = false;
try {
  bundleChanged = (await stat(bundlePath)).mtimeMs >= startedAt;
} catch {
  bundleChanged = false;
}
if (!bundleChanged) {
  await complete(claim.runId, false, "Codex did not create a fresh .data/bundle.json");
  process.exit(1);
}

await reportProgress(claim.runId, {
  progress: 74,
  phase: "Validating output",
  message: "Codex finished; validating the generated bundle",
  log: "Codex generation finished successfully",
});

if (claim.scope === "all" || claim.scope === "social" || claim.scope === "instagram") {
  await reportProgress(claim.runId, {
    progress: 80,
    phase: "Optimizing images",
    message: "Optimizing and uploading the generated carousel artwork",
    log: "Started image optimization and visual-layer upload",
  });
  const upload = await run(process.execPath, ["scripts/upload-instagram-visuals.mjs", ".data/bundle.json"], {
    env: childEnv,
  });
  if (upload.code !== 0) {
    await complete(claim.runId, false, `Instagram visual upload exited with code ${upload.code}`);
    process.exit(upload.code);
  }
  const hybridBundle = JSON.parse(await readFile(bundlePath, "utf8"));
  const visualSlides = hybridBundle.instagram?.slides ?? [];
  const generatedCount = visualSlides.filter(
    (slide) => slide.generated_visual_key || slide.generated_visual_url
  ).length;
  if (generatedCount < 1 || generatedCount >= visualSlides.length) {
    await complete(claim.runId, false, "Instagram needs generated artwork on some slides, but not every slide");
    process.exit(1);
  }
}

if (claim.scope !== "all") {
  const regenerated = JSON.parse(await readFile(bundlePath, "utf8"));
  const allowedKeys = new Set(
    claim.scope === "articles"
      ? ["topic", "topic_rationale", "research_sources", "devto", "tabnews"]
      : claim.scope === "social"
        ? ["social_topic", "social_topic_rationale", "social_research_sources", "twitter", "instagram"]
        : [claim.scope]
  );
  const protectedKeys = [
    "date",
    "topic",
    "topic_rationale",
    "research_sources",
    "social_topic",
    "social_topic_rationale",
    "social_research_sources",
    "project_mentions",
    "devto",
    "tabnews",
    "twitter",
    "instagram",
  ].filter((key) => !allowedKeys.has(key));
  const changedProtectedKey = protectedKeys.find(
    (key) => JSON.stringify(regenerated[key]) !== JSON.stringify(existingBundle[key])
  );
  if (changedProtectedKey) {
    await complete(
      claim.runId,
      false,
      `Targeted rerun changed protected field: ${changedProtectedKey}`
    );
    process.exit(1);
  }
}

await reportProgress(claim.runId, {
  progress: 92,
  phase: "Publishing draft",
  message: "Saving the replacement and verifying it in Content Central",
  log: "Bundle validation passed; started production ingest",
});
const ingest = await run(process.execPath, [
  ".agents/skills/daily-content/scripts/ingest.mjs",
  ".data/bundle.json",
]);
if (ingest.code !== 0) {
  await complete(claim.runId, false, `Ingest verification exited with code ${ingest.code}`);
  process.exit(ingest.code);
}

const completionMessage = claim.scope === "all"
  ? "New content generated and verified in production"
  : `${claim.scope} regenerated and verified in production`;
await complete(claim.runId, true, completionMessage);
console.log(`${completionMessage}.`);
