import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Next.js-specific environment schema for apps/web.
 *
 * Unlike packages/env/src/core.ts (used by Bun-run packages), this uses
 * @t3-oss/env-nextjs because Next.js bundles client-side code differently:
 * only NEXT_PUBLIC_* variables that are explicitly destructured here survive
 * into the client bundle. Reading process.env.NEXT_PUBLIC_X dynamically
 * elsewhere in client code will NOT work — webpack/turbopack statically
 * replaces only direct, destructured references at build time.
 *
 * The `server` block mirrors packages/env/src/core.ts's schema, since the
 * in-process Elysia app (mounted at app/api/[[...slugs]]) and better-auth
 * both run inside the Next.js server process and need the same variables.
 */
export const env = createEnv({
  server: {
    // ─── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: z.string().url(),

    // ─── better-auth ───────────────────────────────────────────────────────
    BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

    // ─── Google OAuth ──────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

    // ─── Apple OAuth ───────────────────────────────────────────────────────
    APPLE_CLIENT_ID: z.string().min(1).optional(),
    APPLE_CLIENT_SECRET: z.string().min(1).optional(),

    // ─── WebAuthn / Passkeys ───────────────────────────────────────────────
    WEBAUTHN_RP_ID: z.string().min(1).default("localhost"),
    WEBAUTHN_RP_NAME: z.string().min(1).default("MyApp"),
    WEBAUTHN_ORIGIN: z.string().url().default("http://localhost:3000"),

    // ─── App URLs ──────────────────────────────────────────────────────────
    WEB_URL: z.string().url().default("http://localhost:3000"),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    /**
     * Only needed when the web app points at the standalone apps/api
     * deployment instead of the in-process Elysia mount. Optional —
     * undefined means same-origin relative paths (the default).
     */
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
  },

  /**
   * Next.js >= 13.4.4 only needs client vars destructured here; server vars
   * are inferred automatically from process.env at build/runtime.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  emptyStringAsUndefined: true,

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
