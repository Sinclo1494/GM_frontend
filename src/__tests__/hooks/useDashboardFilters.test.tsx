import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DashboardFiltersProvider } from "../../context/DashboardFiltersContext";
import {
  useDashboardFilters,
  defaultDashboardFilters,
} from "../../hooks/useDashboardFilters";

const STORAGE_KEY = "dashboard-v2-filters";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DashboardFiltersProvider>{children}</DashboardFiltersProvider>
);

const pad = (n: number) => String(n).padStart(2, "0");

describe("hooks/useDashboardFilters", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
    localStorage.clear();
  });

  const currentYear = String(new Date().getFullYear());

  // Local (not UTC) month-to-date range: the hook formats with local getters,
  // so a `toISOString()` based expectation would be off by one in any timezone
  // where "now" is not midday UTC.
  const currentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    return {
      dateDebut: `${year}-${month}-01`,
      dateFin: `${year}-${month}-${pad(now.getDate())}`,
    };
  };

  it("defaults dateDebut/dateFin to the current local month range", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    const expected = currentMonthRange();
    expect(result.current.dateDebut).toBe(expected.dateDebut);
    expect(result.current.dateFin).toBe(expected.dateFin);
    expect(result.current.periode).toBe("mois_courant");
  });

  it("defaults codeFiliale to 'P' and annee to the current year", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    expect(result.current.codeFiliale).toBe("P");
    expect(result.current.annee).toBe(currentYear);
  });

  it("uses the real last day of the month for a month selection", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => {
      result.current.setPeriode("07");
    });
    expect(result.current.periode).toBe("07");
    expect(result.current.dateDebut).toBe(`${currentYear}-07-01`);
    expect(result.current.dateFin).toBe(`${currentYear}-07-31`);
    expect(result.current.annee).toBe(currentYear);
  });

  it("setAnnee('') keeps the previous annee instead of storing NaN", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => {
      result.current.setAnnee("2024");
    });
    expect(result.current.annee).toBe("2024");
    act(() => {
      result.current.setAnnee("");
    });
    // The empty string is not a meaningful filter: it is ignored rather than
    // propagating NaN into the date computations (which used to crash).
    expect(result.current.annee).toBe("2024");
  });

  it("setPeriode('annee') marks the full-year period and keeps annee", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => {
      result.current.setPeriode("annee");
    });
    expect(result.current.periode).toBe("annee");
    expect(result.current.dateDebut).toBe(`${currentYear}-01-01`);
    expect(result.current.dateFin).toBe(`${currentYear}-12-31`);
  });

  it("resetFilters() restores the default month range and codeFiliale", () => {
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    act(() => {
      result.current.setPeriode("07");
    });
    act(() => {
      result.current.setCodeFiliale("F");
    });
    expect(result.current.codeFiliale).toBe("F");
    act(() => {
      result.current.resetFilters();
    });
    const expected = currentMonthRange();
    expect(result.current.dateDebut).toBe(expected.dateDebut);
    expect(result.current.dateFin).toBe(expected.dateFin);
    expect(result.current.codeFiliale).toBe("P");
    expect(result.current.periode).toBe("mois_courant");
  });

  it("keeps an explicitly persisted custom range", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultDashboardFilters, periode: "personnalisee", dateDebut: "2024-03-01", dateFin: "2024-03-31" }),
    );
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    expect(result.current.periode).toBe("personnalisee");
    expect(result.current.dateDebut).toBe("2024-03-01");
    expect(result.current.dateFin).toBe("2024-03-31");
  });

  it("discards a persisted default-looking range from a previous month", () => {
    // A range persisted as "mois_courant" last month is stale: keeping it
    // would show an empty dashboard until the user touched the filters.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultDashboardFilters,
        periode: "mois_courant",
        dateDebut: "2020-01-01",
        dateFin: "2020-01-31",
      }),
    );
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    const expected = currentMonthRange();
    expect(result.current.dateDebut).toBe(expected.dateDebut);
    expect(result.current.dateFin).toBe(expected.dateFin);
  });

  it("discards a persisted explicit month whose range is out of sync with annee", () => {
    // `periode: "07"` means "July of `annee`"; a 2024 range persisted while
    // annee is now the current year is rebuilt instead of kept verbatim.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultDashboardFilters,
        periode: "07",
        dateDebut: "2024-07-01",
        dateFin: "2024-07-31",
      }),
    );
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    expect(result.current.dateDebut).toBe(`${currentYear}-07-01`);
    expect(result.current.dateFin).toBe(`${currentYear}-07-31`);
  });

  it("rebuilds a persisted 'annee' range when its dates belong to another year", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...defaultDashboardFilters,
        periode: "annee",
        dateDebut: "2023-01-01",
        dateFin: "2023-12-31",
      }),
    );
    const { result } = renderHook(() => useDashboardFilters(), { wrapper });
    expect(result.current.dateDebut).toBe(`${currentYear}-01-01`);
    expect(result.current.dateFin).toBe(`${currentYear}-12-31`);
  });
});