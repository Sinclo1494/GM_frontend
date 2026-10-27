import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthContext, type AuthContextType } from "../../context/AuthContext";
import { AnalyseFiltersProvider } from "../../context/AnalyseFiltersContext";
import { useAnalyseFilters } from "../../context/useAnalyseFilters";
import { DashboardFiltersProvider } from "../../context/DashboardFiltersContext";
import { useDashboardFilters } from "../../context/useDashboardFilters";
import type { UserInfo } from "../../types/user";

/**
 * The affiliate filter used to be a hardcoded code ("P") that was never
 * reconciled with the affiliate the logged-in user is assigned to. A user
 * locked to a single affiliate therefore sent a `code_filiale` outside their
 * scope and the analysis endpoints answered 403 ("Accès refusé à cette
 * filiale.").
 */

const makeUser = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  id: 5,
  username: "test",
  first_name: "tester",
  last_name: "test",
  email: "test@test.com",
  is_active: true,
  is_superuser: false,
  can_access_all_filiales: false,
  filiale: "A",
  accessible_databases: ["filiale_A"],
  permissions: [],
  ...overrides,
});

const authValue = (user: UserInfo | null): AuthContextType => ({
  token: "token",
  user,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

const withAuth = (user: UserInfo | null) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue(user)}>
      {children}
    </AuthContext.Provider>
  );
  return Wrapper;
};

const analyseWrapper = (user: UserInfo | null) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue(user)}>
      <AnalyseFiltersProvider>{children}</AnalyseFiltersProvider>
    </AuthContext.Provider>
  );
  return Wrapper;
};

const dashboardWrapper = (user: UserInfo | null) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={authValue(user)}>
      <DashboardFiltersProvider>{children}</DashboardFiltersProvider>
    </AuthContext.Provider>
  );
  return Wrapper;
};

describe("context/filialeScope", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Analyse filters", () => {
    it("pins the filter to the affiliate the user is assigned to", async () => {
      const { result } = renderHook(() => useAnalyseFilters(), {
        wrapper: analyseWrapper(makeUser()),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("A"));
    });

    it("corrects a filter persisted for another affiliate", async () => {
      // localStorage is not scoped to an account: the previous session (or
      // another user on the same browser) may have left "P" behind.
      localStorage.setItem(
        "analyse_filters",
        JSON.stringify({ codeFiliale: "P", dateDebut: "2026-01-01", dateFin: "2026-01-31" }),
      );

      const { result } = renderHook(() => useAnalyseFilters(), {
        wrapper: analyseWrapper(makeUser()),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("A"));
    });

    it("keeps the default affiliate for a user allowed to query every affiliate", async () => {
      const { result } = renderHook(() => useAnalyseFilters(), {
        wrapper: analyseWrapper(
          makeUser({ can_access_all_filiales: true, filiale: "A" }),
        ),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("P"));
    });

    it("keeps the default affiliate while the user is still loading", () => {
      const { result } = renderHook(() => useAnalyseFilters(), {
        wrapper: analyseWrapper(null),
      });

      expect(result.current.codeFiliale).toBe("P");
    });
  });

  describe("Dashboard filters", () => {
    it("pins the filter to the affiliate the user is assigned to", async () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: dashboardWrapper(makeUser()),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("A"));
    });

    it("keeps the user affiliate when the filters are reset", async () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: dashboardWrapper(makeUser()),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("A"));

      act(() => {
        result.current.setCodeFiliale("F");
      });
      expect(result.current.codeFiliale).toBe("F");

      act(() => {
        result.current.resetFilters();
      });
      // The reset must not send a locked user back to the hardcoded default.
      expect(result.current.codeFiliale).toBe("A");
    });

    it("keeps the default affiliate for a user allowed to query every affiliate", async () => {
      const { result } = renderHook(() => useDashboardFilters(), {
        wrapper: dashboardWrapper(
          makeUser({ can_access_all_filiales: true, filiale: "A" }),
        ),
      });

      await waitFor(() => expect(result.current.codeFiliale).toBe("P"));
    });
  });
});
