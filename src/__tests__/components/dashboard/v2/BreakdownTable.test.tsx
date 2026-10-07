import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BreakdownTable from "../../../../components/dashboard/v2/BreakdownTable";

const COLUMNS = [
  { key: "code", label: "Code" },
  { key: "libelle", label: "Libellé" },
  { key: "value", label: "Valeur", align: "right" as const },
];

const ROWS = [
  { code: "A", libelle: "Alpha", value: 100, threshold: 80 },
  { code: "B", libelle: "Beta", value: 50, threshold: 80 },
  { code: "C", libelle: "Gamma", value: 75, threshold: 80 },
];

describe("components/dashboard/v2/BreakdownTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
  });

  it("renders all sample rows", () => {
    render(
      <BreakdownTable
        columns={COLUMNS}
        rows={ROWS}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        totalItems={ROWS.length}
      />,
    );
    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gamma").length).toBeGreaterThan(0);
  });

  it("fires onPageChange when the page changes", () => {
    const onPageChange = vi.fn();
    render(
      <BreakdownTable
        columns={COLUMNS}
        rows={ROWS}
        currentPage={1}
        pageSize={2}
        onPageChange={onPageChange}
        onPageSizeChange={vi.fn()}
        totalItems={ROWS.length}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("applies the heatmap row-tint class per statusFor", () => {
    const statusFor = (row: Record<string, unknown>) =>
      Number(row.value) >= Number(row.threshold) ? "success" : "danger";
    const { container } = render(
      <BreakdownTable
        columns={COLUMNS}
        rows={ROWS}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        totalItems={ROWS.length}
        statusFor={statusFor}
      />,
    );
    // Alpha (100 >= 80) -> success tint, Beta (50 < 80) -> danger tint.
    expect(container.querySelector(".bg-green-50")).not.toBeNull();
    expect(container.querySelector(".bg-red-50")).not.toBeNull();
  });

  it("renders an empty state when rows is empty", () => {
    render(
      <BreakdownTable
        columns={COLUMNS}
        rows={[]}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
        totalItems={0}
      />,
    );
    expect(screen.getByText("Aucun résultat")).toBeDefined();
  });
});