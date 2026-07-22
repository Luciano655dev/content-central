"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { Platform } from "@/lib/types";

export default function PostedToggle({
  id,
  platform,
  posted,
  onPostedChange,
}: {
  id: string;
  platform: Platform;
  posted: boolean;
  onPostedChange: (posted: boolean) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !posted;
    onPostedChange(next);
    setPending(true);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, posted: next }),
      });
      if (!res.ok) {
        onPostedChange(!next);
        return;
      }
      router.refresh();
    } catch {
      onPostedChange(!next);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={posted}
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
