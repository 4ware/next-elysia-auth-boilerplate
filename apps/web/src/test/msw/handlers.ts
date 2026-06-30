import { http, HttpResponse } from "msw";

const API = "http://localhost:3001";

// ─── Fixtures ────────────────────────────────────────────────────────────────
export const mockUser = {
  id: "user_test_123",
  name: "Jane Smith",
  email: "jane@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSession = {
  user: mockUser,
  session: {
    id: "session_test_123",
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    token: "test-token",
  },
};

// ─── Handlers ────────────────────────────────────────────────────────────────
export const handlers = [
  // better-auth: get session
  http.get(`${API}/api/auth/get-session`, () =>
    HttpResponse.json(mockSession)
  ),

  // better-auth: sign in with email
  http.post(`${API}/api/auth/sign-in/email`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "wrong@example.com") {
      return HttpResponse.json(
        { error: { message: "Invalid credentials" } },
        { status: 401 }
      );
    }
    return HttpResponse.json(mockSession);
  }),

  // better-auth: sign up
  http.post(`${API}/api/auth/sign-up/email`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        { error: { message: "Email already in use" } },
        { status: 400 }
      );
    }
    return HttpResponse.json({ user: { ...mockUser, email: body.email } });
  }),

  // better-auth: sign out
  http.post(`${API}/api/auth/sign-out`, () =>
    HttpResponse.json({ success: true })
  ),

  // better-auth: send verification email
  http.post(`${API}/api/auth/send-verification-email`, () =>
    HttpResponse.json({ success: true })
  ),

  // API: get current user
  http.get(`${API}/api/users/me`, () => HttpResponse.json(mockUser)),

  // API: update current user
  http.patch(`${API}/api/users/me`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>;
    return HttpResponse.json({ ...mockUser, name: body.name });
  }),

  // Health check
  http.get(`${API}/health`, () =>
    HttpResponse.json({ status: "ok", timestamp: new Date().toISOString() })
  ),
];

// ─── Handler overrides for specific test scenarios ────────────────────────────
export const unauthenticatedHandlers = [
  http.get(`${API}/api/auth/get-session`, () => HttpResponse.json(null)),
  http.get(`${API}/api/users/me`, () =>
    HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
  ),
];

export const serverErrorHandlers = [
  http.post(`${API}/api/auth/sign-in/email`, () =>
    HttpResponse.json({ error: "Internal Server Error" }, { status: 500 })
  ),
];
