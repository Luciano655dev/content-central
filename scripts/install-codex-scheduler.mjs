#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const label = "com.content-central.codex-runner";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agentDir = path.join(os.homedir(), "Library", "LaunchAgents");
const plistPath = path.join(agentDir, `${label}.plist`);
const runnerPath = path.join(repoRoot, "scripts", "codex-runner.mjs");
const envPath = path.join(repoRoot, ".vercel", ".env.production.local");
const codexPath = execFileSync("/usr/bin/which", ["codex"], { encoding: "utf8" }).trim();
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
    <string>--env-file=${xml(envPath)}</string>
    <string>${xml(runnerPath)}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xml(repoRoot)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>CODEX_BIN</key>
    <string>${xml(codexPath)}</string>
  </dict>
  <key>StartInterval</key>
  <integer>300</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/content-central-codex-runner.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/content-central-codex-runner.log</string>
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
console.log(`Installed ${label}; checking for work every 5 minutes.`);
console.log("Log: /tmp/content-central-codex-runner.log");
