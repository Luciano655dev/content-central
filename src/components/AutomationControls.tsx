"use client";

import { useEffect, useState } from "react";
import { Clock3, LoaderCircle, Play } from "lucide-react";
import type { AutomationState } from "@/lib/automation";
import { publishAutomationState } from "@/lib/automation-client";

export default function AutomationControls({ initialState }: { initialState: AutomationState }) {
  const [state, setState] = useState(initialState);
  const [time, setTime] = useState(initialState.time);
  const [enabled, setEnabled] = useState(initialState.enabled);
  const [busy, setBusy] = useState<"run" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function refreshState() {
      const response = await fetch("/api/automation", { cache: "no-store" });
      if (response.ok && !cancelled) setState((await response.json()) as AutomationState);
    }
    void refreshState();
    if (state.status !== "queued" && state.status !== "running") {
      return () => {
        cancelled = true;
      };
    }
    const timer = window.setInterval(refreshState, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [state.status]);

  async function runNow() {
    setBusy("run");
    setError(null);
    try {
      const response = await fetch("/api/automation", { method: "POST" });
      const body = (await response.json()) as AutomationState & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not queue the run");
      setState(body);
      publishAutomationState(body);
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
      publishAutomationState(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the schedule");
    } finally {
      setBusy(null);
    }
  }

  const active = state.status === "queued" || state.status === "running";

  return (
    <section className="mb-10 border-b border-border pb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-medium text-foreground">Daily generation</h2>
          <p className="mt-1 text-xs text-muted">Creates one article session and one social session</p>
        </div>
        <button
          type="button"
          onClick={runNow}
          disabled={busy !== null || active}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "run" || active ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run both sessions
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-muted disabled:opacity-50"
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
      <p className="mt-3 text-xs leading-relaxed text-muted">Runs locally with your ChatGPT Codex sign-in.</p>
    </section>
  );
}
