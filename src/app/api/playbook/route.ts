import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isValidIngestToken } from "@/lib/auth";

// Serves the editorial playbook to the daily agent so it can run without
// cloning the repo. Files ship with the deployment via outputFileTracingIncludes.
export async function GET(request: NextRequest) {
  console.log(
    `[playbook] GET ${request.nextUrl.search} auth=${request.headers.get("authorization") ? "yes" : "no"} ua=${request.headers.get("user-agent") ?? "-"}`
  );
  if (!isValidIngestToken(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const root = process.cwd();
    const files: Record<string, string> = {
      "AGENT.md": await fs.readFile(path.join(root, "AGENT.md"), "utf8"),
    };
    const playbookDir = path.join(root, "playbook");
    for (const name of await fs.readdir(playbookDir)) {
      if (name.endsWith(".md")) {
        files[`playbook/${name}`] = await fs.readFile(path.join(playbookDir, name), "utf8");
      }
    }
    return NextResponse.json({ files });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to read playbook" },
      { status: 500 }
    );
  }
}
