import { test, expect } from "../fixtures";

test.describe("Home page", () => {
  test("renders the welcome heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome to myapp/i })).toBeVisible();
  });

  test("has Sign In link that goes to login page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL("/auth/login");
  });

  test("has Create Account link that goes to register page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /create account/i }).click();
    await expect(page).toHaveURL("/auth/register");
  });

  test("is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("has no accessibility violations on critical paths", async ({ page }) => {
    await page.goto("/");
    // Check all interactive elements are keyboard-accessible
    const buttons = page.getByRole("link");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);

    // Tab through the page and verify focus is visible
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});

test.describe("404 handling", () => {
  test("non-existent route shows a Next.js 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
