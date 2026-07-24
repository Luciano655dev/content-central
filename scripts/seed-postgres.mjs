#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const url =
  process.env.CONTENT_CENTRAL_POSTGRES_URL ?? process.env.CONTENT_CENTRAL_DATABASE_URL;
if (!url) {
  console.error("CONTENT_CENTRAL_POSTGRES_URL is not configured");
  process.exit(1);
}

const bundlePath = process.argv[2] ?? ".data/bundle.json";
const bundle = JSON.parse(await readFile(bundlePath, "utf8"));
const id = `${bundle.date}-${createHash("sha256")
  .update(bundle.topic.trim().toLowerCase())
  .digest("hex")
  .slice(0, 10)}`;

const post = {
  ...bundle,
  id,
  status: { devto: false, tabnews: false, twitter: false, instagram: false },
  created_at: new Date().toISOString(),
};
const automation = {
  enabled: true,
  time: "04:00",
  timezone: "America/Fortaleza",
  status: "idle",
  updatedAt: new Date().toISOString(),
  lastMessage: "Storage restored on free Postgres",
};

const sql = postgres(url, { ssl: "require", max: 1, prepare: false });
try {
  await sql`
    create table if not exists content_central_state (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
  await sql`
    insert into content_central_state (key, value)
    values ('posts', ${sql.json([post])})
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
  await sql`
    insert into content_central_state (key, value)
    values ('automation', ${sql.json(automation)})
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
  const [result] = await sql`
    select jsonb_array_length(value) as count
    from content_central_state
    where key = 'posts'
  `;
  console.log(JSON.stringify({ seeded: id, rows: result.count, schedule: automation.time }));
} finally {
  await sql.end();
}
