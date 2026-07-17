import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship the editorial playbook with the serverless bundle so /api/playbook
  // can serve it to the daily agent at runtime.
  outputFileTracingIncludes: {
    "/api/playbook": ["./AGENT.md", "./playbook/**/*"],
  },
};

export default nextConfig;
