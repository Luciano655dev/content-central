"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, CircleX, Clock3, LoaderCircle } from "lucide-react";
import type { AutomationState } from "@/lib/automation";

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function logTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

export function AutomationRunProgress({ state }: { state: AutomationState }) {
  const [now, setNow] = useState(() => Date.now());
  const active = state.status === "queued" || state.status === "running";
  const [expanded, setExpanded] = useState(active);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const origin = state.startedAt ?? state.queuedAt;
  const elapsedSeconds = origin ? Math.max(0, (now - new Date(origin).getTime()) / 1000) : 0;
  const remainingSeconds = Math.max(0, (state.estimatedSeconds ?? 0) - elapsedSeconds);
  const progress = Math.min(100, Math.max(0, Math.round(state.progress)));
  const recentLogs = state.logs.slice(-8);

  return (
    <section className="mb-8 overflow-hidden rounded-xl border border-border bg-surface/70" aria-label="Automation status">
      <div className="flex min-h-14 items-center gap-3 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background">
          {state.status === "succeeded" ? (
            <CheckCircle2 className="h-4 w-4 text-success" aria-label="Completed" />
          ) : state.status === "failed" ? (
            <CircleX className="h-4 w-4 text-warning" aria-label="Failed" />
          ) : (
            <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-label="Running" />
          )}
        </div>

        <div className="min-w-0 flex-1" aria-live="polite">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-foreground">{state.phase ?? "Preparing"}</p>
            <p className="truncate text-xs text-muted">
              {state.lastMessage ?? "The local Codex runner is working"}
            </p>
          </div>
        </div>

        {active && <span className="shrink-0 font-mono text-xs text-accent">{progress}%</span>}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          {expanded ? "Minimize" : "Activity"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {active && (
        <div
          className="h-0.5 overflow-hidden bg-border"
          role="progressbar"
          aria-label="Content generation progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="h-full bg-accent transition-[width] duration-700" style={{ width: `${progress}%` }} />
        </div>
      )}

      {expanded && (
        <div className="border-t border-border bg-background/45 px-4 py-4">
          {active && (
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" /> {formatDuration(elapsedSeconds)} elapsed
              </span>
              {state.estimatedSeconds ? <span>About {formatDuration(remainingSeconds)} left</span> : null}
            </div>
          )}
          <ol className="space-y-2">
            {recentLogs.map((entry, index) => (
              <li
                key={`${entry.at}-${index}`}
                className={`grid grid-cols-[4.25rem_1fr] gap-3 text-xs leading-relaxed ${
                  entry.level === "error"
                    ? "text-warning"
                    : entry.level === "success"
                      ? "text-success"
                      : "text-muted"
                }`}
              >
                <time className="font-mono opacity-70" dateTime={entry.at}>
                  {logTime(entry.at)}
                </time>
                <span>{entry.message}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
