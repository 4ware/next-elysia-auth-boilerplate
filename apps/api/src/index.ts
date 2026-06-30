import { env } from "@myapp/env/core";
import { app } from "@myapp/elysia";

/**
 * Standalone Elysia server entrypoint.
 *
 * This is an OPTIONAL deployment target: the same `app` from
 * @myapp/elysia is mounted directly inside Next.js
 * (apps/web/src/app/api/[[...slugs]]/route.ts) and that is sufficient
 * for most setups. Run this separately only if you want to scale the
 * API independently of the Next.js app (e.g. behind its own load
 * balancer, on its own infra, or consumed by non-web clients).
 */
const server = app.listen(env.PORT);

console.log(
  `🦊 Standalone API running at http://${server.server?.hostname}:${server.server?.port}`
);

export type App = typeof app;
