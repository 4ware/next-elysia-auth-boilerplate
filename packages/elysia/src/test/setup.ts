import { vi, beforeAll, afterAll } from "vitest";

// ─── Env vars for tests ───────────────────────────────────────────────────────
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret-32-chars-minimum-here";
process.env.BETTER_AUTH_URL = "http://localhost:3001";
process.env.WEB_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-google-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
process.env.APPLE_CLIENT_ID = "test-apple-id";
process.env.APPLE_CLIENT_SECRET = "test-apple-secret";
process.env.WEBAUTHN_RP_ID = "localhost";
process.env.WEBAUTHN_RP_NAME = "Test App";
process.env.WEBAUTHN_ORIGIN = "http://localhost:3000";

// ─── Mock DB so tests don't need a real Postgres connection ──────────────────
vi.mock("@myapp/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
  users: { id: "id", name: "name", email: "email", updatedAt: "updated_at" },
  sessions: {},
  accounts: {},
  verifications: {},
  passkeys: {},
}));

// ─── Mock better-auth ────────────────────────────────────────────────────────
vi.mock("@myapp/auth", () => ({
  auth: {
    handler: vi.fn(),
    api: {
      getSession: vi.fn().mockResolvedValue(null),
    },
  },
}));
