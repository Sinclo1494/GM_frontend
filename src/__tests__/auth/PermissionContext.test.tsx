import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { usePermissions, PermissionContext } from "../../auth/PermissionContext";
import PermissionProvider from "../../auth/PermissionProvider";
import { AuthContext } from "../../context/AuthContext";
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

// A consumer that renders the permission context state into the DOM.
function PermissionProbe() {
  const p = usePermissions();
  return (
    <div>
      <span data-testid="loading">{String(p.loading)}</span>
      <span data-testid="user">{p.user ? p.user.username : "none"}</span>
      <span data-testid="permissions">{JSON.stringify(p.permissions)}</span>
      <span data-testid="has-read">{String(p.hasPermission("gestion.entreprises"))}</span>
      <span data-testid="has-write">{String(p.hasPermission("gestion.entreprises.write"))}</span>
      <span data-testid="has-any">{String(p.hasAnyPermission(["gestion.entreprises", "gestion.filiales"]))}</span>
      <span data-testid="has-all">{String(p.hasAllPermissions(["gestion.entreprises", "gestion.filiales"]))}</span>
    </div>
  );
}

// Wraps children in an AuthContext.Provider with a controllable token.
function AuthTokenProvider({ token, children }: { token: string | null; children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ token, user: null, login: vi.fn(), logout: vi.fn(), setUser: vi.fn() }}>
      {children}
    </AuthContext.Provider>
  );
}

describe("PermissionContext.ts (usePermissions fallback)", () => {
  it("returns the safe fallback shape when used without a provider", () => {
    render(<PermissionProbe />);
    // fallback: loading true, user null, permissions [], all has* false
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("permissions").textContent).toBe("[]");
    expect(screen.getByTestId("has-read").textContent).toBe("false");
    expect(screen.getByTestId("has-write").textContent).toBe("false");
    expect(screen.getByTestId("has-any").textContent).toBe("false");
    expect(screen.getByTestId("has-all").textContent).toBe("false");
  });

  it("fallback hasPermission/hasAnyPermission/hasAllPermissions always return false", () => {
    let p: ReturnType<typeof usePermissions>;
    function Inner() {
      p = usePermissions();
      return null;
    }
    render(<Inner />);
    expect(p!.hasPermission("anything")).toBe(false);
    expect(p!.hasAnyPermission(["a", "b"])).toBe(false);
    expect(p!.hasAllPermissions(["a", "b"])).toBe(false);
    expect(p!.user).toBeNull();
    expect(p!.permissions).toEqual([]);
    expect(p!.loading).toBe(true);
  });
});

describe("PermissionProvider.tsx", () => {
  beforeEach(() => {
    (axios.get as any).mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts in loading=false with no user when no auth token is present", async () => {
    render(
      <AuthTokenProvider token={null}>
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("user").textContent).toBe("none");
    expect(screen.getByTestId("permissions").textContent).toBe("[]");
  });

  it("loads the current user and permissions when a token is present", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        id: 1,
        username: "admin",
        first_name: "A",
        last_name: "B",
        email: "a@b.c",
        is_active: true,
        is_superuser: false,
        permissions: ["gestion.entreprises", "gestion.filiales.read"],
      },
    });

    render(
      <AuthTokenProvider token="token-xyz">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("admin");
    });
    expect(screen.getByTestId("permissions").textContent).toContain("gestion.entreprises");
  });

  it("hasPermission returns true for superuser regardless of permissions", async () => {
    (axios.get as any).mockResolvedValue({
      data: { id: 1, username: "root", first_name: "", last_name: "", email: "", is_active: true, is_superuser: true, permissions: [] },
    });

    render(
      <AuthTokenProvider token="t">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("has-read").textContent).toBe("true");
    expect(screen.getByTestId("has-write").textContent).toBe("true");
    expect(screen.getByTestId("has-any").textContent).toBe("true");
    expect(screen.getByTestId("has-all").textContent).toBe("true");
  });

  it("hasPermission respects .read/.write suffix variants and bare keys", async () => {
    (axios.get as any).mockResolvedValue({
      data: { id: 1, username: "u", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: ["gestion.entreprises.write"] },
    });

    render(
      <AuthTokenProvider token="t">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    // bare "gestion.entreprises" -> user has "gestion.entreprises.write" -> true
    expect(screen.getByTestId("has-read").textContent).toBe("true");
    // "gestion.entreprises.write" is granted exactly -> true
    expect(screen.getByTestId("has-write").textContent).toBe("true");
  });

  it("hasAny/hasAll reflect membership: granted=true, missing=false", async () => {
    (axios.get as any).mockResolvedValue({
      data: { id: 1, username: "u", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: ["gestion.entreprises"] },
    });

    render(
      <AuthTokenProvider token="t">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    // hasAny(["gestion.entreprises", "gestion.filiales"]) -> entreprises granted -> true
    expect(screen.getByTestId("has-any").textContent).toBe("true");
    // hasAll(["gestion.entreprises", "gestion.filiales"]) -> filiales missing -> false
    expect(screen.getByTestId("has-all").textContent).toBe("false");
  });

  it("sets loading=false and user null when getCurrentUser rejects", async () => {
    (axios.get as any).mockRejectedValue(new Error("boom"));

    render(
      <AuthTokenProvider token="t">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
  });

  it("context values update when the auth token prop changes (re-render)", async () => {
    // First token: no user fetch resolves to a superuser
    (axios.get as any).mockResolvedValue({
      data: { id: 1, username: "first", first_name: "", last_name: "", email: "", is_active: true, is_superuser: true, permissions: [] },
    });

    const { rerender } = render(
      <AuthTokenProvider token="t-1">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("first"));

    // Switch token: AuthProvider re-runs loadUser for the new token.
    (axios.get as any).mockResolvedValue({
      data: { id: 2, username: "second", first_name: "", last_name: "", email: "", is_active: true, is_superuser: false, permissions: ["gestion.filiales"] },
    });

    rerender(
      <AuthTokenProvider token="t-2">
        <PermissionProvider>
          <PermissionProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("second"));
  });

  it("wraps children in the PermissionContext.Provider", () => {
    const ChildrenProbe = () => {
      const ctx = usePermissions();
      return <span data-testid="wrapped">{ctx.loading ? "loading" : "ready"}</span>;
    };
    render(
      <AuthTokenProvider token={null}>
        <PermissionProvider>
          <ChildrenProbe />
        </PermissionProvider>
      </AuthTokenProvider>,
    );
    // Children are rendered through the provider.
    expect(screen.getByTestId("wrapped")).toBeTruthy();
  });
});
