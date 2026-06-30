/**
 * Global setup: creates an authenticated browser state saved to disk.
 * Other tests can opt-in via `storageState` to skip the login flow.
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";

export const STORAGE_STATE = path.join(__dirname, "../e2e/.auth/user.json");

setup("authenticate as test user", async ({ page }) => {
  // Use an E2E-specific test account seeded in the DB.
  // Set TEST_USER_EMAIL and TEST_USER_PASSWORD in your .env.
  const email = process.env.TEST_USER_EMAIL ?? "e2e@example.com";
  const password = process.env.TEST_USER_PASSWORD ?? "password123";

  await page.goto("/auth/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in$/i }).click();

  // Wait for redirect to dashboard
  await page.waitForURL("/dashboard");
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: STORAGE_STATE });
});
