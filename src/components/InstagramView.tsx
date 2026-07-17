"use client";

import { MessageSquareText, Palette } from "lucide-react";
import CopyButton from "./CopyButton";
import type { InstagramContent } from "@/lib/types";

export default function InstagramView({ instagram }: { instagram: InstagramContent }) {
  const allSlides = instagram.slides
    .map((s, i) => `Slide ${i + 1} — ${s.title}\n${s.body}`)
    .join("\n\n");

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{instagram.slides.length} slides</p>
        <CopyButton text={allSlides} label="Copy all slides" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {instagram.slides.map((slide, i) => (
          <div
            key={i}
            className={`flex flex-col rounded-2xl border bg-surface p-5 ${
              i === 0 ? "border-instagram/40 md:col-span-2" : "border-border"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-instagram/15 font-mono text-xs text-instagram">
                  {i + 1}
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-instagram/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-instagram">
                    Cover · hook
                  </span>
                )}
              </span>
              <CopyButton text={`${slide.title}\n${slide.body}`} label="Copy" className="!py-1 !text-xs" />
            </div>
            <h3 className={`font-serif text-foreground ${i === 0 ? "text-2xl" : "text-lg"}`}>
              {slide.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
              {slide.body}
            </p>
            {slide.visual_tip && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-instagram/25 bg-instagram/8 p-3.5">
                <Palette className="mt-0.5 h-4 w-4 shrink-0 text-instagram" />
                <p className="text-sm leading-relaxed text-instagram/90">{slide.visual_tip}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {instagram.caption && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <MessageSquareText className="h-4 w-4" /> Caption
            </span>
            <CopyButton text={instagram.caption} label="Copy caption" />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
            {instagram.caption}
          </p>
        </div>
      )}
    </div>
  );
}
