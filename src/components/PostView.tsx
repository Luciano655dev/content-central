"use client";

import { useState } from "react";
import type { Platform, PostRow } from "@/lib/types";
import { PLATFORM_LABELS, PLATFORMS } from "@/lib/types";
import ArticleView from "./ArticleView";
import TwitterView from "./TwitterView";
import InstagramView from "./InstagramView";
import PostedToggle from "./PostedToggle";
import { Check } from "lucide-react";

export default function PostView({ post }: { post: PostRow }) {
  const [tab, setTab] = useState<Platform>("devto");

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`relative inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-sm transition-colors ${
                tab === p ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {PLATFORM_LABELS[p]}
              {post.status[p] && <Check className="h-3.5 w-3.5 text-muted" />}
              {tab === p && <span className="absolute inset-x-3 -bottom-px h-px bg-foreground" />}
            </button>
          ))}
        </nav>
        <div className="pb-2">
          <PostedToggle
            key={tab}
            date={post.date}
            platform={tab}
            initialPosted={post.status[tab]}
          />
        </div>
      </div>

      {tab === "devto" && (
        <ArticleView
          title={post.devto.title}
          bodyMarkdown={post.devto.body_markdown}
          tags={post.devto.tags}
        />
      )}
      {tab === "tabnews" && (
        <ArticleView title={post.tabnews.title} bodyMarkdown={post.tabnews.body_markdown} />
      )}
      {tab === "twitter" && <TwitterView twitter={post.twitter} />}
      {tab === "instagram" && <InstagramView instagram={post.instagram} />}
    </div>
  );
}
