#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const label = "com.content-central.quick-post";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agentDir = path.join(os.homedir(), "Library", "LaunchAgents");
const plistPath = path.join(agentDir, `${label}.plist`);
const serverPath = path.join(repoRoot, "scripts", "quick-post-server.mjs");
const target = `gui/${process.getuid()}`;

const xml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(process.execPath)}</string>
    <string>${xml(serverPath)}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xml(repoRoot)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>${xml(`${path.dirname(process.execPath)}:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin`)}</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/content-central-quick-post.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/content-central-quick-post.log</string>
</dict>
</plist>
`;

mkdirSync(agentDir, { recursive: true });
writeFileSync(plistPath, plist, "utf8");
try {
  execFileSync("/bin/launchctl", ["bootout", target, plistPath], { stdio: "ignore" });
} catch {
  // Not loaded yet.
}
execFileSync("/bin/launchctl", ["bootstrap", target, plistPath]);
execFileSync("/bin/launchctl", ["kickstart", "-k", `${target}/${label}`]);
console.log(`Installed ${label} on http://127.0.0.1:47833.`);
console.log("The companion can fill composers and attach images, but it never clicks Publish/Post/Share.");
console.log("Log: /tmp/content-central-quick-post.log");
