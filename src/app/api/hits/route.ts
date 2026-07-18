import { NextRequest, NextResponse } from "next/server";
import { isValidIngestToken } from "@/lib/auth";

// Returns recent agent-facing API hits recorded by logHit, newest first.
// Lets an operator see whether cloud runs are actually reaching the app.
export async function GET(request: NextRequest) {
  if (!isValidIngestToken(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ hits: [], note: "Blob storage not configured" });
  }

  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "hits/", limit: 200 });
    const recent = [...blobs]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 40);
    const hits = await Promise.all(
      recent.map(async (b) => ({
        at: b.uploadedAt,
        name: b.pathname,
        info: await fetch(b.url, { cache: "no-store" })
          .then((r) => (r.ok ? r.text() : `read failed: ${r.status}`))
          .catch(() => "read failed"),
      }))
    );
    return NextResponse.json({ hits });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }
}
