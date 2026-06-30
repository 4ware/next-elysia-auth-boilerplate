import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts, last wins", () => {
    // tailwind-merge: p-4 overrides p-2
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles object syntax via clsx", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
