import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import PostView from "@/components/PostView";
import ThemeToggle from "@/components/ThemeToggle";
import DeletePostButton from "@/components/DeletePostButton";
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

  const post = await getStore().getPost(id);
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
        <p className="text-sm text-muted">Daily content drop · two independent research sessions</p>
      </header>

      <PostView post={post} initialSession={initialSession} initialPlatform={initialPlatform} />
      <DeletePostButton id={post.id} />
    </main>
  );
}
