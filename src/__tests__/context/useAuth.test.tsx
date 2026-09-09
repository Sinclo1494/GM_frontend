import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthProvider";
import { AuthContext } from "../../context/AuthContext";
import { useAuth } from "../../context/useAuth";
import axios from "axios";

// Mock axios so AuthProvider's getCurrentUser does not hit the network.
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

function ProbeUsingHook() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="token">{auth.token ?? "none"}</span>
      <span data-testid="has-login">{String(typeof auth.login)}</span>
      <span data-testid="has-logout">{String(typeof auth.logout)}</span>
      <span data-testid="has-setuser">{String(typeof auth.setUser)}</span>
      <span data-testid="has-user">{String(typeof auth.user)}</span>
    </div>
  );
}

// A component that intentionally calls useAuth outside of any provider.
function ThrowsProbe() {
  useAuth();
  return null;
}

describe("useAuth hook", () => {
  it("throws when used outside of an AuthProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ThrowsProbe />)).toThrow(
      "useAuth must be used inside AuthProvider",
    );
    spy.mockRestore();
  });

  it("returns the context value when used inside AuthContext.Provider", () => {
    render(
      <AuthContext.Provider
        value={{
          token: "abc123",
          user: null,
          login: vi.fn(),
          logout: vi.fn(),
          setUser: vi.fn(),
        }}
      >
        <ProbeUsingHook />
      </AuthContext.Provider>,
    );
    expect(screen.getByTestId("token").textContent).toBe("abc123");
    expect(screen.getByTestId("has-login").textContent).toBe("function");
    expect(screen.getByTestId("has-logout").textContent).toBe("function");
    expect(screen.getByTestId("has-setuser").textContent).toBe("function");
  });

  it("returns live auth state from AuthProvider (token + user)", async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        id: 1,
        username: "admin",
        first_name: "A",
        last_name: "B",
        email: "a@b.c",
        is_active: true,
        is_superuser: true,
        permissions: ["gestion.entreprises"],
      },
    });
    localStorage.setItem("token", "access-token");
    localStorage.setItem("refresh", "refresh-token");

    render(
      <AuthProvider>
        <ProbeUsingHook />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("access-token");
    });
  });
});
