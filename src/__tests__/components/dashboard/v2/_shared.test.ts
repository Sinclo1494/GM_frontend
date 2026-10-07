import { describe, it, expect } from "vitest";
import {
  fmtMillions,
  fmtNumber,
  safePct,
  formatMonth,
  formatQuarter,
  filtersToParams,
  computeVisibleFilters,
} from "../../../../components/dashboard/v2/screens/_shared";
import { defaultDashboardFilters } from "../../../../context/useDashboardFilters";

describe("components/dashboard/v2/screens/_shared", () => {
  describe("fmtMillions", () => {
    it("divides by one million", () => {
      expect(fmtMillions(5_000_000)).toBe("5,0 M");
      expect(fmtMillions(1_250_000)).toBe("1,3 M");
      expect(fmtMillions(0)).toBe("0,0 M");
    });

    it("handles negative amounts", () => {
      expect(fmtMillions(-2_000_000)).toBe("-2,0 M");
    });
  });

  describe("fmtNumber", () => {
    it("uses the French locale grouping separator", () => {
      // fr-FR groups with a (narrow) no-break space: assert against Intl
      // instead of hardcoding U+202F, which varies with the ICU version.
      expect(fmtNumber(1234)).toBe(
        new Intl.NumberFormat("fr-FR", {
          maximumFractionDigits: 1,
        }).format(1234),
      );
      expect(fmtNumber(1234)).not.toBe("1,234");
    });
  });

  describe("safePct", () => {
    it("returns 0 for nullish or non finite values", () => {
      expect(safePct(null)).toBe(0);
      expect(safePct(undefined)).toBe(0);
      expect(safePct(NaN)).toBe(0);
      expect(safePct("abc" as unknown as number)).toBe(0);
    });

    it("returns 0 when the denominator is missing", () => {
      expect(safePct(10, 0)).toBe(0);
    });

    it("computes a rounded percentage", () => {
      expect(safePct(1, 4)).toBe(25);
    });
  });

  describe("formatMonth / formatQuarter", () => {
    it("returns the em dash placeholder for a missing key", () => {
      expect(formatMonth("")).toBe("—");
      expect(formatQuarter("")).toBe("—");
    });

    it("derives the quarter number from the Trunc quarter start month", () => {
      expect(formatMonth("2026-07")).toBe("Jul 2026");
      expect(formatQuarter("2026-07")).toBe("T3 2026");
      expect(formatQuarter("2026-01")).toBe("T1 2026");
    });

    it("passes an unexpected value through instead of printing NaN", () => {
      expect(formatMonth("2024-13")).toBe("2024-13");
      expect(formatQuarter("2026-Q3")).toBe("Q3 2026");
      expect(formatQuarter("garbage")).toBe("garbage");
    });
  });

  describe("filtersToParams", () => {
    it("sends only the common filters by default", () => {
      const params = filtersToParams(defaultDashboardFilters);
      expect(params.code_filiale).toBe("P");
      expect(params.code_famille).toBe("");
      expect(params.date_debut).toBe(defaultDashboardFilters.dateDebut);
      expect(params.date_fin).toBe(defaultDashboardFilters.dateFin);
      expect("niveau" in params).toBe(false);
    });

    it("sends niveau when the endpoint groups by it", () => {
      const params = filtersToParams(defaultDashboardFilters, {
        withNiveau: true,
      });
      expect(params.niveau).toBe("engin");
    });
  });

  describe("computeVisibleFilters", () => {
    it("returns the ordered per-tab list", () => {
      expect(
        computeVisibleFilters(["code_filiale", "code_famille"], "mois_courant"),
      ).toEqual(["code_filiale", "code_famille"]);
    });

    it("adds the two date inputs for a custom period", () => {
      expect(
        computeVisibleFilters(["code_filiale"], "personnalisee"),
      ).toEqual(["code_filiale", "date_debut", "date_fin"]);
    });
  });
});