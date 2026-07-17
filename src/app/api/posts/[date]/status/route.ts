import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { PLATFORMS, type Platform } from "@/lib/types";

// Session auth is enforced by middleware (this path is inside the matcher).
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ date: string }> }) {
  const { date } = await ctx.params;

  let body: { platform?: string; posted?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!PLATFORMS.includes(body.platform as Platform) || typeof body.posted !== "boolean") {
    return NextResponse.json({ error: "Expected { platform, posted }" }, { status: 422 });
  }

  try {
    const status = await getStore().updateStatus(date, body.platform as Platform, body.posted);
    if (!status) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }
}
