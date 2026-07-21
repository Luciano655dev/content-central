import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

export async function DELETE(_request: Request, ctx: { params: Promise<{ date: string }> }) {
  const { date: id } = await ctx.params;
  try {
    const deleted = await getStore().deletePost(id);
    if (!deleted) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Storage error" },
      { status: 500 }
    );
  }
}
