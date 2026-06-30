import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/render";
import { Input } from "../input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
  });

  it("renders password type", () => {
    render(<Input type="password" data-testid="pw" />);
    expect(screen.getByTestId("pw")).toHaveAttribute("type", "password");
  });

  it("accepts user input", async () => {
    const { user } = render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello world");
    expect(input).toHaveValue("hello world");
  });

  it("fires onChange with the correct value", async () => {
    const onChange = vi.fn();
    const { user } = render(<Input onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].target.value).toBe("a");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("merges custom className", () => {
    render(<Input className="custom" />);
    expect(screen.getByRole("textbox")).toHaveClass("custom");
  });
});
