import { describe, it, expect, vi, beforeEach } from "vitest";
import { Elysia } from "elysia";
import { userRoutes } from "../user";

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockUser = {
  id: "user_test_123",
  name: "Jane Smith",
  email: "jane@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSession = {
  user: mockUser,
  session: { id: "session_123", userId: mockUser.id },
};

// ─── Hoisted mocks: vi.mock factories are hoisted above imports, so any
// variables they reference must be created via vi.hoisted() to avoid
// "Cannot access before initialization" errors. ──────────────────────────────
const { sessionState, mockDb } = vi.hoisted(() => ({
  sessionState: { current: null as unknown },
  mockDb: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    // where() is used at the end of the GET chain (select/from/where → resolves
    // to rows) AND in the middle of the PATCH chain (update/set/where/returning
    // → must stay chainable). mockReturnThis() makes it chainable by default;
    // GET tests override it per-case with mockResolvedValueOnce/mockResolvedValue
    // since awaiting a chainable object that has no `.then` will hang, so GET's
    // where() must specifically resolve, while PATCH's where() must return the
    // builder so `.returning()` can be called on it.
    where: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@myapp/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(() => Promise.resolve(sessionState.current)),
    },
  },
}));

vi.mock("@myapp/db", () => ({
  db: mockDb,
  users: {
    id: "id",
    name: "name",
    email: "email",
    updatedAt: "updated_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

// ─── Test app ─────────────────────────────────────────────────────────────────
function buildApp() {
  return new Elysia().use(userRoutes);
}

// ─── Reset only call history (mockClear), never implementations
// (mockReset/clearAllMocks) — clearing implementations wipes out the
// mockReturnThis() chains set up at mock-creation time above. ────────────────
function resetCallHistory() {
  Object.values(mockDb).forEach((fn) => fn.mockClear());
}

describe("GET /api/users/me", () => {
  beforeEach(() => {
    sessionState.current = mockSession;
    resetCallHistory();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    // GET's chain is select().from().where() — where() must resolve here,
    // unlike PATCH's chain where where() must stay chainable for .returning().
    mockDb.where.mockResolvedValue([mockUser]);
  });

  it("returns 401 when not authenticated", async () => {
    sessionState.current = null;
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", { method: "GET" })
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns the current user when authenticated", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", { method: "GET" })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(mockUser.id);
    expect(body.email).toBe(mockUser.email);
  });

  it("returns error when user not found in DB", async () => {
    mockDb.where.mockResolvedValue([]);
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", { method: "GET" })
    );
    const body = await res.json();
    expect(body.error).toBe("User not found");
  });
});

describe("PATCH /api/users/me", () => {
  beforeEach(() => {
    sessionState.current = mockSession;
    resetCallHistory();
    // PATCH's chain is update().set().where().returning() — where() must stay
    // chainable here so .returning() can be called on its result.
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.returning.mockResolvedValue([{ ...mockUser, name: "Updated Name" }]);
  });

  it("returns 401 when not authenticated", async () => {
    sessionState.current = null;
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Name" }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("updates and returns the user", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated Name");
  });

  it("returns 422 for empty name", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      })
    );
    expect(res.status).toBe(422);
  });

  it("returns 422 for missing body", async () => {
    const app = buildApp();
    const res = await app.handle(
      new Request("http://localhost/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(422);
  });
});
