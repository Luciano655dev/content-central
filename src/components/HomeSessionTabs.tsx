"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MessagesSquare } from "lucide-react";
import DeletePostButton from "./DeletePostButton";
import { formatDate, formatDateShort } from "@/lib/format";
import {
  CONTENT_SESSIONS,
  SESSION_LABELS,
  SESSION_PLATFORMS,
  type ContentSession,
  type PostSummary,
} from "@/lib/types";

function publishState(post: PostSummary, session: ContentSession) {
  const platforms = SESSION_PLATFORMS[session];
  const published = platforms.filter((platform) => post.status[platform]).length;
  if (published === 0) return { label: "Not published", badge: "bg-warning/10 text-warning" };
  if (published < platforms.length) {
    return {
      label: `${published}/${platforms.length} published`,
      badge: "bg-warning/10 text-warning",
    };
  }
  return { label: "Published", badge: "bg-success/10 text-success" };
}

function sessionTopic(post: PostSummary, session: ContentSession) {
  return session === "articles" ? post.topic : post.social_topic;
}

function postHref(post: PostSummary, session: ContentSession) {
  const platform = session === "articles" ? "devto" : "twitter";
  return `/post/${post.id}?session=${session}&platform=${platform}`;
}

export default function HomeSessionTabs({
  posts,
  initialSession,
}: {
  posts: PostSummary[];
  initialSession: ContentSession;
}) {
  const [session, setSession] = useState(initialSession);
  const [latest, ...rest] = posts;

  function selectSession(next: ContentSession) {
    setSession(next);
    const params = new URLSearchParams(window.location.search);
    params.set("session", next);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  return (
    <section>
      <nav className="mb-9 flex border-b border-border" aria-label="Content session">
        {CONTENT_SESSIONS.map((item) => {
          const active = session === item;
          const Icon = item === "articles" ? FileText : MessagesSquare;
          return (
            <button
              key={item}
              type="button"
              onClick={() => selectSession(item)}
              aria-pressed={active}
              className={`relative flex-1 px-2 py-3 text-left transition-colors sm:px-4 ${
                active ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4" /> {SESSION_LABELS[item]}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {item === "articles" ? "Deep technical research" : "Quick, useful, saveable ideas"}
              </span>
              {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-foreground sm:inset-x-4" />}
            </button>
          );
        })}
      </nav>

      {latest && (
        <section className="mb-12">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted">Latest · {formatDate(latest.date)}</p>
          <Link
            href={postHref(latest, session)}
            className="group block rounded-xl border border-border bg-surface px-5 py-5 transition-colors hover:border-muted sm:px-6"
          >
            <div className="flex items-start justify-between gap-5">
            <h2 className="font-serif text-2xl leading-snug text-foreground md:text-3xl">
              {sessionTopic(latest, session)}
            </h2>
            <span className={`mt-1 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${publishState(latest, session).badge}`}>
              {publishState(latest, session).label}
            </span>
            </div>
            <p className="mt-4 text-sm text-muted group-hover:text-foreground">Open session →</p>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted">Archive</p>
          <ul className="divide-y divide-border border-y border-border">
            {rest.map((post) => {
              const state = publishState(post, session);
              return (
                <li key={post.id} className="group/row flex items-center gap-1">
                  <Link
                    href={postHref(post, session)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-6 py-4 pr-2 transition-colors hover:text-accent"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-foreground">
                        {sessionTopic(post, session)}
                      </p>
                      <p className="mt-1 text-xs text-muted">{formatDateShort(post.date)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${state.badge}`}>{state.label}</span>
                  </Link>
                  <DeletePostButton id={post.id} compact />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}
