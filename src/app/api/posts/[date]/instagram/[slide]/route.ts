import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { renderInstagramSlide } from "@/lib/instagram-render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string; slide: string }> }
) {
  const { date: id, slide } = await context.params;
  const index = Number.parseInt(slide, 10) - 1;
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Invalid slide" }, { status: 400 });
  }

  const post = await getStore().getPost(id);
  if (!post || !post.instagram.slides[index]) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  return renderInstagramSlide(post, index, request.nextUrl.searchParams.has("download"));
}
