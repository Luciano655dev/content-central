"use client";

import { Palette } from "lucide-react";
import CopyButton from "./CopyButton";
import type { InstagramContent } from "@/lib/types";

export default function InstagramView({ instagram }: { instagram: InstagramContent }) {
  const allSlides = instagram.slides
    .map((s, i) => `Slide ${i + 1} — ${s.title}\n${s.body}`)
    .join("\n\n");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{instagram.slides.length} slides</p>
        <CopyButton text={allSlides} label="Copy all slides" />
      </div>

      <ol className="flex flex-col gap-4">
        {instagram.slides.map((slide, i) => (
          <li key={i}>
            <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
              <span className="font-mono text-xs text-muted">
                {i + 1}/{instagram.slides.length}
                {i === 0 && " · cover"}
              </span>
              <CopyButton text={`${slide.title}\n${slide.body}`} label="Copy" />
            </div>
            <div className="rounded-lg border border-border bg-surface p-5">
              <h3 className={`font-serif text-foreground ${i === 0 ? "text-2xl" : "text-lg"}`}>
                {slide.title}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {slide.body}
              </p>
            </div>
            {slide.visual_tip && (
              <div className="mt-2 flex items-start gap-2.5 rounded-lg border-l-2 border-accent bg-accent/8 p-3 pl-4">
                <Palette className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <p className="text-sm leading-relaxed text-foreground/80">{slide.visual_tip}</p>
              </div>
            )}
          </li>
        ))}
      </ol>

      {instagram.caption && (
        <div className="mt-6">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-sm text-muted">Caption</span>
            <CopyButton text={instagram.caption} label="Copy caption" />
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {instagram.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
