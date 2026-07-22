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
  if (published === 0) return { label: "not published", text: "text-warning", line: "border-warning" };
  if (published < platforms.length) {
    return {
      label: `${published}/${platforms.length} published`,
      text: "text-warning",
      line: "border-warning",
    };
  }
  return { label: "published", text: "text-success", line: "border-success" };
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
      <div className="mb-10 grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1.5">
        {CONTENT_SESSIONS.map((item) => {
          const active = session === item;
          const Icon = item === "articles" ? FileText : MessagesSquare;
          return (
            <button
              key={item}
              type="button"
              onClick={() => selectSession(item)}
              className={`rounded-lg px-4 py-3 text-left transition-colors ${
                active ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4" /> {SESSION_LABELS[item]}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {item === "articles" ? "Deep technical research" : "Quick, useful, saveable ideas"}
              </span>
            </button>
          );
        })}
      </div>

      {latest && (
        <section className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
            Latest {SESSION_LABELS[session].toLowerCase()} session · {formatDate(latest.date)}
          </p>
          <Link
            href={postHref(latest, session)}
            className={`group block border-l-2 ${publishState(latest, session).line} pl-5 transition-colors hover:bg-surface`}
          >
            <h2 className="py-1 font-serif text-2xl leading-snug text-foreground underline-offset-4 group-hover:underline md:text-3xl">
              {sessionTopic(latest, session)}
            </h2>
            <p className={`pb-1 text-sm ${publishState(latest, session).text}`}>
              {publishState(latest, session).label}
            </p>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Archive</p>
          <ul className="flex flex-col gap-3">
            {rest.map((post) => {
              const state = publishState(post, session);
              return (
                <li key={post.id} className="flex items-center gap-1">
                  <Link
                    href={postHref(post, session)}
                    className={`group flex min-w-0 flex-1 items-baseline justify-between gap-6 border-l-2 ${state.line} py-2 pl-5 pr-2 transition-colors hover:bg-surface`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[15px] text-foreground underline-offset-4 group-hover:underline">
                        {sessionTopic(post, session)}
                      </p>
                      <p className="mt-1 text-xs text-muted">{formatDateShort(post.date)}</p>
                    </div>
                    <span className={`shrink-0 text-xs ${state.text}`}>{state.label}</span>
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
