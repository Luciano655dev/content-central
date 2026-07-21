"use client";

import Image from "next/image";
import { Download, Palette } from "lucide-react";
import CopyButton from "./CopyButton";
import type { InstagramContent } from "@/lib/types";

export default function InstagramView({
  postId,
  date,
  instagram,
}: {
  postId: string;
  date: string;
  instagram: InstagramContent;
}) {
  const revision = encodeURIComponent(instagram.render_revision ?? "original");
  const allSlides = instagram.slides
    .map((s, i) => `Slide ${i + 1} — ${s.title}\n${s.body}`)
    .join("\n\n");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{instagram.slides.length} ready-to-post images · 1080×1350</p>
        <div className="flex items-center gap-2">
          <CopyButton text={allSlides} label="Copy all slides" />
          <a
            href={`/api/posts/${encodeURIComponent(postId)}/instagram`}
            download={`${date}-instagram-carousel.zip`}
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            <Download className="h-4 w-4" /> Download all
          </a>
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {instagram.slides.map((slide, i) => (
          <li key={i}>
            <div className="mb-1.5 flex items-center justify-between gap-3 px-1">
              <span className="font-mono text-xs text-muted">
                {i + 1}/{instagram.slides.length}
                {i === 0 && " · cover"}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/posts/${encodeURIComponent(postId)}/instagram/${i + 1}?download=1&v=${revision}`}
                  className="text-xs text-accent underline underline-offset-2"
                >
                  Download PNG
                </a>
                <CopyButton text={`${slide.title}\n${slide.body}`} label="Copy" />
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-[#0A0A0A]">
              <Image
                unoptimized
                src={`/api/posts/${encodeURIComponent(postId)}/instagram/${i + 1}?v=${revision}`}
                alt={`Instagram carousel slide ${i + 1}: ${slide.title}`}
                width={1080}
                height={1350}
                className="h-auto w-full"
              />
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
