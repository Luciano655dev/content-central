import { NextRequest, NextResponse } from "next/server";
import { isValidIngestToken } from "@/lib/auth";
import { logHit } from "@/lib/hitlog";
import { getStore } from "@/lib/store";
import { validateBundle } from "@/lib/validate";

export async function POST(request: NextRequest) {
  await logHit(
    "ingest",
    `POST auth=${request.headers.get("authorization") ? "yes" : "no"} ua=${request.headers.get("user-agent") ?? "-"}`
  );
  if (!isValidIngestToken(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = validateBundle(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  try {
    await getStore().upsertPost(result.bundle);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, date: result.bundle.date });
}
