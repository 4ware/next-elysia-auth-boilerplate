import { treaty } from "@elysiajs/eden";
import type { App } from "@myapp/elysia";
import { env } from "@myapp/env/nextjs";

/**
 * Typed Eden Treaty client for the in-process Elysia API.
 * Since Elysia is mounted at apps/web/src/app/api/[[...slugs]], requests
 * are same-origin by default — only override the base URL when targeting
 * the standalone apps/api deployment.
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const { data, error } = await api.api.users.me.get();
 */
export const api = treaty<App>(env.NEXT_PUBLIC_API_URL ?? "", {
  fetch: { credentials: "include" },
});

/** Lightweight fallback fetch wrapper for ad-hoc calls outside Eden's typed surface. */
const BASE = env.NEXT_PUBLIC_API_URL ?? "";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
