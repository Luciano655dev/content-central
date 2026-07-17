"use client";

import { useState } from "react";
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
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="max-w-2xl font-serif text-2xl leading-snug text-foreground">{title}</h2>
          <CopyButton text={title} label="Copy title" />
        </div>
        <p className="mt-3 text-sm text-muted">
          {tags && tags.length > 0 && (
            <>
              {tags.map((t) => `#${t}`).join("  ")}
              <span className="mx-2">·</span>
            </>
          )}
          {words.toLocaleString()} words · ~{Math.max(1, Math.round(words / 220))} min read
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setMode("preview")}
            className={`transition-colors ${
              mode === "preview" ? "text-foreground underline underline-offset-8" : "text-muted hover:text-foreground"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("raw")}
            className={`transition-colors ${
              mode === "raw" ? "text-foreground underline underline-offset-8" : "text-muted hover:text-foreground"
            }`}
          >
            Markdown
          </button>
        </div>
        <div className="flex gap-2">
          {tags && tags.length > 0 && (
            <CopyButton text={tags.join(", ")} label="Copy tags" />
          )}
          <CopyButton text={bodyMarkdown} label="Copy markdown" />
        </div>
      </div>

      {mode === "preview" ? (
        <article className="border-t border-border pt-8">
          <Markdown>{bodyMarkdown}</Markdown>
        </article>
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap border-t border-border pt-8 font-mono text-sm leading-relaxed text-foreground/90">
          {bodyMarkdown}
        </pre>
      )}
    </div>
  );
}
