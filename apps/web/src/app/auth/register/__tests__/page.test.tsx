import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@/test/render";
import RegisterPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: {
    email: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
}));

vi.mock("@/lib/auth-client", () => ({
  signUp: mockSignUp,
  signIn: { social: vi.fn() },
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.email.mockResolvedValue({ data: {}, error: null });
  });

  it("renders heading and all form fields", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: /create an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("shows validation error for short name", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "J");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    // Use fireEvent to bypass jsdom's native email constraint and let Zod validate
    const emailInput = screen.getByLabelText(/^email/i);
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    // Trigger submit via fireEvent to bypass browser native validation
    fireEvent.submit(emailInput.closest("form")!);
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for short password", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password/i), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when passwords do not match", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different123");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("calls signUp.email with valid data", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockSignUp.email).toHaveBeenCalledWith({
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        callbackURL: "/dashboard",
      });
    });
  });

  it("redirects to /auth/verify-email on success", async () => {
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/^email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/verify-email");
    });
  });

  it("shows error toast when email is taken", async () => {
    mockSignUp.email.mockResolvedValue({ error: { message: "Email already in use" } });
    const { toast } = await import("sonner");
    const { user } = render(<RegisterPage />);
    await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
    await user.type(screen.getByLabelText(/^email/i), "taken@example.com");
    await user.type(screen.getByLabelText(/^password/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email already in use");
    });
  });

  it("has a link to the login page", () => {
    render(<RegisterPage />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/auth/login");
  });
});
