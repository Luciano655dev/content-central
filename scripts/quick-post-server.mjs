#!/usr/bin/env node

import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.CONTENT_CENTRAL_QUICK_POST_PORT || 47833);
const profileDir = path.join(repoRoot, ".data", "quick-post-playwright");
const assetRoot = path.join(repoRoot, ".data", "quick-post-assets");
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const allowedOrigins = new Set([
  "https://content-central-alpha.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3012",
  "http://127.0.0.1:3012",
]);

let browserQueue = Promise.resolve();
let contextPromise = null;

function corsHeaders(origin) {
  const allowed = origin && allowedOrigins.has(origin) ? origin : "";
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Private-Network": "true",
    Vary: "Origin",
  };
}

function send(response, status, body, origin) {
  response.writeHead(status, { "Content-Type": "application/json", ...corsHeaders(origin) });
  response.end(JSON.stringify(body));
}

function sendHtml(response, status, message, close, origin) {
  const escaped = String(message)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  response.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    ...corsHeaders(origin),
  });
  response.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Content Central · Quick post</title></head>
<body style="margin:0;background:#0A0A0A;color:#F3F3F0;font:16px/1.5 Inter,system-ui,sans-serif">
  <main style="padding:32px;max-width:560px">
    <p style="color:#C7F246;font:12px ui-monospace,monospace;letter-spacing:.12em">CONTENT CENTRAL</p>
    <h1 style="font-size:24px">${status < 400 ? "Composer ready" : "One step needed"}</h1>
    <p style="color:#9A9A95">${escaped}</p>
  </main>
  ${close ? "<script>setTimeout(() => window.close(), 1200)</script>" : ""}
</body></html>`);
}

async function getContext() {
  if (!contextPromise) {
    const launched = chromium.launchPersistentContext(profileDir, {
      headless: false,
      ...(existsSync(chromePath) ? { executablePath: chromePath } : {}),
      viewport: null,
      args: ["--start-maximized"],
    });
    contextPromise = launched;
    launched.then((context) => {
      context.on("close", () => {
        if (contextPromise === launched) contextPromise = null;
      });
    });
    launched.catch(() => {
      if (contextPromise === launched) contextPromise = null;
    });
  }
  return contextPromise;
}

async function getPlatformPage(hostname, url) {
  const context = await getContext();
  let page = context.pages().find((candidate) => {
    try {
      return new URL(candidate.url()).hostname === hostname;
    } catch {
      return false;
    }
  });
  if (!page) page = await context.newPage();
  await page.bringToFront();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  } catch (error) {
    const stillOnPlatform = (() => {
      try {
        return new URL(page.url()).hostname === hostname;
      } catch {
        return false;
      }
    })();
    if (!stillOnPlatform) throw error;
  }
  await page.waitForTimeout(900);
  return page;
}

async function firstVisible(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) return locator;
  }
  return null;
}

function loginError(platform) {
  return new Error(
    `${platform} is not showing its composer yet. Sign in in the browser window that opened, then click Quick post again.`
  );
}

async function prepareDevto(post) {
  const page = await getPlatformPage("dev.to", "https://dev.to/new");
  const title = await firstVisible(page, [
    "input#article-form-title",
    "textarea#article-form-title",
    "textarea[placeholder*='title' i]",
    "input[placeholder*='title' i]",
  ]);
  const body = await firstVisible(page, [
    "textarea#article_body_markdown",
    "textarea[name='article[body_markdown]']",
    "textarea[placeholder*='post content' i]",
    "textarea[placeholder*='markdown' i]",
  ]);
  if (!title && !body) throw loginError("Dev.to");
  if (!body) throw new Error("Dev.to opened, but its Markdown editor could not be located.");
  if (title) await title.fill(post.devto.title);
  await body.fill(post.devto.body_markdown);

  const tags = await firstVisible(page, ["input[name*='tag' i]", "input[placeholder*='tag' i]"]);
  if (tags) await tags.fill(post.devto.tags.join(", "));
  return "Dev.to draft filled. Review the title, tags, and article, then click Publish.";
}

async function prepareTabNews(post) {
  const page = await getPlatformPage("www.tabnews.com.br", "https://www.tabnews.com.br/publicar");
  const title = await firstVisible(page, [
    "input[name='title']",
    "textarea[name='title']",
    "input[placeholder*='título' i]",
  ]);
  const body = await firstVisible(page, [
    "textarea[name='body']",
    "textarea[name='content']",
    "textarea[placeholder*='conteúdo' i]",
    "textarea[placeholder*='markdown' i]",
  ]);
  if (!title && !body) throw loginError("TabNews");
  if (!title || !body) throw new Error("TabNews opened, but one of its editor fields could not be located.");
  await title.fill(post.tabnews.title);
  await body.fill(post.tabnews.body_markdown);
  return "TabNews draft filled. Review it, then click Publicar.";
}

async function prepareTwitter(post, assetPaths) {
  const page = await getPlatformPage("x.com", "https://x.com/compose/post");
  const bySlide = new Map(assetPaths.map((asset) => [asset.slide, asset.path]));

  for (let index = 0; index < post.twitter.tweets.length; index += 1) {
    if (index > 0) {
      const add = await firstVisible(page, [
        "[data-testid='addButton']",
        "button[aria-label*='Add post' i]",
        "button[aria-label*='Adicionar post' i]",
      ]);
      if (!add) throw new Error(`X could not add tweet ${index + 1} to the thread.`);
      await add.click();
      await page.waitForTimeout(450);
    }

    const editors = page.locator("[data-testid='tweetTextarea_0'], div[contenteditable='true']");
    const count = await editors.count();
    if (!count) throw loginError("X");
    await editors.nth(count - 1).fill(post.twitter.tweets[index].text);

    const slide = post.twitter.tweets[index].image_slide;
    const imagePath = slide ? bySlide.get(slide) : undefined;
    if (imagePath) {
      const inputs = page.locator("input[type='file']");
      const inputCount = await inputs.count();
      if (!inputCount) throw new Error(`X could not locate the image input for tweet ${index + 1}.`);
      await inputs.nth(inputCount - 1).setInputFiles(imagePath);
      await page.waitForTimeout(700);
    }
  }
  return "The complete X thread is filled with matching carousel images. Review it, then click Post all.";
}

async function clickInstagramCreate(page) {
  const create = await firstVisible(page, [
    "a[href*='/create/']",
    "[aria-label='New post']",
    "[aria-label='Create']",
    "[aria-label='Criar']",
  ]);
  if (!create) return false;
  await create.click();
  await page.waitForTimeout(900);
  return true;
}

async function instagramNext(page) {
  const next = page
    .getByRole("button", { name: /^(Next|Avançar)$/i })
    .or(page.getByText(/^(Next|Avançar)$/i))
    .last();
  if (!(await next.count()) || !(await next.isVisible().catch(() => false))) return false;
  await next.click();
  await page.waitForTimeout(900);
  return true;
}

async function prepareInstagram(post, assetPaths) {
  if (!assetPaths.length) throw new Error("Instagram needs at least one rendered carousel image.");
  const page = await getPlatformPage("www.instagram.com", "https://www.instagram.com/");
  let inputs = page.locator("input[type='file']");
  if (!(await inputs.count())) {
    if (!(await clickInstagramCreate(page))) throw loginError("Instagram");
    inputs = page.locator("input[type='file']");
  }
  const inputCount = await inputs.count();
  if (!inputCount) throw new Error("Instagram opened, but its image picker could not be located.");
  await inputs.nth(inputCount - 1).setInputFiles(assetPaths.map((asset) => asset.path));
  await page.waitForTimeout(1300);

  if (!(await instagramNext(page)) || !(await instagramNext(page))) {
    throw new Error("Instagram could not advance to the caption screen.");
  }
  const caption = await firstVisible(page, [
    "textarea[aria-label*='caption' i]",
    "textarea[aria-label*='legenda' i]",
    "div[contenteditable='true'][aria-label*='caption' i]",
    "div[contenteditable='true'][aria-label*='legenda' i]",
  ]);
  if (!caption) throw new Error("Instagram reached the final screen, but its caption field could not be located.");
  await caption.fill(post.instagram.caption);
  return "Instagram carousel and caption are filled in order. Review them, then click Share.";
}

async function saveAssets(post, assets) {
  const safeId = String(post.id || post.date || "draft").replace(/[^a-zA-Z0-9_-]/g, "-");
  const directory = path.join(assetRoot, safeId);
  await mkdir(directory, { recursive: true });
  const saved = [];
  for (const asset of assets || []) {
    const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(asset.dataUrl || "");
    if (!match || !Number.isInteger(asset.slide) || asset.slide < 1) continue;
    const name = String(asset.name || `slide-${asset.slide}.png`).replace(/[^a-zA-Z0-9_.-]/g, "-");
    const filePath = path.join(directory, name);
    await writeFile(filePath, Buffer.from(match[1], "base64"));
    saved.push({ slide: asset.slide, path: filePath });
  }
  return saved.sort((a, b) => a.slide - b.slide);
}

async function prepare(payload) {
  const { platform, post } = payload || {};
  if (!post || !["devto", "tabnews", "twitter", "instagram"].includes(platform)) {
    throw new Error("Invalid quick-post request.");
  }
  const assets = await saveAssets(post, payload.assets);
  if (platform === "devto") return prepareDevto(post);
  if (platform === "tabnews") return prepareTabNews(post);
  if (platform === "twitter") return prepareTwitter(post, assets);
  return prepareInstagram(post, assets);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_000_000) request.destroy(new Error("Request too large"));
    });
    request.on("end", () => {
      resolve(body);
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin || "";
  if (origin && !allowedOrigins.has(origin)) {
    send(response, 403, { ok: false, message: "Origin not allowed" }, origin);
    return;
  }
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders(origin));
    response.end();
    return;
  }
  if (request.method === "GET" && request.url === "/health") {
    send(response, 200, { ok: true }, origin);
    return;
  }
  if (request.method !== "POST" || request.url !== "/prepare") {
    if (request.method !== "POST" || request.url !== "/prepare-form") {
      send(response, 404, { ok: false, message: "Not found" }, origin);
      return;
    }
  }

  try {
    const rawBody = await readBody(request);
    const payload =
      request.url === "/prepare-form"
        ? JSON.parse(new URLSearchParams(rawBody).get("payload") || "")
        : JSON.parse(rawBody);
    const task = browserQueue.then(() => prepare(payload));
    browserQueue = task.catch(() => undefined);
    const message = await task;
    if (request.url === "/prepare-form") sendHtml(response, 200, message, true, origin);
    else send(response, 200, { ok: true, message }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quick post failed";
    if (request.url === "/prepare-form") sendHtml(response, 500, message, false, origin);
    else send(response, 500, { ok: false, message }, origin);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Content Central quick-post companion listening on http://127.0.0.1:${port}`);
});

async function shutdown() {
  const context = await contextPromise?.catch(() => null);
  await context?.close().catch(() => undefined);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
