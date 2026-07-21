#!/usr/bin/env node

import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
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

if (process.argv.includes("--self-test")) {
  const state = await api(null, "GET");
  const auth = await run(process.env.CODEX_BIN || "codex", ["login", "status"]);
  console.log(`Control API ready; schedule=${state.enabled ? state.time : "disabled"} ${state.timezone}`);
  process.exit(auth.code);
}

let claim;
try {
  ({ claim } = await api({ action: "claim" }));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (!claim) process.exit(0);

console.log(`Starting ${claim.trigger} Codex content run ${claim.runId}`);
const startedAt = Date.now();
const childEnv = { ...process.env };
delete childEnv.OPENAI_API_KEY;
delete childEnv.ANTHROPIC_API_KEY;

const prompt = [
  "Use $daily-content to research and write one new Content Central bundle.",
  `This is a ${claim.trigger} automation-runner request.`,
  claim.trigger === "manual"
    ? "Create a new, distinct topic even if another post already exists today."
    : "Create today's scheduled post.",
  "Save the validated result to .data/bundle.json.",
  "Do not upload it yourself; the trusted local runner will ingest it after you finish.",
  "Do not use any model API key, SDK, Claude, or Anthropic.",
].join(" ");

const codex = await run(
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
  { env: childEnv }
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

const ingest = await run(process.execPath, [
  ".agents/skills/daily-content/scripts/ingest.mjs",
  ".data/bundle.json",
]);
if (ingest.code !== 0) {
  await complete(claim.runId, false, `Ingest verification exited with code ${ingest.code}`);
  process.exit(ingest.code);
}

await complete(claim.runId, true, "New content generated and verified in production");
console.log("Content run completed and verified.");
