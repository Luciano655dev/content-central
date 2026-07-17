import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import PostView from "@/components/PostView";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function PostPage(props: { params: Promise<{ date: string }> }) {
  const { date } = await props.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const post = await getStore().getPost(date);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 md:py-14">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All drops
        </Link>
        <ThemeToggle />
      </div>

      <header className="mb-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
          {formatDate(post.date)}
        </p>
        <h1 className="font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {post.topic}
        </h1>

        {post.topic_rationale && (
          <details className="group mt-6 border-t border-border">
            <summary className="cursor-pointer py-3 text-sm text-muted transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
              Why this topic · research notes
            </summary>
            <div className="pb-4">
              <p className="text-sm leading-relaxed text-foreground/90">{post.topic_rationale}</p>
              {post.research_sources.length > 0 && (
                <ul className="mt-4 flex flex-col gap-1.5">
                  {post.research_sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-accent underline underline-offset-4 hover:no-underline"
                      >
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
          <p className="mt-4 text-xs text-muted">
            Mentions: {post.project_mentions.join(", ")}
          </p>
        )}
      </header>

      <PostView post={post} />
    </main>
  );
}
