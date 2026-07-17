export const SESSION_COOKIE = "cc_session";

/**
 * Derives the static session token from SESSION_SECRET using HMAC-SHA256.
 * Uses Web Crypto so it runs in both Node and the Edge middleware runtime.
 */
export async function sessionToken(): Promise<string | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("content-central-session-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Auth is only enforced when both envs are configured (production). */
export function authEnabled(): boolean {
  return Boolean(process.env.ACCESS_PASSWORD && process.env.SESSION_SECRET);
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  if (!authEnabled()) return true;
  if (!cookieValue) return false;
  const expected = await sessionToken();
  return expected !== null && timingSafeEqual(cookieValue, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Bearer-token check for the agent-facing API routes. */
export function isValidIngestToken(authHeader: string | null): boolean {
  const token = process.env.INGEST_TOKEN;
  if (!token) return false;
  if (!authHeader?.startsWith("Bearer ")) return false;
  return timingSafeEqual(authHeader.slice(7), token);
}
