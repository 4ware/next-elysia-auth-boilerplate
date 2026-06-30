import { test as base, expect } from "@playwright/test";
import { LoginPage, RegisterPage, DashboardPage } from "./pages";
import path from "path";

export { expect };

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
};

/**
 * Extend the base Playwright test with page-object fixtures.
 * Usage:
 *   import { test, expect } from "../fixtures";
 *   test("my test", async ({ loginPage }) => { ... });
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

/** Authenticated test — reuses stored session state from auth.setup.ts */
export const authedTest = base.extend<Fixtures>({
  storageState: path.join(__dirname, ".auth/user.json"),
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});
