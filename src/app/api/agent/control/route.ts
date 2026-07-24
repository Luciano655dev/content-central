import { NextRequest, NextResponse } from "next/server";
import { isValidIngestToken } from "@/lib/auth";
import {
  claimAutomationRun,
  completeAutomationRun,
  getAutomationState,
  updateAutomationProgress,
} from "@/lib/automation";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  return isValidIngestToken(request.headers.get("authorization"));
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getAutomationState());
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: {
    action?: unknown;
    runId?: unknown;
    ok?: unknown;
    message?: unknown;
    progress?: unknown;
    phase?: unknown;
    log?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (body.action === "claim") {
      const claim = await claimAutomationRun({
        hasPostToday: async (date) => {
          const topics = await getStore().listTopics();
          return topics.some((topic) => topic.date === date);
        },
      });
      if (!claim || claim.scope === "all") return NextResponse.json({ claim });

      const post = await getStore().getPost(claim.postId!);
      if (!post) {
        await completeAutomationRun({
          runId: claim.runId,
          ok: false,
          message: "The post selected for rerun no longer exists",
        });
        return NextResponse.json({ claim: null });
      }
      const bundle = {
        date: post.date,
        topic: post.topic,
        topic_rationale: post.topic_rationale,
        research_sources: post.research_sources,
        social_topic: post.social_topic,
        social_topic_rationale: post.social_topic_rationale,
        social_research_sources: post.social_research_sources,
        devto: post.devto,
        tabnews: post.tabnews,
        twitter: post.twitter,
        instagram: post.instagram,
        project_mentions: post.project_mentions,
      };
      return NextResponse.json({ claim, bundle });
    }

    if (
      body.action === "progress" &&
      typeof body.runId === "string" &&
      typeof body.progress === "number" &&
      (body.phase === undefined || typeof body.phase === "string") &&
      (body.message === undefined || typeof body.message === "string") &&
      (body.log === undefined || typeof body.log === "string")
    ) {
      const state = await updateAutomationProgress({
        runId: body.runId,
        progress: body.progress,
        ...(typeof body.phase === "string" ? { phase: body.phase } : {}),
        ...(typeof body.message === "string" ? { message: body.message } : {}),
        ...(typeof body.log === "string" ? { log: body.log } : {}),
      });
      if (!state) return NextResponse.json({ error: "Run is no longer active" }, { status: 409 });
      return NextResponse.json(state);
    }

    if (
      body.action === "complete" &&
      typeof body.runId === "string" &&
      typeof body.ok === "boolean" &&
      typeof body.message === "string"
    ) {
      const state = await completeAutomationRun({
        runId: body.runId,
        ok: body.ok,
        message: body.message,
      });
      if (!state) return NextResponse.json({ error: "Run is no longer active" }, { status: 409 });
      return NextResponse.json(state);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 422 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage error" },
      { status: 500 }
    );
  }
}
