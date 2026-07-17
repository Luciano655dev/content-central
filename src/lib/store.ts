import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import type { ContentBundle, Platform, PostRow, PostStatus, PostSummary } from "./types";
import { EMPTY_STATUS } from "./types";

export interface Store {
  listSummaries(): Promise<PostSummary[]>;
  getPost(date: string): Promise<PostRow | null>;
  upsertPost(bundle: ContentBundle): Promise<void>;
  listTopics(): Promise<{ date: string; topic: string }[]>;
  updateStatus(date: string, platform: Platform, posted: boolean): Promise<PostStatus | null>;
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
      .select("date, topic, status")
      .order("date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ ...r, status: { ...EMPTY_STATUS, ...r.status } }));
  }

  async getPost(date: string): Promise<PostRow | null> {
    const { data, error } = await this.client.from("posts").select("*").eq("date", date).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return { ...data, status: { ...EMPTY_STATUS, ...data.status } } as PostRow;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const { error } = await this.client
      .from("posts")
      .upsert({ ...bundle, status: EMPTY_STATUS }, { onConflict: "date" });
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

  async updateStatus(date: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const post = await this.getPost(date);
    if (!post) return null;
    const status = { ...post.status, [platform]: posted };
    const { error } = await this.client.from("posts").update({ status }).eq("date", date);
    if (error) throw new Error(error.message);
    return status;
  }
}

/* ---------------------------- Vercel Blob ----------------------------- */
/* Used when Supabase is not configured but BLOB_READ_WRITE_TOKEN is.      */
/* One JSON document; every write creates a fresh unique URL (no stale CDN */
/* reads) and deletes the previous version afterwards.                     */

const BLOB_PREFIX = "db/posts-";

class BlobStore implements Store {
  private async readAll(): Promise<PostRow[]> {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    if (blobs.length === 0) return [];
    const latest = [...blobs].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];
    const res = await fetch(latest.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Blob read failed: ${res.status}`);
    return (await res.json()) as PostRow[];
  }

  private async writeAll(rows: PostRow[]): Promise<void> {
    const { list, put, del } = await import("@vercel/blob");
    const { blobs: previous } = await list({ prefix: BLOB_PREFIX });
    await put(`${BLOB_PREFIX}${Date.now()}.json`, JSON.stringify(rows, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    if (previous.length > 0) {
      await del(previous.map((b) => b.url));
    }
  }

  async listSummaries(): Promise<PostSummary[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic, status }) => ({ date, topic, status: { ...EMPTY_STATUS, ...status } }));
  }

  async getPost(date: string): Promise<PostRow | null> {
    const rows = await this.readAll();
    const row = rows.find((r) => r.date === date);
    return row ? { ...row, status: { ...EMPTY_STATUS, ...row.status } } : null;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const rows = await this.readAll();
    const next = rows.filter((r) => r.date !== bundle.date);
    next.push({ ...bundle, status: EMPTY_STATUS, created_at: new Date().toISOString() });
    await this.writeAll(next);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic }) => ({ date, topic }));
  }

  async updateStatus(date: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const rows = await this.readAll();
    const row = rows.find((r) => r.date === date);
    if (!row) return null;
    row.status = { ...EMPTY_STATUS, ...row.status, [platform]: posted };
    await this.writeAll(rows);
    return row.status;
  }
}

/* ------------------------- Local file fallback ------------------------- */
/* Used when neither Supabase nor Blob is configured (local dev).          */

const DATA_FILE = path.join(process.cwd(), ".data", "posts.json");

class FileStore implements Store {
  private async readAll(): Promise<PostRow[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      return JSON.parse(raw) as PostRow[];
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
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic, status }) => ({ date, topic, status }));
  }

  async getPost(date: string): Promise<PostRow | null> {
    const rows = await this.readAll();
    return rows.find((r) => r.date === date) ?? null;
  }

  async upsertPost(bundle: ContentBundle): Promise<void> {
    const rows = await this.readAll();
    const next = rows.filter((r) => r.date !== bundle.date);
    next.push({ ...bundle, status: EMPTY_STATUS, created_at: new Date().toISOString() });
    await this.writeAll(next);
  }

  async listTopics(): Promise<{ date: string; topic: string }[]> {
    const rows = await this.readAll();
    return rows
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(({ date, topic }) => ({ date, topic }));
  }

  async updateStatus(date: string, platform: Platform, posted: boolean): Promise<PostStatus | null> {
    const rows = await this.readAll();
    const row = rows.find((r) => r.date === date);
    if (!row) return null;
    row.status = { ...EMPTY_STATUS, ...row.status, [platform]: posted };
    await this.writeAll(rows);
    return row.status;
  }
}

/* ------------------------------- Factory ------------------------------- */

let store: Store | null = null;

export type StorageMode = "supabase" | "blob" | "local";

export function storageMode(): StorageMode {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return "local";
}

export function getStore(): Store {
  if (store) return store;
  const mode = storageMode();
  store =
    mode === "supabase"
      ? new SupabaseStore(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      : mode === "blob"
        ? new BlobStore()
        : new FileStore();
  return store;
}
