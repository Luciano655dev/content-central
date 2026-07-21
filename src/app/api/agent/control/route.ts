import { NextRequest, NextResponse } from "next/server";
import { isValidIngestToken } from "@/lib/auth";
import {
  claimAutomationRun,
  completeAutomationRun,
  getAutomationState,
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
  let body: { action?: unknown; runId?: unknown; ok?: unknown; message?: unknown };
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
      return NextResponse.json({ claim });
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
