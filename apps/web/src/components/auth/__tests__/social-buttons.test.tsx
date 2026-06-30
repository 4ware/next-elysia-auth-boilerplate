import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/render";
import { GoogleButton, AppleButton, PasskeyButton } from "../social-buttons";

const { mockSignIn, mockAuthClient } = vi.hoisted(() => ({
  mockSignIn: {
    social: vi.fn().mockResolvedValue({ data: {}, error: null }),
    passkey: vi.fn().mockResolvedValue({ data: {}, error: null }),
  },
  mockAuthClient: {
    signIn: { passkey: vi.fn().mockResolvedValue({ data: {}, error: null }) },
    passkey: {
      addPasskey: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

vi.mock("@/lib/auth-client", () => ({
  signIn: mockSignIn,
  authClient: mockAuthClient,
}));

describe("GoogleButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with Google label", () => {
    render(<GoogleButton />);
    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
  });

  it("calls signIn.social with google provider on click", async () => {
    const { user } = render(<GoogleButton />);
    await user.click(screen.getByRole("button", { name: /google/i }));
    expect(mockSignIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard",
    });
  });
});

describe("AppleButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with Apple label", () => {
    render(<AppleButton />);
    expect(screen.getByRole("button", { name: /apple/i })).toBeInTheDocument();
  });

  it("calls signIn.social with apple provider on click", async () => {
    const { user } = render(<AppleButton />);
    await user.click(screen.getByRole("button", { name: /apple/i }));
    expect(mockSignIn.social).toHaveBeenCalledWith({
      provider: "apple",
      callbackURL: "/dashboard",
    });
  });
});

describe("PasskeyButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders sign-in mode label", () => {
    render(<PasskeyButton mode="sign-in" />);
    expect(screen.getByRole("button", { name: /sign in with passkey/i })).toBeInTheDocument();
  });

  it("renders register mode label", () => {
    render(<PasskeyButton mode="register" />);
    expect(screen.getByRole("button", { name: /add passkey/i })).toBeInTheDocument();
  });

  it("calls authClient.signIn.passkey in sign-in mode", async () => {
    const { user } = render(<PasskeyButton mode="sign-in" />);
    await user.click(screen.getByRole("button"));
    expect(mockAuthClient.signIn.passkey).toHaveBeenCalled();
  });

  it("calls authClient.passkey.addPasskey in register mode", async () => {
    const { user } = render(<PasskeyButton mode="register" />);
    await user.click(screen.getByRole("button"));
    expect(mockAuthClient.passkey.addPasskey).toHaveBeenCalled();
  });
});
