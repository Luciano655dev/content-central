/** Records agent-facing API hits into Blob storage for pipeline diagnostics. */
export async function logHit(kind: string, info: string): Promise<void> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return;
    const { put } = await import("@vercel/blob");
    await put(`hits/${new Date().toISOString()}-${kind}.txt`, info, {
      access: "public",
      addRandomSuffix: true,
      contentType: "text/plain",
    });
  } catch {
    // diagnostics must never break the request
  }
}
