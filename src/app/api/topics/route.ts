import { NextRequest, NextResponse } from "next/server";
import { isValidIngestToken } from "@/lib/auth";
import { getStore } from "@/lib/store";

export async function GET(request: NextRequest) {
  if (!isValidIngestToken(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const topics = await getStore().listTopics();
    return NextResponse.json({ topics });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }
}
