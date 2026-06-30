import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { env } from "@myapp/env/nextjs";

// Elysia is mounted in-process inside Next.js (apps/web/src/app/api/[[...slugs]]),
// so auth lives at a relative /api/auth path by default — same-origin, no CORS.
// Set NEXT_PUBLIC_API_URL only if pointing at the standalone apps/api deployment.
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL ?? "",
  plugins: [passkeyClient()],
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;

