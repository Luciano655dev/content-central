import JSZip from "jszip";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { instagramImageName, renderInstagramSlide } from "@/lib/instagram-render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ date: string }> }
) {
  const { date: id } = await context.params;
  const post = await getStore().getPost(id);
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const zip = new JSZip();
  const rendered = await Promise.all(
    post.instagram.slides.map(async (_slide, index) => {
      const image = await renderInstagramSlide(post, index);
      return { name: instagramImageName(post.date, index), bytes: await image.arrayBuffer() };
    })
  );
  for (const image of rendered) zip.file(image.name, image.bytes);

  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Response(Buffer.from(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${post.date}-instagram-carousel.zip"`,
      "Cache-Control": "private, no-store",
    },
  });
}
