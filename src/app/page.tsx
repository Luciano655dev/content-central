import Link from "next/link";
import { ArrowUpRight, Moon, Sparkles } from "lucide-react";
import { getStore, usingSupabase } from "@/lib/store";
import { formatDate, formatDateShort } from "@/lib/format";
import { PLATFORM_LABELS, PLATFORMS, type PostSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

const PLATFORM_DOT: Record<string, string> = {
  devto: "bg-devto",
  tabnews: "bg-tabnews",
  twitter: "bg-twitter",
  instagram: "bg-instagram",
};

function StatusDots({ post }: { post: PostSummary }) {
  return (
    <div className="flex items-center gap-1.5">
      {PLATFORMS.map((p) => (
        <span
          key={p}
          title={`${PLATFORM_LABELS[p]}: ${post.status[p] ? "posted" : "not posted"}`}
          className={`h-2 w-2 rounded-full ${post.status[p] ? PLATFORM_DOT[p] : "bg-border"}`}
        />
      ))}
    </div>
  );
}

export default async function Home() {
  let posts: PostSummary[] = [];
  let storeError: string | null = null;
  try {
    posts = await getStore().listSummaries();
  } catch (e) {
    storeError = e instanceof Error ? e.message : "Failed to load posts";
  }

  const [latest, ...rest] = posts;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:py-16">
      <header className="mb-12 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Daily dev-content studio
          </p>
          <h1 className="font-serif text-4xl text-foreground md:text-5xl">Content Central</h1>
        </div>
        {!usingSupabase() && (
          <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">
            local mode
          </span>
        )}
      </header>

      {storeError && (
        <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          Couldn&apos;t load posts: {storeError}
        </div>
      )}

      {!latest && !storeError && (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface/50 px-6 py-20 text-center">
          <Moon className="mb-4 h-8 w-8 text-muted" />
          <h2 className="font-serif text-xl text-foreground">Nothing here yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            The bot writes every night at 3:00 AM. Your first content drop will appear here —
            researched, written, and ready to review.
          </p>
        </div>
      )}

      {latest && (
        <Link
          href={`/post/${latest.date}`}
          className="group mb-10 block rounded-3xl border border-accent/30 bg-gradient-to-b from-surface to-surface-2 p-8 transition hover:border-accent/60 md:p-10"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              Latest drop · {formatDate(latest.date)}
            </span>
            <StatusDots post={latest} />
          </div>
          <h2 className="font-serif text-2xl leading-snug text-foreground md:text-4xl">
            {latest.topic}
          </h2>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-accent">
            Review &amp; publish
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {rest.length > 0 && (
        <section>
          <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Archive</h3>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {rest.map((post) => (
              <li key={post.date}>
                <Link
                  href={`/post/${post.date}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-foreground">{post.topic}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {formatDateShort(post.date)}
                    </p>
                  </div>
                  <StatusDots post={post} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
