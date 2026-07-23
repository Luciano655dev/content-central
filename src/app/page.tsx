import { getStore } from "@/lib/store";
import { CONTENT_SESSIONS, type ContentSession, type PostSummary } from "@/lib/types";
import ThemeToggle from "@/components/ThemeToggle";
import AutomationControls from "@/components/AutomationControls";
import HomeSessionTabs from "@/components/HomeSessionTabs";
import AutomationStatusBar from "@/components/AutomationStatusBar";
import { getAutomationState } from "@/lib/automation";

export const dynamic = "force-dynamic";

export default async function Home(props: {
  searchParams: Promise<{ session?: string | string[] }>;
}) {
  let posts: PostSummary[] = [];
  let storeError: string | null = null;
  try {
    posts = await getStore().listSummaries();
  } catch (e) {
    storeError = e instanceof Error ? e.message : "Failed to load posts";
  }

  const [automation, searchParams] = await Promise.all([getAutomationState(), props.searchParams]);
  const requestedSession = Array.isArray(searchParams.session)
    ? searchParams.session[0]
    : searchParams.session;
  const initialSession: ContentSession = CONTENT_SESSIONS.includes(requestedSession as ContentSession)
    ? (requestedSession as ContentSession)
    : "articles";

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-6 md:py-12">
      <header className="mb-8 flex items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Content Central</h1>
          <p className="mt-1 text-sm text-muted">Research, write, review, publish</p>
        </div>
        <ThemeToggle />
      </header>

      <AutomationStatusBar initialState={automation} />

      {storeError && (
        <p className="mb-8 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          Couldn&apos;t load posts: {storeError}
        </p>
      )}

      <AutomationControls initialState={automation} />

      {posts.length === 0 && !storeError && (
        <div className="border-t border-border pt-16 text-center">
          <h2 className="font-serif text-xl text-foreground">Nothing here yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Codex writes every day at 4:00 AM. Your first content drop will appear here —
            researched, written, and ready to review.
          </p>
        </div>
      )}

      {posts.length > 0 && <HomeSessionTabs posts={posts} initialSession={initialSession} />}
    </main>
  );
}
