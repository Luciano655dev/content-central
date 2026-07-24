#!/usr/bin/env node

import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import sharp from "sharp";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = process.argv[2] ?? ".data/bundle.json";
const bundlePath = path.resolve(repoRoot, input);

const databaseUrl = process.env.CONTENT_CENTRAL_POSTGRES_URL ?? process.env.CONTENT_CENTRAL_DATABASE_URL;
if (!databaseUrl) throw new Error("CONTENT_CENTRAL_POSTGRES_URL is required to store generated Instagram visuals");

const bundle = JSON.parse(await readFile(bundlePath, "utf8"));
const revision = bundle.instagram?.render_revision;
const slides = bundle.instagram?.slides;
if (!bundle.date || !revision || !Array.isArray(slides)) {
  throw new Error("Bundle needs date, instagram.render_revision, and instagram.slides");
}

let uploaded = 0;
const sql = postgres(databaseUrl, { ssl: "require", max: 1, prepare: false });
try {
  for (const [index, slide] of slides.entries()) {
    if (!slide.generated_visual_path) continue;
    const assetPath = path.resolve(repoRoot, slide.generated_visual_path);
    const generatedRoot = path.resolve(repoRoot, ".data", "generated");
    if (assetPath !== generatedRoot && !assetPath.startsWith(`${generatedRoot}${path.sep}`)) {
      throw new Error(`Slide ${index + 1} generated_visual_path must be inside .data/generated`);
    }
    const info = await stat(assetPath);
    if (!info.isFile() || info.size === 0) throw new Error(`Slide ${index + 1} visual is missing or empty`);

    const extension = path.extname(assetPath).toLowerCase();
    if (![".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
      throw new Error(`Slide ${index + 1} visual must be PNG, JPEG, or WebP`);
    }
    const bytes = await readFile(assetPath);
    const optimized = await sharp(bytes)
      .resize(1080, 1350, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 9, palette: true, quality: 90, colours: 256 })
      .toBuffer();
    const key = `instagram-visual:${bundle.date}:${revision}:${String(index + 1).padStart(2, "0")}`;
    const value = { contentType: "image/png", data: optimized.toString("base64") };
    await sql`
      insert into content_central_state (key, value, updated_at)
      values (${key}, ${sql.json(value)}, now())
      on conflict (key) do update
        set value = excluded.value, updated_at = excluded.updated_at
    `;
    slide.generated_visual_key = key;
    slide.generated_visual_alt ||= slide.visual_tip || `${slide.title} visual layer`;
    delete slide.generated_visual_path;
    delete slide.generated_visual_url;
    uploaded += 1;
  }
} finally {
  await sql.end();
}

await writeFile(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ ok: true, uploaded, bundle: path.relative(repoRoot, bundlePath) }));
