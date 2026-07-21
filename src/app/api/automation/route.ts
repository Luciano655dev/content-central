import { NextRequest, NextResponse } from "next/server";
import {
  getAutomationState,
  isValidTime,
  isValidTimezone,
  queueManualRun,
  updateAutomationSettings,
} from "@/lib/automation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAutomationState());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const state = await queueManualRun();
    if (!state) {
      return NextResponse.json({ error: "A content run is already queued or running" }, { status: 409 });
    }
    return NextResponse.json(state, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  let body: { enabled?: unknown; time?: unknown; timezone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof body.enabled !== "boolean" ||
    typeof body.time !== "string" ||
    !isValidTime(body.time) ||
    typeof body.timezone !== "string" ||
    !isValidTimezone(body.timezone)
  ) {
    return NextResponse.json(
      { error: "Expected a valid enabled flag, HH:MM time, and IANA timezone" },
      { status: 422 }
    );
  }
  try {
    return NextResponse.json(
      await updateAutomationSettings({
        enabled: body.enabled,
        time: body.time,
        timezone: body.timezone,
      })
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage error" },
      { status: 500 }
    );
  }
}
