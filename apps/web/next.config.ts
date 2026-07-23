import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";
import path from "node:path";

// Next.js only auto-loads .env files from this app's own directory. This is
// a monorepo, and the seed script (packages/exam-profiles/toeic) reads from
// a single repo-root .env — load that same file here too so one .env covers
// both, instead of asking the user to duplicate secrets into two places.
// apps/web/.env.local still works and takes precedence if present.
loadEnv({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
