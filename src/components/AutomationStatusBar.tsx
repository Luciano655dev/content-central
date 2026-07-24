"use client";

import { useEffect, useState } from "react";
import type { AutomationState } from "@/lib/automation";
import { AUTOMATION_STATE_EVENT } from "@/lib/automation-client";
import { AutomationRunProgress } from "./AutomationRunProgress";

export default function AutomationStatusBar({ initialState }: { initialState: AutomationState }) {
  const [state, setState] = useState(initialState);
  const active = state.status === "queued" || state.status === "running";

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const response = await fetch("/api/automation", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const next = (await response.json()) as AutomationState;
      if (cancelled) return;
      setState(next);
    }

    function receive(event: Event) {
      const next = (event as CustomEvent<AutomationState>).detail;
      if (next) setState(next);
    }

    window.addEventListener(AUTOMATION_STATE_EVENT, receive);
    const timer = window.setInterval(refresh, active ? 2500 : 10_000);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTOMATION_STATE_EVENT, receive);
      window.clearInterval(timer);
    };
  }, [active]);

  if (state.status === "idle") return null;
  return <AutomationRunProgress state={state} />;
}
