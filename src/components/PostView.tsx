"use client";

import { useState } from "react";
import type { ContentSession, Platform, PostRow } from "@/lib/types";
import { PLATFORM_LABELS, SESSION_LABELS, SESSION_PLATFORMS } from "@/lib/types";
import ArticleView from "./ArticleView";
import TwitterView from "./TwitterView";
import InstagramView from "./InstagramView";
import PostedToggle from "./PostedToggle";
import QuickPostButton from "./QuickPostButton";
import RerunButton from "./RerunButton";
import { Check, FileText, MessagesSquare } from "lucide-react";

export default function PostView({
  post,
  initialSession = "articles",
  initialPlatform = "devto",
}: {
  post: PostRow;
  initialSession?: ContentSession;
  initialPlatform?: Platform;
}) {
  const [session, setSession] = useState<ContentSession>(initialSession);
  const [tab, setTab] = useState<Platform>(initialPlatform);
  const [status, setStatus] = useState(post.status);

  function selectTab(platform: Platform) {
    setTab(platform);
    const params = new URLSearchParams(window.location.search);
    params.set("platform", platform);
    params.set("session", session);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function selectSession(next: ContentSession) {
    const platform = SESSION_PLATFORMS[next][0];
    setSession(next);
    setTab(platform);
    const params = new URLSearchParams(window.location.search);
    params.set("session", next);
    params.set("platform", platform);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  function updatePosted(platform: Platform, posted: boolean) {
    setStatus((current) => ({ ...current, [platform]: posted }));
  }

  const sessionTopic = session === "articles" ? post.topic : post.social_topic;
  const sessionRationale =
    session === "articles" ? post.topic_rationale : post.social_topic_rationale;
  const sessionSources =
    session === "articles" ? post.research_sources : post.social_research_sources;
  const platforms = SESSION_PLATFORMS[session];

  return (
    <div>
      <nav className="mb-8 flex border-b border-border" aria-label="Content session">
        {(["articles", "social"] as ContentSession[]).map((item) => {
          const Icon = item === "articles" ? FileText : MessagesSquare;
          return (
            <button
              key={item}
              type="button"
              onClick={() => selectSession(item)}
              aria-pressed={session === item}
              className={`relative flex-1 px-2 py-3 text-left transition-colors sm:px-4 ${
                session === item ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4" /> {SESSION_LABELS[item]}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {item === "articles" ? "Dev.to + TabNews" : "Twitter + Instagram"}
              </span>
              {session === item && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground sm:inset-x-4" />}
            </button>
          );
        })}
      </nav>

      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">
              {session === "articles" ? "Technical research session" : "Quick social research session"}
            </p>
            <h1 className="font-serif text-3xl leading-[1.08] text-foreground md:text-4xl">{sessionTopic}</h1>
          </div>
          <RerunButton
            key={`${session}-research-rerun`}
            postId={post.id}
            scope={session}
          />
        </div>
        {sessionRationale && (
          <details className="group mt-6 border-y border-border">
            <summary className="cursor-pointer py-3 text-sm text-muted transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              Why this topic · research notes
            </summary>
            <div className="pb-4">
              <p className="text-sm leading-relaxed text-foreground/90">{sessionRationale}</p>
              {sessionSources.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1.5">
                  {sessionSources.map((source, index) => (
                    <li key={`${source.url}-${index}`}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-accent underline underline-offset-4 hover:no-underline"
                      >
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        )}
        {session === "articles" && post.project_mentions.length > 0 && (
          <p className="mt-4 text-xs text-muted">Mentions: {post.project_mentions.join(", ")}</p>
        )}
      </header>

      <div className="mb-8 flex flex-col gap-2 border-y border-border py-2 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Publishing platform">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => selectTab(p)}
              aria-pressed={tab === p}
              className={`relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
                tab === p ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {PLATFORM_LABELS[p]}
              {status[p] && <Check className="h-3.5 w-3.5 text-success" />}
              {tab === p && <span className="absolute inset-x-3 bottom-0 h-px bg-accent" />}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap items-start gap-2 py-1">
          <RerunButton key={`${tab}-rerun`} postId={post.id} scope={tab} />
          <QuickPostButton post={post} platform={tab} />
          <PostedToggle
            key={tab}
            id={post.id}
            platform={tab}
            posted={status[tab]}
            onPostedChange={(posted) => updatePosted(tab, posted)}
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
      {tab === "twitter" && (
        <TwitterView
          postId={post.id}
          slideCount={post.instagram.slides.length}
          renderRevision={post.instagram.render_revision}
          twitter={post.twitter}
        />
      )}
      {tab === "instagram" && (
        <InstagramView postId={post.id} date={post.date} instagram={post.instagram} />
      )}
    </div>
  );
}
