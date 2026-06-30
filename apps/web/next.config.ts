import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Next.js only auto-loads .env* files from its own app directory (apps/web),
// but this monorepo keeps a single shared .env at the repo root (alongside
// packages/db, packages/auth, and the optional standalone apps/api server).
// Load it explicitly here so DATABASE_URL, BETTER_AUTH_SECRET, etc. are
// available to the in-process Elysia app mounted at app/api/[[...slugs]].
config({ path: resolve(__dirname, "../../.env") });

// Validate environment variables at build/config-load time, per t3-env's
// recommended pattern. This makes a missing or malformed env var fail fast
// with a clear Zod error instead of surfacing confusingly deep inside
// better-auth, Drizzle, or the Elysia app at request time.
//
// IMPORTANT: this must run via require(), not a static `import`. ES module
// static imports are hoisted above all other top-level code regardless of
// where they're written, so they'd run BEFORE dotenv.config() above and
// validate against an empty process.env. A dynamic `import()` would dodge
// hoisting but needs top-level await, which Next.js's CJS-transpiled config
// loader (next-config-ts/transpile-config.js) can't execute — it throws
// ERR_REQUIRE_ASYNC_MODULE. require() is the one option that's both
// synchronous and NOT hoisted, so it runs exactly where it's written.
require("@myapp/env/nextjs");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@myapp/db",
    "@myapp/auth",
    "@myapp/elysia",
    "@myapp/env",
    "@better-auth/passkey",
  ],
  experimental: {
    serverComponentsHmrCache: true,
  },
};

export default nextConfig;
