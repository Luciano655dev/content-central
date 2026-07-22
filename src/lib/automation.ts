import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { storageMode } from "./store";
import { readPostgresState, writePostgresState } from "./postgres-state";
import type { ContentSession, Platform } from "./types";

export type RunTrigger = "manual" | "scheduled";
export type RunStatus = "idle" | "queued" | "running" | "succeeded" | "failed";
export type RunScope = "all" | ContentSession | Platform;

export type AutomationLogLevel = "info" | "success" | "error";

export type AutomationLog = {
  at: string;
  message: string;
  level: AutomationLogLevel;
};

export const RUN_SCOPES: RunScope[] = [
  "all",
  "articles",
  "social",
  "devto",
  "tabnews",
  "twitter",
  "instagram",
];

export type AutomationState = {
  enabled: boolean;
  time: string;
  timezone: string;
  status: RunStatus;
  runId?: string;
  trigger?: RunTrigger;
  scope: RunScope;
  postId?: string;
  queuedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  lastMessage?: string;
  phase?: string;
  progress: number;
  estimatedSeconds?: number;
  logs: AutomationLog[];
  lastScheduledDate?: string;
  updatedAt: string;
};

export type AutomationClaim = {
  runId: string;
  trigger: RunTrigger;
  scope: RunScope;
  postId?: string;
};

const DEFAULT_TIMEZONE = "America/Fortaleza";
const BLOB_PATH = "db/automation.json";
const DATA_FILE = path.join(process.cwd(), ".data", "automation.json");

function defaults(): AutomationState {
  return {
    enabled: true,
    time: "04:00",
    timezone: DEFAULT_TIMEZONE,
    status: "idle",
    scope: "all",
    progress: 0,
    logs: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalize(value: Partial<AutomationState> | null | undefined): AutomationState {
  const scope = isRunScope(value?.scope) ? value.scope : "all";
  const status = value?.status ?? "idle";
  const progress = Math.min(
    100,
    Math.max(0, typeof value?.progress === "number" ? value.progress : status === "succeeded" ? 100 : 0)
  );
  let logs = Array.isArray(value?.logs)
    ? value.logs
        .filter(
          (entry): entry is AutomationLog =>
            Boolean(entry) &&
            typeof entry.at === "string" &&
            typeof entry.message === "string" &&
            ["info", "success", "error"].includes(entry.level)
        )
        .slice(-20)
    : [];
  if (logs.length === 0 && value?.lastMessage) {
    logs = [
      {
        at: value.finishedAt ?? value.updatedAt ?? new Date().toISOString(),
        message: value.lastMessage,
        level: status === "failed" ? "error" : status === "succeeded" ? "success" : "info",
      },
    ];
  }
  const phase =
    value?.phase ??
    (status === "succeeded" ? "Complete" : status === "failed" ? "Failed" : undefined);
  return { ...defaults(), ...value, scope, progress, logs, ...(phase ? { phase } : {}) };
}

function logEntry(message: string, level: AutomationLogLevel = "info"): AutomationLog {
  return { at: new Date().toISOString(), message: message.slice(0, 300), level };
}

export function estimatedRunSeconds(scope: RunScope): number {
  if (scope === "social") return 22 * 60;
  if (scope === "articles") return 18 * 60;
  if (scope === "instagram") return 20 * 60;
  if (scope === "twitter") return 6 * 60;
  if (scope === "devto" || scope === "tabnews") return 10 * 60;
  return 30 * 60;
}

async function readState(): Promise<AutomationState> {
  const mode = storageMode();
  if (mode === "postgres") {
    return normalize(await readPostgresState<Partial<AutomationState>>("automation"));
  }
  if (mode === "supabase") {
    const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await client
      .from("automation_settings")
      .select("state")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return normalize(data?.state as Partial<AutomationState> | undefined);
  }

  if (mode === "blob") {
    try {
      const { get } = await import("@vercel/blob");
      const result = await get(BLOB_PATH, { access: "public", useCache: false });
      if (!result || result.statusCode !== 200) return defaults();
      return normalize(
        (await new Response(result.stream).json()) as Partial<AutomationState>
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          level: "error",
          message: "Automation settings unavailable; using safe defaults",
          error: error instanceof Error ? error.message : String(error),
        })
      );
      return defaults();
    }
  }

  try {
    return normalize(JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Partial<AutomationState>);
  } catch {
    return defaults();
  }
}

async function writeState(state: AutomationState): Promise<void> {
  const next = { ...state, updatedAt: new Date().toISOString() };
  const mode = storageMode();
  if (mode === "postgres") {
    await writePostgresState("automation", next);
    return;
  }
  if (mode === "supabase") {
    const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    const { error } = await client
      .from("automation_settings")
      .upsert({ id: 1, state: next }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return;
  }

  if (mode === "blob") {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, JSON.stringify(next, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return;
  }

  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf8");
}

export async function getAutomationState(): Promise<AutomationState> {
  return readState();
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function isRunScope(value: unknown): value is RunScope {
  return typeof value === "string" && RUN_SCOPES.includes(value as RunScope);
}

export async function updateAutomationSettings(input: {
  enabled: boolean;
  time: string;
  timezone: string;
}): Promise<AutomationState> {
  const state = await readState();
  const next = { ...state, ...input };
  await writeState(next);
  return next;
}

export async function queueManualRun(input: {
  scope?: RunScope;
  postId?: string;
} = {}): Promise<AutomationState | null> {
  const state = await readState();
  if (state.status === "queued" || state.status === "running") return null;
  const now = new Date().toISOString();
  const scope = input.scope ?? "all";
  const next: AutomationState = {
    ...state,
    status: "queued",
    runId: undefined,
    trigger: "manual",
    scope,
    postId: scope === "all" ? undefined : input.postId,
    queuedAt: now,
    startedAt: undefined,
    finishedAt: undefined,
    phase: "Queued",
    progress: 3,
    estimatedSeconds: estimatedRunSeconds(scope),
    logs: [
      logEntry(
        scope === "all"
          ? "New content run requested from the dashboard"
          : `${scope} rerun requested from the dashboard`
      ),
    ],
    lastMessage:
      scope === "all"
        ? "Waiting for the local Codex runner"
        : `Waiting for Codex to regenerate ${scope}`,
  };
  await writeState(next);
  return next;
}

export function dateAndTimeInTimezone(
  date: Date,
  timezone: string
): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export async function claimAutomationRun(options: {
  now?: Date;
  hasPostToday: (date: string) => Promise<boolean>;
}): Promise<AutomationClaim | null> {
  const now = options.now ?? new Date();
  let state = await readState();

  if (
    state.status === "running" &&
    state.startedAt &&
    now.getTime() - new Date(state.startedAt).getTime() > 6 * 60 * 60 * 1000
  ) {
    state = {
      ...state,
      status: "failed",
      finishedAt: now.toISOString(),
      phase: "Stopped",
      logs: [...state.logs, logEntry("The previous runner stopped responding", "error")].slice(-20),
      lastMessage: "The previous runner stopped responding",
    };
    await writeState(state);
  }

  let trigger: RunTrigger | null = state.status === "queued" ? "manual" : null;
  const local = dateAndTimeInTimezone(now, state.timezone);
  const scheduledDue =
    state.enabled && local.time >= state.time && state.lastScheduledDate !== local.date;

  if (!trigger && scheduledDue && (await options.hasPostToday(local.date))) {
    await writeState({
      ...state,
      lastScheduledDate: local.date,
      lastMessage: "Scheduled run skipped because today's post already exists",
    });
    return null;
  }
  if (!trigger && scheduledDue) trigger = "scheduled";
  if (!trigger || state.status === "running") return null;

  const runId = randomUUID();
  const scope: RunScope = trigger === "scheduled" ? "all" : state.scope;
  const postId = scope === "all" ? undefined : state.postId;
  if (scope !== "all" && !postId) return null;
  const next: AutomationState = {
    ...state,
    status: "running",
    runId,
    trigger,
    scope,
    postId,
    startedAt: now.toISOString(),
    finishedAt: undefined,
    phase: "Preparing",
    progress: 8,
    estimatedSeconds: state.estimatedSeconds ?? estimatedRunSeconds(scope),
    logs: [
      ...state.logs,
      logEntry(
        scope === "all"
          ? "Local Codex runner picked up the request"
          : `Local Codex runner started the ${scope} replacement`
      ),
    ].slice(-20),
    lastMessage:
      scope === "all"
        ? "Codex is researching and writing"
        : `Codex is regenerating ${scope}`,
    ...(trigger === "scheduled" ? { lastScheduledDate: local.date } : {}),
  };
  await writeState(next);
  return { runId, trigger, scope, postId };
}

export async function updateAutomationProgress(input: {
  runId: string;
  progress: number;
  phase?: string;
  message?: string;
  log?: string;
}): Promise<AutomationState | null> {
  const state = await readState();
  if (state.runId !== input.runId || state.status !== "running") return null;
  const progress = Math.min(99, Math.max(state.progress, Math.round(input.progress)));
  const next: AutomationState = {
    ...state,
    progress,
    ...(input.phase ? { phase: input.phase.slice(0, 80) } : {}),
    ...(input.message ? { lastMessage: input.message.slice(0, 500) } : {}),
    ...(input.log
      ? { logs: [...state.logs, logEntry(input.log)].slice(-20) }
      : {}),
  };
  await writeState(next);
  return next;
}

export async function completeAutomationRun(input: {
  runId: string;
  ok: boolean;
  message: string;
}): Promise<AutomationState | null> {
  const state = await readState();
  if (state.runId !== input.runId || state.status !== "running") return null;
  const next: AutomationState = {
    ...state,
    status: input.ok ? "succeeded" : "failed",
    finishedAt: new Date().toISOString(),
    phase: input.ok ? "Complete" : "Failed",
    progress: input.ok ? 100 : state.progress,
    logs: [
      ...state.logs,
      logEntry(input.message, input.ok ? "success" : "error"),
    ].slice(-20),
    lastMessage: input.message.slice(0, 500),
  };
  await writeState(next);
  return next;
}
