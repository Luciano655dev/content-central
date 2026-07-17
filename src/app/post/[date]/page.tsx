import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpenText, Link2, Rocket } from "lucide-react";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import PostView from "@/components/PostView";

export const dynamic = "force-dynamic";

export default async function PostPage(props: { params: Promise<{ date: string }> }) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const post = await getStore().getPost(date);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 md:py-14">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All drops
      </Link>

      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent">
          {formatDate(post.date)}
        </p>
        <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {post.topic}
        </h1>

        {post.topic_rationale && (
          <details className="group mt-5 rounded-2xl border border-border bg-surface">
            <summary className="flex cursor-pointer items-center gap-2 px-5 py-3.5 text-sm text-muted transition hover:text-foreground [&::-webkit-details-marker]:hidden">
              <BookOpenText className="h-4 w-4" />
              Why this topic · research notes
            </summary>
            <div className="border-t border-border px-5 py-4">
              <p className="text-sm leading-relaxed text-foreground/85">{post.topic_rationale}</p>
              {post.research_sources.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1.5">
                  {post.research_sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5 shrink-0" />
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        )}

        {post.project_mentions.length > 0 && (
          <p className="mt-4 inline-flex flex-wrap items-center gap-2 text-xs text-muted">
            <Rocket className="h-3.5 w-3.5 text-accent" />
            Mentions:
            {post.project_mentions.map((m) => (
              <span key={m} className="rounded-full border border-border bg-surface px-2.5 py-0.5">
                {m}
              </span>
            ))}
          </p>
        )}
      </header>

      <PostView post={post} />
    </main>
  );
}
