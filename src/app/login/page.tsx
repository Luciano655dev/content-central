import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authEnabled, sessionToken, SESSION_COOKIE } from "@/lib/auth";
import { Lock } from "lucide-react";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  if (typeof password !== "string" || password !== process.env.ACCESS_PASSWORD) {
    redirect("/login?error=1");
  }
  const token = await sessionToken();
  if (!token) redirect("/login?error=1");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!authEnabled()) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <h1 className="font-serif text-2xl text-foreground">Content Central</h1>
          <p className="mt-1 text-sm text-muted">Enter your passcode to continue.</p>
        </div>
        <form action={login} className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Passcode"
            autoFocus
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-accent/60"
          />
          {error && <p className="text-sm text-red-400">Wrong passcode. Try again.</p>}
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-3 font-medium text-background transition hover:opacity-90"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
