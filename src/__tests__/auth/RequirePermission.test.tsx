import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import RequirePermission from "../../auth/RequirePermission";
import { PermissionContext, type PermissionContextValue } from "../../auth/PermissionContext";

// Use the real react-router-dom (the global setup mock omits MemoryRouter, which
// RequirePermission's redirect tests need).
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

function LocationDisplay() {
  const loc = useLocation();
  return <span data-testid="location">{loc.pathname}</span>;
}

function renderWithPermissionContext(
  ctx: PermissionContextValue,
  initialRoute = "/somewhere",
) {
  return render(
    <PermissionContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <LocationDisplay />
      </MemoryRouter>
    </PermissionContext.Provider>,
  );
}

describe("RequirePermission.tsx", () => {
  const baseCtx = (overrides: Partial<PermissionContextValue> = {}): PermissionContextValue => ({
    user: null,
    permissions: [],
    loading: false,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    ...overrides,
  });

  it("renders children immediately when granted and loading is false (no Navigate redirect)", () => {
    const ctx = baseCtx({ hasPermission: () => true });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter initialEntries={["/somewhere"]}>
          <LocationDisplay />
          <RequirePermission permission="gestion.entreprises">
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    // No redirect: location stays at the initial entry; children render.
    expect(screen.getByTestId("location").textContent).toBe("/somewhere");
    expect(screen.getByTestId("allowed")).toHaveTextContent("Content allowed");
  });

  it("renders children when hasPermission returns true", () => {
    const ctx = baseCtx({ hasPermission: () => true });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter>
          <RequirePermission permission="gestion.entreprises">
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    expect(screen.getByTestId("allowed")).toHaveTextContent("Content allowed");
    expect(screen.queryByTestId("denied")).toBeNull();
  });

  it("renders the fallback when permission is denied and a fallback is provided", () => {
    const ctx = baseCtx({ hasPermission: () => false });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter>
          <RequirePermission permission="gestion.entreprises" fallback={<span data-testid="denied">No access</span>}>
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    expect(screen.getByTestId("denied")).toHaveTextContent("No access");
    expect(screen.queryByTestId("allowed")).toBeNull();
  });

  it("redirects to '/' (replace) when permission is denied and no fallback is provided", async () => {
    const ctx = baseCtx({ hasPermission: () => false });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter initialEntries={["/somewhere"]}>
          <LocationDisplay />
          <RequirePermission permission="gestion.entreprises">
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    // Navigate to "/" should update the router location.
    await screen.findByTestId("location");
    expect(screen.getByTestId("location").textContent).toBe("/");
    expect(screen.queryByTestId("allowed")).toBeNull();
  });

  it("renders null (default fallback) while loading is true", () => {
    const ctx = baseCtx({ loading: true });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter>
          <RequirePermission permission="gestion.entreprises" fallback={<span data-testid="custom-loading">Loading…</span>}>
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    expect(screen.getByTestId("custom-loading")).toHaveTextContent("Loading…");
    expect(screen.queryByTestId("allowed")).toBeNull();
  });

  it("renders null by default while loading and no fallback given", () => {
    const ctx = baseCtx({ loading: true });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter>
          <RequirePermission permission="gestion.entreprises">
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
          <span data-testid="sibling">sibling</span>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    // No children or fallback rendered during loading; sibling still present.
    expect(screen.queryByTestId("allowed")).toBeNull();
    expect(screen.getByTestId("sibling")).toBeTruthy();
  });

  it("always renders children when granted even if a fallback is supplied", () => {
    const ctx = baseCtx({ hasPermission: () => true });
    render(
      <PermissionContext.Provider value={ctx}>
        <MemoryRouter>
          <RequirePermission permission="gestion.entreprises" fallback={<span data-testid="denied">No access</span>}>
            <span data-testid="allowed">Content allowed</span>
          </RequirePermission>
        </MemoryRouter>
      </PermissionContext.Provider>,
    );
    expect(screen.getByTestId("allowed")).toBeTruthy();
    expect(screen.queryByTestId("denied")).toBeNull();
  });
});
