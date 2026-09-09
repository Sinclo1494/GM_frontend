import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import Login from "../../pages/Login";

// Mock loginUser
vi.mock("../../api/auth", () => ({
  loginUser: vi.fn(),
}));

// Mock userService
vi.mock("../../api/userService", () => ({
  getUserPreferences: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Mock useAuth
vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock components
vi.mock("../../theme/components", () => ({
  components: {
    loginCard: "login-card",
    loginButton: "login-button",
    input: "login-input",
    label: "login-label",
  },
}));

describe("Login", () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<Login />);
    expect(screen.getByText("GM Groupe")).toBeTruthy();
  });

  it("displays username and password fields", () => {
    render(<Login />);
    expect(screen.getByPlaceholderText("Enter your username")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();
  });

  it("displays the login button", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /login/i })).toBeTruthy();
  });

  it("updates input values on change", () => {
    render(<Login />);
    const usernameInput = screen.getByPlaceholderText("Enter your username") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("Enter your password") as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("testpass");
  });

  it("shows error on failed login", async () => {
    const { loginUser } = await import("../../api/auth");
    vi.mocked(loginUser).mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), { target: { value: "bad" } });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeTruthy();
    });
  });
});
