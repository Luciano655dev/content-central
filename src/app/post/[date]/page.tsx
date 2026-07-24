import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import PostView from "@/components/PostView";
import ThemeToggle from "@/components/ThemeToggle";
import DeletePostButton from "@/components/DeletePostButton";
import AutomationStatusBar from "@/components/AutomationStatusBar";
import { getAutomationState } from "@/lib/automation";
import {
  CONTENT_SESSIONS,
  PLATFORMS,
  SESSION_PLATFORMS,
  type ContentSession,
  type Platform,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PostPage(props: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ platform?: string | string[]; session?: string | string[] }>;
}) {
  const [{ date: id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const requestedPlatform = Array.isArray(searchParams.platform)
    ? searchParams.platform[0]
    : searchParams.platform;
  const requestedSession = Array.isArray(searchParams.session)
    ? searchParams.session[0]
    : searchParams.session;
  const platformSession: ContentSession =
    requestedPlatform === "twitter" || requestedPlatform === "instagram" ? "social" : "articles";
  const initialSession: ContentSession = CONTENT_SESSIONS.includes(requestedSession as ContentSession)
    ? (requestedSession as ContentSession)
    : platformSession;
  const initialPlatform: Platform =
    PLATFORMS.includes(requestedPlatform as Platform) &&
    SESSION_PLATFORMS[initialSession].includes(requestedPlatform as Platform)
      ? (requestedPlatform as Platform)
      : SESSION_PLATFORMS[initialSession][0];

  const [post, automation] = await Promise.all([getStore().getPost(id), getAutomationState()]);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 sm:px-6 md:py-12">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Content Central
        </Link>
        <ThemeToggle />
      </div>

      <AutomationStatusBar initialState={automation} />

      <header className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {formatDate(post.date)}
        </p>
        <p className="text-sm text-muted">Daily content drop</p>
      </header>

      <PostView post={post} initialSession={initialSession} initialPlatform={initialPlatform} />
      <DeletePostButton id={post.id} />
    </main>
  );
}
