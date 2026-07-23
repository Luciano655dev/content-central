"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";
import CopyButton from "./CopyButton";
import { tweetImageSlide, type TwitterContent } from "@/lib/types";

export default function TwitterView({
  postId,
  slideCount,
  renderRevision,
  twitter,
}: {
  postId: string;
  slideCount: number;
  renderRevision?: string;
  twitter: TwitterContent;
}) {
  const revision = encodeURIComponent(renderRevision ?? "original");
  const fullThread = twitter.tweets.map((t, i) => `${i + 1}/ ${t.text}`).join("\n\n");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{twitter.tweets.length} tweets</p>
        <CopyButton text={fullThread} label="Copy whole thread" />
      </div>

      <ol className="flex flex-col divide-y divide-border border-y border-border">
        {twitter.tweets.map((tweet, i) => {
          const count = tweet.text.length;
          const over = count > 280;
          const imageSlide = tweetImageSlide(tweet, i, slideCount);
          return (
            <li key={i} className="py-5">
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
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
              <div className="rounded-xl bg-surface p-4">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {tweet.text}
                </p>
              </div>
              {tweet.image_tip && (
                <div className="mt-2 flex items-start gap-2.5 rounded-lg bg-surface p-3">
                  <ImagePlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p className="text-sm leading-relaxed text-foreground/80">{tweet.image_tip}</p>
                </div>
              )}
              {imageSlide && (
                <div className="mt-3 overflow-hidden rounded-xl border border-border bg-[#0A0A0A]">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="font-mono text-xs text-muted">
                      Reuses Instagram slide {imageSlide}
                    </span>
                    <a
                      href={`/api/posts/${encodeURIComponent(postId)}/instagram/${imageSlide}?download=1&v=${revision}`}
                      className="text-xs text-accent underline underline-offset-2"
                    >
                      Download
                    </a>
                  </div>
                  <Image
                    unoptimized
                    src={`/api/posts/${encodeURIComponent(postId)}/instagram/${imageSlide}?v=${revision}`}
                    alt={`Instagram slide ${imageSlide} reused for tweet ${i + 1}`}
                    width={1080}
                    height={1350}
                    className="h-auto w-full"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
