import { type Page, type Locator, expect } from "@playwright/test";

// ─── Base Page ────────────────────────────────────────────────────────────────
export class BasePage {
  constructor(protected page: Page) {}

  async waitForToast(text: string | RegExp) {
    await expect(
      this.page.locator("[data-sonner-toast]").filter({ hasText: text })
    ).toBeVisible({ timeout: 5000 });
  }
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly googleButton: Locator;
  readonly appleButton: Locator;
  readonly passkeyButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /welcome back/i });
    this.emailInput = page.getByLabel(/email/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.submitButton = page.getByRole("button", { name: /sign in$/i });
    this.googleButton = page.getByRole("button", { name: /google/i });
    this.appleButton = page.getByRole("button", { name: /apple/i });
    this.passkeyButton = page.getByRole("button", { name: /passkey/i });
    this.registerLink = page.getByRole("link", { name: /sign up/i });
  }

  async goto() {
    await this.page.goto("/auth/login");
    await expect(this.heading).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// ─── Register Page ────────────────────────────────────────────────────────────
export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /create an account/i });
    this.nameInput = page.getByLabel(/full name/i);
    this.emailInput = page.getByLabel(/^email/i);
    this.passwordInput = page.getByLabel(/^password/i);
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole("button", { name: /create account/i });
    this.loginLink = page.getByRole("link", { name: /sign in/i });
  }

  async goto() {
    await this.page.goto("/auth/register");
    await expect(this.heading).toBeVisible();
  }

  async register(opts: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    await this.nameInput.fill(opts.name);
    await this.emailInput.fill(opts.email);
    await this.passwordInput.fill(opts.password);
    await this.confirmPasswordInput.fill(opts.confirmPassword ?? opts.password);
    await this.submitButton.click();
  }
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly signOutButton: Locator;
  readonly addPasskeyButton: Locator;
  readonly checkPasskeysButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: /dashboard/i });
    this.signOutButton = page.getByRole("button", { name: /sign out/i });
    this.addPasskeyButton = page.getByRole("button", { name: /add passkey/i });
    this.checkPasskeysButton = page.getByRole("button", {
      name: /check registered passkeys/i,
    });
  }

  async goto() {
    await this.page.goto("/dashboard");
    await expect(this.heading).toBeVisible();
  }

  async signOut() {
    await this.signOutButton.click();
    await this.page.waitForURL("/");
  }
}
