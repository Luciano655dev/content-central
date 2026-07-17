import Link from "next/link";
import { getStore } from "@/lib/store";
import { formatDate, formatDateShort } from "@/lib/format";
import { PLATFORMS, type PostSummary } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

function publishedLabel(post: PostSummary): string {
  const n = PLATFORMS.filter((p) => post.status[p]).length;
  if (n === 0) return "not published";
  return `${n}/${PLATFORMS.length} published`;
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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
      <header className="mb-14 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Content Central</h1>
          <p className="mt-1 text-sm text-muted">Daily dev-content studio</p>
        </div>
        <ThemeToggle />
      </header>

      {storeError && (
        <p className="mb-8 border-l-2 border-border pl-4 text-sm text-muted">
          Couldn&apos;t load posts: {storeError}
        </p>
      )}

      {!latest && !storeError && (
        <div className="border-t border-border pt-16 text-center">
          <h2 className="font-serif text-xl text-foreground">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            The bot writes every night at 3:00 AM. Your first content drop will appear here —
            researched, written, and ready to review.
          </p>
        </div>
      )}

      {latest && (
        <section className="mb-12">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
            Latest · {formatDate(latest.date)}
          </p>
          <Link href={`/post/${latest.date}`} className="group block">
            <h2 className="font-serif text-2xl leading-snug text-foreground underline-offset-4 group-hover:underline md:text-3xl">
              {latest.topic}
            </h2>
          </Link>
          <p className="mt-3 text-sm text-muted">{publishedLabel(latest)}</p>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Archive</p>
          <ul>
            {rest.map((post) => (
              <li key={post.date} className="border-t border-border">
                <Link
                  href={`/post/${post.date}`}
                  className="group flex items-baseline justify-between gap-6 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-foreground underline-offset-4 group-hover:underline">
                      {post.topic}
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatDateShort(post.date)}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{publishedLabel(post)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
