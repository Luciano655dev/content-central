import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authEnabled, sessionToken, SESSION_COOKIE } from "@/lib/auth";

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
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Content Central</h1>
        <p className="mt-1 text-sm text-muted">Enter your passcode to continue.</p>
        <form action={login} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Passcode"
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-foreground outline-none transition-colors focus:border-foreground"
          />
          {error && <p className="text-sm text-red-500">Wrong passcode. Try again.</p>}
          <button
            type="submit"
            className="rounded-lg bg-foreground px-3 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
