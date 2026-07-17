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

      <ol className="flex flex-col">
        {instagram.slides.map((slide, i) => (
          <li key={i} className="border-t border-border py-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-muted">
                {i + 1}/{instagram.slides.length}
                {i === 0 && " · cover"}
              </span>
              <CopyButton text={`${slide.title}\n${slide.body}`} label="Copy" />
            </div>
            <h3 className={`max-w-xl font-serif text-foreground ${i === 0 ? "text-2xl" : "text-lg"}`}>
              {slide.title}
            </h3>
            <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {slide.body}
            </p>
            {slide.visual_tip && (
              <div className="mt-4 flex max-w-xl items-start gap-2.5 border-l-2 border-border pl-4">
                <Palette className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <p className="text-sm leading-relaxed text-muted">{slide.visual_tip}</p>
              </div>
            )}
          </li>
        ))}
      </ol>

      {instagram.caption && (
        <div className="border-t border-border py-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted">Caption</span>
            <CopyButton text={instagram.caption} label="Copy caption" />
          </div>
          <p className="max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {instagram.caption}
          </p>
        </div>
      )}
    </div>
  );
}
