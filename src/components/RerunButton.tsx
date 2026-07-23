"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw } from "lucide-react";
import type { AutomationState } from "@/lib/automation";
import type { RunScope } from "@/lib/automation";
import type { Platform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";
import { publishAutomationState } from "@/lib/automation-client";

export default function RerunButton({
  postId,
  scope,
  label,
}: {
  postId: string;
  scope: Exclude<RunScope, "all">;
  label?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<AutomationState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshedRun = useRef<string | null>(null);
  const active = state?.status === "queued" || state?.status === "running";
  const belongsToButton = state?.scope === scope && state?.postId === postId;
  const activeForButton = active && belongsToButton;
  const scopeLabel =
    label ??
    (scope === "articles"
      ? "Rerun article research"
      : scope === "social"
        ? "Rerun social research"
        : `Rerun ${PLATFORM_LABELS[scope as Platform]}`);

  useEffect(() => {
    let cancelled = false;
    async function refreshState() {
      const response = await fetch("/api/automation", { cache: "no-store" });
      if (!response.ok) return;
      const next = (await response.json()) as AutomationState;
      if (cancelled) return;
      setState(next);
      const completedKey = `${next.runId ?? next.queuedAt}:${next.status}`;
      if (
        next.status === "succeeded" &&
        next.scope === scope &&
        next.postId === postId &&
        refreshedRun.current !== completedKey
      ) {
        refreshedRun.current = completedKey;
        router.refresh();
      }
    }

    void refreshState();
    const timer = window.setInterval(refreshState, active ? 2500 : 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [active, postId, router, scope]);

  async function rerun() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, postId }),
      });
      const body = (await response.json()) as AutomationState & { error?: string };
      if (!response.ok) throw new Error(body.error ?? `Could not ${scopeLabel.toLowerCase()}`);
      setState(body);
      publishAutomationState(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not queue the rerun");
    } finally {
      setSubmitting(false);
    }
  }

  const working = submitting || active;
  const succeeded = state?.status === "succeeded" && belongsToButton;
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={rerun}
        disabled={working}
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={scopeLabel}
      >
        {submitting || activeForButton ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        {submitting || activeForButton
          ? "Rerunning…"
          : active
            ? "Another run is active"
            : succeeded
              ? "Updated"
              : scopeLabel}
      </button>
      {error && <span className="max-w-56 text-right text-xs text-warning">{error}</span>}
    </div>
  );
}
