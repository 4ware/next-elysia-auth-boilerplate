import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "@better-auth/passkey";
import { env } from "@myapp/env/core";
import { db } from "@myapp/db";
import * as schema from "@myapp/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  // better-auth runs in-process inside Next.js by default (mounted via Elysia
  // at /api/auth/*), so its base URL is the web app's own origin. Override
  // only if you're running the standalone apps/api server instead.
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  // ─── Email & Password ──────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },

  // ─── Social Providers ──────────────────────────────────────────────────
  // Google/Apple credentials are optional in the env schema (dev environments
  // may not have OAuth configured yet), so only register providers whose
  // credentials are actually present rather than passing undefined values.
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(env.APPLE_CLIENT_ID && env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: env.APPLE_CLIENT_ID,
            clientSecret: env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // ─── Plugins ───────────────────────────────────────────────────────────
  plugins: [
    passkey({
      rpID: env.WEBAUTHN_RP_ID,
      rpName: env.WEBAUTHN_RP_NAME,
      origin: env.WEBAUTHN_ORIGIN,
    }),
  ],

  // ─── Trusted Origins ───────────────────────────────────────────────────
  trustedOrigins: [env.WEB_URL],
});

export type Auth = typeof auth;
