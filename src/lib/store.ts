import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { ContentBundle, Platform, PostRow, PostStatus, PostSummary } from "./types";
import { EMPTY_STATUS } from "./types";
import { postgresUrl, readPostgresState, writePostgresState } from "./postgres-state";

export interface Store {
  listSummaries(): Promise<PostSummary[]>;
  getPost(id: string): Promise<PostRow | null>;
  upsertPost(bundle: ContentBundle): Promise<void>;
  listTopics(): Promise<{ date: string; topic: string }[]>;
  updateStatus(id: string, platform: Platform, posted: boolean): Promise<PostStatus | null>;
  deletePost(id: string): Promise<boolean>;
}

function localPostId(bundle: Pick<ContentBundle, "date" | "topic">): string {
  const hash = createHash("sha256").update(bundle.topic.trim().toLowerCase()).digest("hex").slice(0, 10);
  return `${bundle.date}-${hash}`;
}

function normalizeRow(row: PostRow): PostRow {
  return {
    ...row,
    id: row.id || localPostId(row),
    status: { ...EMPTY_STATUS, ...row.status },
  };
}

function newestFirst(a: PostRow, b: PostRow): number {
  const byDate = b.date.localeCompare(a.date);
  if (byDate !== 0) return byDate;
  return (b.created_at ?? "").localeCompare(a.created_at ?? "");
}

/* ------------------------------ Supabase ------------------------------ */

class SupabaseStore implements Store {
  private client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  async listSummaries(): Promise<PostSummary[]> {
    const { data, error } = await this.client
      .from("posts")
      .select("id, date, topic, status, created_at")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ ...r, status: { ...EMPTY_STATUS, ...r.status } }));
  }

  async getPost(id: string): Promise<PostRow | null> {
    const { data, error } = await this.client.from("posts").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return normalizeRow(data as PostRow);
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const { data: existing, error: readError } = await this.client
      .from("posts")
      .select("id")
      .eq("date", bundle.date)
      .eq("topic", bundle.topic)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    const operation = existing
      ? this.client.from("posts").update(bundle).eq("id", existing.id)
      : this.client.from("posts").insert({ ...bundle, status: EMPTY_STATUS });
    const { error } = await operation;
    if (error) throw new Error(error.message);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const { data, error } = await this.client
      .from("posts")
      .select("date, topic")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async updateStatus(id: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const post = await this.getPost(id);
    if (!post) return null;
    const status = { ...post.status, [platform]: posted };
    const { error } = await this.client.from("posts").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return status;
  }

  async deletePost(id: string): Promise<boolean> {
    const { data, error } = await this.client.from("posts").delete().eq("id", id).select("id");
    if (error) throw new Error(error.message);
    return (data?.length ?? 0) > 0;
  }
}

/* ---------------------------- Vercel Blob ----------------------------- */
/* Used when Supabase is not configured but BLOB_READ_WRITE_TOKEN is.      */
/* One JSON document; every write creates a fresh unique URL (no stale CDN */
/* reads) and deletes the previous version afterwards.                     */

const BLOB_PATH = "db/posts.json";

class BlobStore implements Store {
  private async readAll(): Promise<PostRow[]> {
    const { get } = await import("@vercel/blob");
    const result = await get(BLOB_PATH, { access: "public", useCache: false });
    if (!result) return [];
    if (!result || result.statusCode !== 200) throw new Error("Blob read failed");
    return ((await new Response(result.stream).json()) as PostRow[]).map(normalizeRow);
  }

  private async writeAll(rows: PostRow[]): Promise<void> {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(rows, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  }

  async listSummaries(): Promise<PostSummary[]> {
    const rows = await this.readAll();
    return rows
      .sort(newestFirst)
      .map(({ id, date, topic, status, created_at }) => ({ id, date, topic, status, created_at }));
  }

  async getPost(id: string): Promise<PostRow | null> {
    const rows = await this.readAll();
    return rows.find((r) => r.id === id) ?? null;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const rows = await this.readAll();
    const id = localPostId(bundle);
    const existing = rows.find((r) => r.id === id);
    const next = rows.filter((r) => r.id !== id);
    next.push({
      ...bundle,
      id,
      status: existing?.status ?? EMPTY_STATUS,
      created_at: existing?.created_at ?? new Date().toISOString(),
    });
    await this.writeAll(next);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic }) => ({ date, topic }));
  }

  async updateStatus(id: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const rows = await this.readAll();
    const row = rows.find((r) => r.id === id);
    if (!row) return null;
    row.status = { ...EMPTY_STATUS, ...row.status, [platform]: posted };
    await this.writeAll(rows);
    return row.status;
  }

  async deletePost(id: string): Promise<boolean> {
    const rows = await this.readAll();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await this.writeAll(next);
    return true;
  }
}

/* ------------------------- Marketplace Postgres ------------------------ */
/* Free durable state store used when CONTENT_CENTRAL_POSTGRES_URL exists. */

class PostgresStore implements Store {
  private async readAll(): Promise<PostRow[]> {
    return ((await readPostgresState<PostRow[]>("posts")) ?? []).map(normalizeRow);
  }

  private async writeAll(rows: PostRow[]): Promise<void> {
    await writePostgresState("posts", rows);
  }

  async listSummaries(): Promise<PostSummary[]> {
    const rows = await this.readAll();
    return rows
      .sort(newestFirst)
      .map(({ id, date, topic, status, created_at }) => ({ id, date, topic, status, created_at }));
  }

  async getPost(id: string): Promise<PostRow | null> {
    const rows = await this.readAll();
    return rows.find((row) => row.id === id) ?? null;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const rows = await this.readAll();
    const id = localPostId(bundle);
    const existing = rows.find((row) => row.id === id);
    const next = rows.filter((row) => row.id !== id);
    next.push({
      ...bundle,
      id,
      status: existing?.status ?? EMPTY_STATUS,
      created_at: existing?.created_at ?? new Date().toISOString(),
    });
    await this.writeAll(next);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic }) => ({ date, topic }));
  }

  async updateStatus(id: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const rows = await this.readAll();
    const row = rows.find((item) => item.id === id);
    if (!row) return null;
    row.status = { ...EMPTY_STATUS, ...row.status, [platform]: posted };
    await this.writeAll(rows);
    return row.status;
  }

  async deletePost(id: string): Promise<boolean> {
    const rows = await this.readAll();
    const next = rows.filter((row) => row.id !== id);
    if (next.length === rows.length) return false;
    await this.writeAll(next);
    return true;
  }
}

/* ------------------------- Local file fallback ------------------------- */
/* Used when neither Supabase nor Blob is configured (local dev).          */

const DATA_FILE = path.join(process.cwd(), ".data", "posts.json");

class FileStore implements Store {
  private async readAll(): Promise<PostRow[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      return (JSON.parse(raw) as PostRow[]).map(normalizeRow);
    } catch {
      return [];
    }
  }

  private async writeAll(rows: PostRow[]): Promise<void> {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
  }

  async listSummaries(): Promise<PostSummary[]> {
    const rows = await this.readAll();
    return rows
      .sort(newestFirst)
      .map(({ id, date, topic, status, created_at }) => ({ id, date, topic, status, created_at }));
  }

  async getPost(id: string): Promise<PostRow | null> {
    const rows = await this.readAll();
    return rows.find((r) => r.id === id) ?? null;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const rows = await this.readAll();
    const id = localPostId(bundle);
    const existing = rows.find((r) => r.id === id);
    const next = rows.filter((r) => r.id !== id);
    next.push({
      ...bundle,
      id,
      status: existing?.status ?? EMPTY_STATUS,
      created_at: existing?.created_at ?? new Date().toISOString(),
    });
    await this.writeAll(next);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic }) => ({ date, topic }));
  }

  async updateStatus(id: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const rows = await this.readAll();
    const row = rows.find((r) => r.id === id);
    if (!row) return null;
    row.status = { ...EMPTY_STATUS, ...row.status, [platform]: posted };
    await this.writeAll(rows);
    return row.status;
  }

  async deletePost(id: string): Promise<boolean> {
    const rows = await this.readAll();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await this.writeAll(next);
    return true;
  }
}

/* ------------------------------- Factory ------------------------------- */

let store: Store | null = null;

export type StorageMode = "supabase" | "postgres" | "blob" | "local";

export function storageMode(): StorageMode {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (postgresUrl()) return "postgres";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export function getStore(): Store {
  if (store) return store;
  const mode = storageMode();
  store =
    mode === "supabase"
      ? new SupabaseStore(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : mode === "postgres"
        ? new PostgresStore()
      : mode === "blob"
        ? new BlobStore()
        : new FileStore();
  return store;
}
