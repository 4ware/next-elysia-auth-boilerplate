import { test, expect, authedTest } from "../fixtures";

// ─── Login ─────────────────────────────────────────────────────────────────────
test.describe("Login flow", () => {
  test("renders the login page correctly", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.googleButton).toBeVisible();
    await expect(loginPage.appleButton).toBeVisible();
    await expect(loginPage.passkeyButton).toBeVisible();
  });

  test("shows validation errors for empty form submission", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.submitButton.click();
    await expect(loginPage.page.getByText(/invalid email/i)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("wrong@example.com", "wrongpassword");
    // Toast or inline error from better-auth
    await expect(
      loginPage.page.getByText(/invalid|incorrect|not found/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("navigates to register page via link", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.registerLink.click();
    await expect(loginPage.page).toHaveURL("/auth/register");
  });

  test("successful login redirects to dashboard", async ({
    loginPage,
    page,
  }) => {
    const email = process.env.TEST_USER_EMAIL ?? "e2e@example.com";
    const password = process.env.TEST_USER_PASSWORD ?? "password123";

    await loginPage.goto();
    await loginPage.login(email, password);
    await page.waitForURL("/dashboard", { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });
});

// ─── Registration ──────────────────────────────────────────────────────────────
test.describe("Registration flow", () => {
  test("renders the register page correctly", async ({ registerPage }) => {
    await registerPage.goto();
    await expect(registerPage.heading).toBeVisible();
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
  });

  test("shows name validation error for single character", async ({
    registerPage,
  }) => {
    await registerPage.goto();
    await registerPage.nameInput.fill("J");
    await registerPage.submitButton.click();
    await expect(
      registerPage.page.getByText(/at least 2 characters/i)
    ).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register({
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "different456",
    });
    await expect(
      registerPage.page.getByText(/passwords do not match/i)
    ).toBeVisible();
  });

  test("navigates to login page via link", async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.loginLink.click();
    await expect(registerPage.page).toHaveURL("/auth/login");
  });

  test("successful registration navigates to verify-email", async ({
    registerPage,
    page,
  }) => {
    // Use a unique email to avoid conflicts on repeat runs
    const uniqueEmail = `test+${Date.now()}@example.com`;
    await registerPage.goto();
    await registerPage.register({
      name: "New User",
      email: uniqueEmail,
      password: "securePass123",
    });
    await page.waitForURL("/auth/verify-email", { timeout: 10_000 });
    await expect(page.getByText(/check your inbox/i)).toBeVisible();
  });
});

// ─── Authenticated flows ───────────────────────────────────────────────────────
authedTest.describe("Authenticated: Dashboard", () => {
  authedTest("renders the dashboard with user info", async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.signOutButton).toBeVisible();
  });

  authedTest("unauthenticated visit redirects to login", async ({ page }) => {
    // Clear storage to simulate logged-out state
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await page.waitForURL("/auth/login", { timeout: 5_000 });
  });

  authedTest("sign out redirects to home", async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    await dashboardPage.signOut();
    await expect(page).toHaveURL("/");
  });
});
