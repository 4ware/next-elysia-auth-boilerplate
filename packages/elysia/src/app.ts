import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "@myapp/env/core";
import { auth } from "@myapp/auth";
import { userRoutes } from "./routes/user";

/**
 * Shared Elysia app definition.
 *
 * This does NOT call `.listen()` — it's reused in two places:
 *   1. apps/web — mounted directly inside Next.js via an App Router
 *      catch-all route handler (apps/web/src/app/api/[[...slugs]]/route.ts).
 *      No separate process, no CORS needed, runs on the Next.js server.
 *   2. apps/api — wraps this same app with `.listen()` for a standalone
 *      Bun/Elysia deployment (useful for horizontal scaling the API
 *      independently of the Next.js app).
 *
 * Routes are prefixed with /api so they sit naturally under Next.js's
 * app/api directory without any path rewriting.
 */
export const app = new Elysia()
  // ─── Swagger / OpenAPI docs ────────────────────────────────────────────────
  .use(
    swagger({
      path: "/api/swagger",
      documentation: {
        info: { title: "MyApp API", version: "1.0.0" },
      },
    })
  )

  // ─── CORS ───────────────────────────────────────────────────────────────────
  // Only strictly required when the API is served from a different origin
  // than the web app (i.e. the standalone apps/api deployment). Mounted
  // in-process inside Next.js, requests are same-origin and this is a no-op.
  .use(
    cors({
      origin: env.WEB_URL,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  )

  // ─── better-auth handler (all /api/auth/* routes) ────────────────────────
  .all("/api/auth/*", async ({ request }) => auth.handler(request))

  // ─── Application routes ───────────────────────────────────────────────────
  .use(userRoutes)

  // ─── Health check ─────────────────────────────────────────────────────────
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

export type App = typeof app;
