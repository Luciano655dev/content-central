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

      <ol className="flex flex-col">
        {twitter.tweets.map((tweet, i) => {
          const count = tweet.text.length;
          const over = count > 280;
          return (
            <li key={i} className="border-t border-border py-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-muted">{i + 1}/{twitter.tweets.length}</span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs ${over ? "text-red-500" : "text-muted"}`}>
                    {count}/280
                  </span>
                  <CopyButton text={tweet.text} label="Copy" />
                </div>
              </div>
              <p className="max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {tweet.text}
              </p>
              {tweet.image_tip && (
                <div className="mt-4 flex max-w-xl items-start gap-2.5 border-l-2 border-border pl-4">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <p className="text-sm leading-relaxed text-muted">{tweet.image_tip}</p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
