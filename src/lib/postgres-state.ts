import postgres from "postgres";

const STATE_TABLE = "content_central_state";
let client: ReturnType<typeof postgres> | null = null;
let ready: Promise<void> | null = null;

export function postgresUrl(): string | null {
  return (
    process.env.CONTENT_CENTRAL_POSTGRES_URL ??
    process.env.CONTENT_CENTRAL_DATABASE_URL ??
    null
  );
}

function getClient() {
  if (client) return client;
  const url = postgresUrl();
  if (!url) throw new Error("Content Central Postgres URL is not configured");
  client = postgres(url, {
    ssl: "require",
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
    prepare: false,
  });
  return client;
}

async function ensureTable(): Promise<void> {
  if (!ready) {
    const sql = getClient();
    ready = sql`
      create table if not exists ${sql(STATE_TABLE)} (
        key text primary key,
        value jsonb not null,
        updated_at timestamptz not null default now()
      )
    `.then(() => undefined);
  }
  return ready;
}

export async function readPostgresState<T>(key: string): Promise<T | null> {
  await ensureTable();
  const sql = getClient();
  const rows = await sql`select value from ${sql(STATE_TABLE)} where key = ${key}`;
  return rows.length > 0 ? (rows[0].value as T) : null;
}

export async function writePostgresState(key: string, value: unknown): Promise<void> {
  await ensureTable();
  const sql = getClient();
  const jsonValue = JSON.parse(JSON.stringify(value)) as postgres.JSONValue;
  await sql`
    insert into ${sql(STATE_TABLE)} (key, value, updated_at)
    values (${key}, ${sql.json(jsonValue)}, now())
    on conflict (key) do update
      set value = excluded.value, updated_at = excluded.updated_at
  `;
}
