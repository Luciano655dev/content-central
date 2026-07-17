"use client";

import { useState } from "react";
import { Eye, FileCode2, Hash } from "lucide-react";
import CopyButton from "./CopyButton";
import Markdown from "./Markdown";

export default function ArticleView({
  title,
  bodyMarkdown,
  tags,
}: {
  title: string;
  bodyMarkdown: string;
  tags?: string[];
}) {
  const [mode, setMode] = useState<"preview" | "raw">("preview");
  const words = bodyMarkdown.split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-serif text-2xl leading-snug text-foreground md:text-3xl">{title}</h2>
          <CopyButton text={title} label="Copy title" />
        </div>
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-muted"
              >
                <Hash className="h-3 w-3" />
                {t}
              </span>
            ))}
            <CopyButton text={tags.join(", ")} label="Copy tags" className="ml-1 !py-1 !text-xs" />
          </div>
        )}
        <p className="mt-4 text-xs text-muted">
          {words.toLocaleString()} words · ~{Math.max(1, Math.round(words / 220))} min read
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          <button
            onClick={() => setMode("preview")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              mode === "preview" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            onClick={() => setMode("raw")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition ${
              mode === "raw" ? "bg-surface-2 text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <FileCode2 className="h-3.5 w-3.5" /> Markdown
          </button>
        </div>
        <CopyButton text={bodyMarkdown} label="Copy markdown" />
      </div>

      {mode === "preview" ? (
        <article className="rounded-2xl border border-border bg-surface p-6 md:p-10">
          <Markdown>{bodyMarkdown}</Markdown>
        </article>
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-border bg-surface p-6 font-mono text-sm leading-relaxed text-foreground/90">
          {bodyMarkdown}
        </pre>
      )}
    </div>
  );
}
