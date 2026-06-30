import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 * Tests live in the e2e/ directory at the monorepo root.
 *
 * Prerequisites: both apps must be running (or use webServer below).
 * Run: bun test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "e2e/reports/html", open: "never" }],
  ],
  use: {
    baseURL: process.env.WEB_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // ─── Setup: global auth state ──────────────────────────────────────────
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // ─── Desktop browsers ──────────────────────────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      dependencies: ["setup"],
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      dependencies: ["setup"],
    },

    // ─── Mobile browsers ───────────────────────────────────────────────────
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
    },
  ],

  // ─── Start the app automatically in CI / local dev ─────────────────────────
  // Elysia is mounted in-process inside Next.js, so a single server covers
  // both the UI and the /api/* routes — no separate API process needed.
  webServer: {
    command: "bun --cwd apps/web dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
