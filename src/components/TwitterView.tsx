"use client";

import { ImagePlus } from "lucide-react";
import CopyButton from "./CopyButton";
import type { TwitterContent } from "@/lib/types";

export default function TwitterView({ twitter }: { twitter: TwitterContent }) {
  const fullThread = twitter.tweets.map((t, i) => `${i + 1}/ ${t.text}`).join("\n\n");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{twitter.tweets.length} tweets</p>
        <CopyButton text={fullThread} label="Copy whole thread" />
      </div>

      <ol className="relative flex flex-col gap-4">
        {twitter.tweets.map((tweet, i) => {
          const count = tweet.text.length;
          const over = count > 280;
          return (
            <li key={i} className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-twitter/15 font-mono text-xs text-twitter">
                  {i + 1}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${over ? "text-red-400" : "text-muted"}`}>
                    {count}/280
                  </span>
                  <CopyButton text={tweet.text} label="Copy" className="!py-1 !text-xs" />
                </div>
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {tweet.text}
              </p>
              {tweet.image_tip && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-accent/25 bg-accent/8 p-3.5">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-accent/90">{tweet.image_tip}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
