import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import FilterBar from "../../../../components/dashboard/v2/FilterBar";
import type { DashboardFilters } from "../../../../types/dashboard";
import type { FilterChip, FilterOption } from "../../../../components/dashboard/v2/FilterBar";

const FILIALES: FilterOption[] = [
  { value: "P", label: "Parent" },
  { value: "F", label: "Fille" },
];

const baseFilters: DashboardFilters = {
  code_filiale: "P",
  code_famille: "",
  date_debut: "2026-09-01",
  date_fin: "2026-09-30",
  periode: "",
  trimestre: "",
  annee: "2026",
  mode: "standard",
  niveau: "engin",
};

const baseProps = {
  filters: baseFilters,
  visibleFilters: ["code_filiale", "annee"] as (keyof DashboardFilters)[],
  onChange: vi.fn(),
  onReset: vi.fn(),
  activeChips: [] as FilterChip[],
  filiales: FILIALES,
};

describe("components/dashboard/v2/FilterBar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
  });

  it("renders only the visible filter controls", () => {
    render(<FilterBar {...baseProps} />);
    // code_filiale renders a select with the filiale options.
    expect(screen.getByText("Filiale")).toBeDefined();
    // annee renders a select with the current year.
    expect(screen.getByText("Année")).toBeDefined();
    // Non-visible controls must not be rendered.
    expect(screen.queryByText("Période")).toBeNull();
    expect(screen.queryByText("Mode")).toBeNull();
    expect(screen.queryByText("Niveau d'analyse")).toBeNull();
  });

  it("shows one active chip when activeChips has one entry", () => {
    const chips: FilterChip[] = [
      { key: "code_filiale", label: "Filiale", value: "P" },
    ];
    render(<FilterBar {...baseProps} activeChips={chips} />);
    expect(screen.getByText("P")).toBeDefined();
  });

  it("clicking a chip's X calls onChange with the chip key and empty value", () => {
    const onChange = vi.fn();
    const chips: FilterChip[] = [
      { key: "code_filiale", label: "Filiale", value: "P" },
    ];
    render(
      <FilterBar
        {...baseProps}
        activeChips={chips}
        onChange={onChange}
      />,
    );
    // The X button is the only button inside the chip row.
    const chipRow = screen.getByText("P").closest("div")!.parentElement!;
    const clearBtn = within(chipRow).getByRole("button", { name: /supprimer ce filtre/i });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("code_filiale", "");
  });

  it("renders the reset button", () => {
    render(<FilterBar {...baseProps} />);
    expect(screen.getByRole("button", { name: "Réinitialiser" })).toBeDefined();
  });
});