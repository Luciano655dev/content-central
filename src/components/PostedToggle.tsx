"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import type { Platform } from "@/lib/types";

export default function PostedToggle({
  date,
  platform,
  initialPosted,
}: {
  date: string;
  platform: Platform;
  initialPosted: boolean;
}) {
  const [posted, setPosted] = useState(initialPosted);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !posted;
    setPosted(next);
    startTransition(async () => {
      const res = await fetch(`/api/posts/${date}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, posted: next }),
      });
      if (!res.ok) setPosted(!next); // revert on failure
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        posted
          ? "border-success/40 bg-success/10 text-success"
          : "border-border text-muted hover:text-foreground"
      }`}
    >
      {posted && <Check className="h-3.5 w-3.5" />}
      {posted ? "Posted" : "Mark as posted"}
    </button>
  );
}
