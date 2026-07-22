"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleX, Clock3, Terminal } from "lucide-react";
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
  }).format(new Date(timestamp));
}

export function AutomationRunProgress({ state }: { state: AutomationState }) {
  const [now, setNow] = useState(() => Date.now());
  const active = state.status === "queued" || state.status === "running";

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const origin = state.startedAt ?? state.queuedAt;
  const elapsedSeconds = origin ? Math.max(0, (now - new Date(origin).getTime()) / 1000) : 0;
  const remainingSeconds = Math.max(0, (state.estimatedSeconds ?? 0) - elapsedSeconds);
  const progress = Math.min(100, Math.max(0, Math.round(state.progress)));
  const recentLogs = state.logs.slice(-5);

  return (
    <div className="w-full rounded-lg border border-border bg-background/90 p-3 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">{state.phase ?? "Preparing"}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted" aria-live="polite">
            {state.lastMessage ?? "The local Codex runner is working"}
          </p>
        </div>
        {state.status === "succeeded" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="Completed" />
        ) : state.status === "failed" ? (
          <CircleX className="h-5 w-5 shrink-0 text-warning" aria-label="Failed" />
        ) : (
          <span className="font-mono text-xs text-accent">{progress}%</span>
        )}
      </div>

      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Content generation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${
            state.status === "failed" ? "bg-warning" : "bg-accent"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {active && (
        <div className="mt-2 flex items-center justify-between gap-3 font-mono text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" /> {formatDuration(elapsedSeconds)} elapsed
          </span>
          {state.estimatedSeconds ? (
            <span>about {formatDuration(remainingSeconds)} left</span>
          ) : null}
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className="mt-3 border-t border-border pt-2.5">
          <p className="mb-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
            <Terminal className="h-3 w-3" /> Live activity
          </p>
          <ol className="space-y-1.5">
            {recentLogs.map((entry, index) => (
              <li
                key={`${entry.at}-${index}`}
                className={`grid grid-cols-[4.25rem_1fr] gap-2 text-[11px] leading-relaxed ${
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
    </div>
  );
}
