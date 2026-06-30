import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Wrapper with any global providers ───────────────────────────────────────
function AllProviders({ children }: { children: React.ReactNode }) {
  // Add context providers here as your app grows (ThemeProvider, etc.)
  return <>{children}</>;
}

// ─── Custom render ────────────────────────────────────────────────────────────
function customRender(ui: React.ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// Re-export everything from RTL so tests only need one import
export * from "@testing-library/react";
export { customRender as render };
