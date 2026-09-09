import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthProvider";
import { useAuth } from "../../context/useAuth";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: {} },
  },
}));

const ME_URL = "http://localhost:8000/api/users/me/";

function AuthProbe() {
  const { token, user, login, logout, setUser } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? "none"}</span>
      <span data-testid="user">{user ? user.username : "none"}</span>
      <span data-testid="superuser">{user ? String(user.is_superuser) : "none"}</span>
      <button data-testid="login-btn" onClick={() => login("access", "refresh")}>
        login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>logout</button>
      <button
        data-testid="setuser-btn"
        onClick={() => setUser({ id: 99, username: "injected", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: [] })}
      >
        setuser
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    (axios.get as any).mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("initializes token from localStorage on mount", () => {
    localStorage.setItem("token", "persisted-token");
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByTestId("token").textContent).toBe("persisted-token");
  });

  it("starts with no token when localStorage is empty", () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByTestId("token").textContent).toBe("none");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("login() persists tokens to localStorage, sets token state and loads the current user", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        id: 1,
        username: "alice",
        first_name: "A",
        last_name: "L",
        email: "a@b.c",
        is_active: true,
        is_superuser: false,
        permissions: ["gestion.entreprises"],
      },
    });

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await act(async () => {
      fireEvent.click(screen.getByTestId("login-btn"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("access");
      expect(screen.getByTestId("user").textContent).toBe("alice");
    });

    expect(localStorage.getItem("token")).toBe("access");
    expect(localStorage.getItem("refresh")).toBe("refresh");
    expect((axios.get as any)).toHaveBeenCalledWith(ME_URL, expect.objectContaining({ headers: { Authorization: "Bearer access" } }));
  });

  it("logout() clears localStorage token/refresh and resets state", async () => {
    localStorage.setItem("token", "old-access");
    localStorage.setItem("refresh", "old-refresh");
    // On mount, with a token present, AuthProvider will try getCurrentUser.
    const user = { id: 1, username: "bob", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: [] };
    (axios.get as any).mockResolvedValue({ data: user });

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("bob"));

    act(() => {
      fireEvent.click(screen.getByTestId("logout-btn"));
    });

    expect(screen.getByTestId("token").textContent).toBe("none");
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("refresh")).toBeNull();
  });

  it("setUser() replaces the in-memory user without touching tokens", async () => {
    localStorage.setItem("token", "access");
    (axios.get as any).mockResolvedValue({ data: { id: 1, username: "orig", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: [] } });

    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("orig"));

    act(() => {
      fireEvent.click(screen.getByTestId("setuser-btn"));
    });

    expect(screen.getByTestId("user").textContent).toBe("injected");
    expect(screen.getByTestId("token").textContent).toBe("access");
    // token persists in localStorage
    expect(localStorage.getItem("token")).toBe("access");
  });

  it("sets user to null when getCurrentUser fails on mount", async () => {
    localStorage.setItem("token", "bad-token");
    (axios.get as any).mockRejectedValue(new Error("401 Unauthorized"));

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await waitFor(() => {
      expect(screen.getByTestId("user").textContent).toBe("none");
      expect(screen.getByTestId("token").textContent).toBe("bad-token");
    });
  });

  it("login() still sets the token even if getCurrentUser fails", async () => {
    (axios.get as any).mockRejectedValue(new Error("network"));

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    await act(async () => {
      fireEvent.click(screen.getByTestId("login-btn"));
    });

    // Token is persisted/state-set regardless of user fetch failure.
    expect(screen.getByTestId("token").textContent).toBe("access");
    expect(localStorage.getItem("token")).toBe("access");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });
});
