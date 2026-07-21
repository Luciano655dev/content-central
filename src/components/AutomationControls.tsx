"use client";

import { useEffect, useState } from "react";
import { Clock3, LoaderCircle, Play } from "lucide-react";
import type { AutomationState } from "@/lib/automation";

function statusText(state: AutomationState): string {
  if (state.status === "queued") return "Queued — the local Codex runner will pick it up within five minutes";
  if (state.status === "running") return "Codex is researching and writing now";
  if (state.status === "failed") return `Last run failed${state.lastMessage ? `: ${state.lastMessage}` : ""}`;
  if (state.status === "succeeded") return "Last run finished successfully";
  return state.lastMessage ?? "Ready";
}

export default function AutomationControls({ initialState }: { initialState: AutomationState }) {
  const [state, setState] = useState(initialState);
  const [time, setTime] = useState(initialState.time);
  const [enabled, setEnabled] = useState(initialState.enabled);
  const [busy, setBusy] = useState<"run" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state.status !== "queued" && state.status !== "running") return;
    const timer = window.setInterval(async () => {
      const response = await fetch("/api/automation", { cache: "no-store" });
      if (response.ok) setState((await response.json()) as AutomationState);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [state.status]);

  async function runNow() {
    setBusy("run");
    setError(null);
    try {
      const response = await fetch("/api/automation", { method: "POST" });
      const body = (await response.json()) as AutomationState & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not queue the run");
      setState(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not queue the run");
    } finally {
      setBusy(null);
    }
  }

  async function saveSchedule() {
    setBusy("save");
    setError(null);
    try {
      const response = await fetch("/api/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, time, timezone: state.timezone }),
      });
      const body = (await response.json()) as AutomationState & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not save the schedule");
      setState(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the schedule");
    } finally {
      setBusy(null);
    }
  }

  const active = state.status === "queued" || state.status === "running";

  return (
    <section className="mb-12 rounded-xl border border-border bg-surface px-5 py-5">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Codex automation</p>
          <p className="mt-2 text-sm text-foreground">{statusText(state)}</p>
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={busy !== null || active}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "run" || active ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run new one
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Run every day
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          <Clock3 className="h-4 w-4" />
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            disabled={!enabled}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
          />
          <span className="text-xs">Fortaleza time</span>
        </label>
        <button
          type="button"
          onClick={saveSchedule}
          disabled={busy !== null || (time === state.time && enabled === state.enabled)}
          className="text-left text-sm text-accent underline-offset-4 hover:underline disabled:text-muted disabled:no-underline"
        >
          {busy === "save" ? "Saving…" : "Save schedule"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-warning">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Uses the Codex CLI signed in with ChatGPT on this Mac. No pay-as-you-go model API.
      </p>
    </section>
  );
}
