"use client";

import { ImagePlus } from "lucide-react";
import CopyButton from "./CopyButton";
import type { TwitterContent } from "@/lib/types";

export default function TwitterView({ twitter }: { twitter: TwitterContent }) {
  const fullThread = twitter.tweets.map((t, i) => `${i + 1}/ ${t.text}`).join("\n\n");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{twitter.tweets.length} tweets</p>
        <CopyButton text={fullThread} label="Copy whole thread" />
      </div>

      <ol className="flex flex-col gap-4">
        {twitter.tweets.map((tweet, i) => {
          const count = tweet.text.length;
          const over = count > 280;
          return (
            <li key={i}>
              <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
                <span className="font-mono text-xs text-muted">
                  {i + 1}/{twitter.tweets.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${over ? "text-warning" : "text-muted"}`}>
                    {count}/280
                  </span>
                  <CopyButton text={tweet.text} label="Copy" />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {tweet.text}
                </p>
              </div>
              {tweet.image_tip && (
                <div className="mt-2 flex items-start gap-2.5 rounded-lg border-l-2 border-accent bg-accent/8 p-3 pl-4">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-foreground/80">{tweet.image_tip}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
