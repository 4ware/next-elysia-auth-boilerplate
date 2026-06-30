import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/render";
import { mockUser, mockSession } from "@/test/msw/handlers";
import DashboardPage from "../page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const { mockUseSession, mockSignOut, mockAuthClient } = vi.hoisted(() => ({
  mockUseSession: vi.fn(),
  mockSignOut: vi.fn().mockResolvedValue({}),
  mockAuthClient: {
    passkey: {
      listUserPasskeys: vi.fn().mockResolvedValue({ data: [], error: null }),
      addPasskey: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    signIn: { passkey: vi.fn() },
  },
}));

vi.mock("@/lib/auth-client", () => ({
  useSession: mockUseSession,
  signOut: mockSignOut,
  authClient: mockAuthClient,
}));

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows loading spinner while session is pending", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true });
    render(<DashboardPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("redirects to /auth/login when not authenticated", async () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false });
    render(<DashboardPage />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  it("renders user profile when authenticated", () => {
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    render(<DashboardPage />);
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  it("renders email verified status", () => {
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    render(<DashboardPage />);
    expect(screen.getByText(/✅ yes/i)).toBeInTheDocument();
  });

  it("renders unverified status for unverified email", () => {
    const unverifiedSession = { ...mockSession, user: { ...mockUser, emailVerified: false } };
    mockUseSession.mockReturnValue({ data: unverifiedSession, isPending: false });
    render(<DashboardPage />);
    expect(screen.getByText(/❌ no/i)).toBeInTheDocument();
  });

  it("calls signOut on button click", async () => {
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    const { user } = render(<DashboardPage />);
    await user.click(screen.getByRole("button", { name: /sign out/i }));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("shows passkey count when checking passkeys", async () => {
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    const { toast } = await import("sonner");
    const { user } = render(<DashboardPage />);
    await user.click(screen.getByRole("button", { name: /check registered passkeys/i }));
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("You have 0 passkey(s) registered");
    });
  });

  it("shows passkey count with existing passkeys", async () => {
    mockUseSession.mockReturnValue({ data: mockSession, isPending: false });
    mockAuthClient.passkey.listUserPasskeys.mockResolvedValue({ data: [{ id: "pk1" }, { id: "pk2" }] });
    const { toast } = await import("sonner");
    const { user } = render(<DashboardPage />);
    await user.click(screen.getByRole("button", { name: /check registered passkeys/i }));
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("You have 2 passkey(s) registered");
    });
  });
});
