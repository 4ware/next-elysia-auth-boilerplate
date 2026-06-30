import { app } from "@myapp/elysia";

/**
 * Mounts the shared Elysia app directly inside the Next.js App Router.
 *
 * The `[[...slugs]]` optional catch-all matches every path under /api,
 * including /api itself, and hands the raw Request straight to Elysia's
 * `.handle()`. No extra fetch/proxy hop — this runs in the same process
 * as the rest of the Next.js app.
 *
 * Elysia owns: /api/auth/*, /api/users/*, /api/health, /api/swagger
 */
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle;
export const OPTIONS = app.handle;
export const HEAD = app.handle;
