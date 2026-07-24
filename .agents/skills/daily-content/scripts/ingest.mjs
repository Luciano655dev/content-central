import fs from "node:fs/promises";

const DEFAULT_INGEST_URL = "https://content-central-alpha.vercel.app";
const ingestUrl = (process.env.INGEST_URL || DEFAULT_INGEST_URL).replace(/\/$/, "");
const token = process.env.INGEST_TOKEN;

if (!token) {
  console.error("Missing INGEST_TOKEN. Pull the ignored .vercel/.env.production.local file first.");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}` };

async function request(path, init = {}) {
  return fetch(`${ingestUrl}${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
    signal: AbortSignal.timeout(30_000),
  });
}

async function getTopics() {
  const response = await request("/api/topics");
  const text = await response.text();
  if (!response.ok) throw new Error(`Topic check failed (${response.status}): ${text}`);
  const data = JSON.parse(text);
  if (!Array.isArray(data.topics)) throw new Error("Topic check returned an invalid response.");
  return data.topics;
}

async function upload(bundle) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await request("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bundle),
      });
      const text = await response.text();
      if (response.ok) return;
      if (response.status < 500) throw new Error(`Ingest rejected (${response.status}): ${text}`);
      lastError = new Error(`Ingest failed (${response.status}): ${text}`);
    } catch (error) {
      lastError = error;
      if (String(error).includes("Ingest rejected")) throw error;
    }

    if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
  }
  throw lastError;
}

async function main() {
  const argument = process.argv[2];
  const topics = await getTopics();

  if (argument === "--check") {
    console.log(JSON.stringify({ ok: true, production: ingestUrl, topics }, null, 2));
    return;
  }

  if (!argument) throw new Error("Usage: ingest.mjs --check | <bundle.json>");
  const bundle = JSON.parse(await fs.readFile(argument, "utf8"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bundle.date || "")) {
    throw new Error("Bundle date must be YYYY-MM-DD.");
  }

  await upload(bundle);
  const updatedTopics = await getTopics();
  const verified = updatedTopics.some((topic) => topic.date === bundle.date);
  if (!verified) throw new Error(`Upload returned success, but production is missing ${bundle.date}.`);
  console.log(JSON.stringify({ ok: true, verified: bundle.date, production: ingestUrl }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
