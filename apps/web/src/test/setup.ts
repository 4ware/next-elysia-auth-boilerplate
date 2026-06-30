import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "./msw/server";

// ─── Env vars for @myapp/env/nextjs ───────────────────────────────────────────
// auth-client.ts and lib/api.ts import the validated env schema, which
// requires these server-side vars to be present even though the test
// environment never actually starts the Next.js server. Without these,
// createEnv() throws at import time before any test can run.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET ??= "test-secret-32-chars-minimum-here";

// ─── MSW server lifecycle ────────────────────────────────────────────────────
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// ─── Mock Next.js router ─────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock next/font (not available in jsdom) ─────────────────────────────────
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "inter" }),
}));

// ─── Mock sonner toast ───────────────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// ─── Silence console.error for expected React warnings in tests ───────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = String(args[0]);
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(") ||
      msg.includes("Not implemented")
    )
      return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
