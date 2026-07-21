"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePostButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleting(true);
    setError(null);
    const response = await fetch(`/api/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not delete this post");
      setDeleting(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className={compact ? "shrink-0" : "mt-10 border-t border-border pt-6"}>
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        aria-label={compact ? "Delete post" : undefined}
        className={`inline-flex items-center gap-1.5 text-sm text-warning transition-colors hover:text-foreground disabled:opacity-50 ${
          compact ? "rounded-md p-2" : ""
        }`}
      >
        <Trash2 className="h-4 w-4" />
        {!compact && (deleting ? "Deleting…" : "Delete post")}
      </button>
      {error && !compact && <p className="mt-2 text-xs text-warning">{error}</p>}
    </div>
  );
}
