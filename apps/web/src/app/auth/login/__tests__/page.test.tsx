import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/render";
import LoginPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const { mockSignIn } = vi.hoisted(() => ({
  mockSignIn: {
    email: vi.fn().mockResolvedValue({ data: {}, error: null }),
    social: vi.fn().mockResolvedValue({ data: {}, error: null }),
    passkey: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: mockSignIn,
  authClient: {
    passkey: { addPasskey: vi.fn() },
    signIn: { passkey: vi.fn() },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.email.mockResolvedValue({ data: {}, error: null });
  });

  it("renders heading and form fields", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in$/i })).toBeInTheDocument();
  });

  it("renders social auth buttons", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apple/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /passkey/i })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const { user } = render(<LoginPage />);
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows email validation error for invalid email", async () => {
    const { user } = render(<LoginPage />);
    
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("calls signIn.email with credentials on submit", async () => {
    const { user } = render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(mockSignIn.email).toHaveBeenCalledWith({
        email: "jane@example.com",
        password: "password123",
        callbackURL: "/dashboard",
      });
    });
  });

  it("redirects to /dashboard on success", async () => {
    const { user } = render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows error toast on invalid credentials", async () => {
    mockSignIn.email.mockResolvedValue({ error: { message: "Invalid credentials" } });
    const { toast } = await import("sonner");
    const { user } = render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "wrong@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("shows error toast on unexpected error", async () => {
    mockSignIn.email.mockRejectedValue(new Error("Network error"));
    const { toast } = await import("sonner");
    const { user } = render(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in$/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
    });
  });

  it("has link to register page", () => {
    render(<LoginPage />);
    const link = screen.getByRole("link", { name: /sign up/i });
    expect(link).toHaveAttribute("href", "/auth/register");
  });
});
