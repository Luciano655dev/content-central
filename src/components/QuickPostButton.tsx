"use client";

import { useState } from "react";
import { ExternalLink, LoaderCircle, WandSparkles } from "lucide-react";
import { tweetImageSlide, type Platform, type PostRow } from "@/lib/types";

const COMPANION_FORM_URL = "http://127.0.0.1:47833/prepare-form";

const PLATFORM_URLS: Record<Platform, string> = {
  devto: "https://dev.to/new",
  tabnews: "https://www.tabnews.com.br/publicar",
  twitter: "https://x.com/compose/post",
  instagram: "https://www.instagram.com/",
};

type PreparedAsset = { slide: number; name: string; dataUrl: string };

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

async function fetchSlide(post: PostRow, slide: number): Promise<PreparedAsset> {
  const revision = encodeURIComponent(post.instagram.render_revision ?? "original");
  const response = await fetch(`/api/posts/${encodeURIComponent(post.id)}/instagram/${slide}?v=${revision}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Could not render Instagram slide ${slide}.`);
  return {
    slide,
    name: `${post.date}-instagram-${String(slide).padStart(2, "0")}.png`,
    dataUrl: await blobToDataUrl(await response.blob()),
  };
}

function fallbackText(post: PostRow, platform: Platform): string {
  if (platform === "devto") {
    return `${post.devto.title}\n\n${post.devto.body_markdown}\n\nTags: ${post.devto.tags.join(", ")}`;
  }
  if (platform === "tabnews") return `${post.tabnews.title}\n\n${post.tabnews.body_markdown}`;
  if (platform === "twitter") return post.twitter.tweets.map((tweet) => tweet.text).join("\n\n---\n\n");
  return post.instagram.caption;
}

export default function QuickPostButton({ post, platform }: { post: PostRow; platform: Platform }) {
  const [state, setState] = useState<"idle" | "working" | "ready" | "fallback">("idle");
  const [message, setMessage] = useState("");

  async function prepare() {
    const bridge = window.open("", "content-central-quick-post", "width=520,height=260");
    if (!bridge) {
      await navigator.clipboard.writeText(fallbackText(post, platform)).catch(() => undefined);
      setState("fallback");
      setMessage("The browser blocked the local companion window. The draft was copied as a fallback.");
      return;
    }
    bridge.document.title = "Content Central · Quick post";
    bridge.document.body.innerHTML =
      '<p style="font:16px system-ui;padding:24px;color:#222">Preparing your draft in Content Central…</p>';
    setState("working");
    setMessage(platform === "instagram" || platform === "twitter" ? "Rendering images…" : "Opening composer…");

    try {
      let assets: PreparedAsset[] = [];
      if (platform === "instagram") {
        assets = await Promise.all(post.instagram.slides.map((_slide, index) => fetchSlide(post, index + 1)));
      } else if (platform === "twitter") {
        const tweets = post.twitter.tweets.map((tweet, index) => ({
          ...tweet,
          image_slide: tweetImageSlide(tweet, index, post.instagram.slides.length),
        }));
        const requested = Array.from(
          new Set(
            tweets
              .map((tweet) => tweet.image_slide)
              .filter((slide): slide is number => Boolean(slide && post.instagram.slides[slide - 1]))
          )
        );
        assets = await Promise.all(requested.map((slide) => fetchSlide(post, slide)));
      }

      setMessage("Sending to the local companion…");
      const payload = JSON.stringify({
          platform,
          post:
            platform === "twitter"
              ? {
                  ...post,
                  twitter: {
                    tweets: post.twitter.tweets.map((tweet, index) => ({
                      ...tweet,
                      image_slide: tweetImageSlide(tweet, index, post.instagram.slides.length),
                    })),
                  },
                }
              : post,
          assets,
      });

      const form = document.createElement("form");
      form.method = "POST";
      form.action = COMPANION_FORM_URL;
      form.target = "content-central-quick-post";
      form.style.display = "none";
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "payload";
      input.value = payload;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
      form.remove();

      setState("ready");
      setMessage("Composer requested. Review the platform window, then click its final Post button.");
    } catch (error) {
      bridge.close();
      await navigator.clipboard.writeText(fallbackText(post, platform)).catch(() => undefined);
      setState("fallback");
      setMessage(
        error instanceof Error
          ? `${error.message} The draft was copied as a fallback.`
          : "Posting companion unavailable. The draft was copied as a fallback."
      );
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={prepare}
        disabled={state === "working"}
        className="inline-flex items-center gap-2 rounded-md bg-foreground px-3.5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
      >
        {state === "working" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <WandSparkles className="h-4 w-4" />
        )}
        {state === "working" ? "Preparing…" : "Quick post"}
      </button>
      {message && (
        <p
          role="status"
          className={`max-w-xs text-right text-xs leading-relaxed ${
            state === "fallback" ? "text-warning" : state === "ready" ? "text-success" : "text-muted"
          }`}
        >
          {message}
          {state === "fallback" && (
            <>
              {" "}
              <a
                href={PLATFORM_URLS[platform]}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-2"
              >
                Open manually <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
