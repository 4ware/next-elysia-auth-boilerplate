import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Framework-agnostic environment schema, validated once and shared across
 * every package that runs under Bun directly (not bundled by Next.js):
 * packages/db, packages/auth, packages/elysia, and the optional standalone
 * apps/api server.
 *
 * apps/web has its own schema (./nextjs.ts) using @t3-oss/env-nextjs, since
 * Next.js requires manual destructuring of NEXT_PUBLIC_* variables for them
 * to survive client-side bundling.
 *
 * Import `env` instead of reading `process.env` directly — this throws a
 * clear, descriptive error at startup if a required variable is missing or
 * malformed, instead of failing confusingly deep inside a third-party
 * library (e.g. better-auth, drizzle) at request time.
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

    // ─── Optional standalone apps/api server ──────────────────────────────
    PORT: z.coerce.number().int().positive().default(3001),

    // ─── Node/Bun runtime ──────────────────────────────────────────────────
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Makes it possible to test with a representative set of environment
   * variables without throwing errors on missing fields. Useful in CI for
   * non-Next.js packages where you don't necessarily have the full secret
   * set available (e.g. running `drizzle-kit generate` without OAuth creds).
   */
  emptyStringAsUndefined: true,

  runtimeEnv: process.env,

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
