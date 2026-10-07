import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import PointagePage from "../../pages/PointagePage";
import type { FieldConfig } from "../../components/Crud/EntityFormDialog";
import type { ColumnDef } from "../../components/Crud/CrudTable";

const MODEL_FIELDS = [
  "affectation_id",
  "mmaa",
  "taux_location",
  "heures_service",
  "heures_chomage",
  "heures_panne",
  "potentiel",
  "montant_service",
  "montant_chomage",
  "montant_panne",
  "est_bloque",
  "user_id",
  "date_modification",
  "created_at",
  "updated_at",
];

vi.mock("../../components/Crud/CrudPage", () => ({
  default: vi.fn(({ title, endpoint, fields, columns }) => (
    <div data-testid="crud-page">
      <h1 data-testid="crud-title">{title}</h1>
      <span data-testid="crud-endpoint">{endpoint}</span>
      <span data-testid="crud-fields-count">{fields.length}</span>
      <span data-testid="crud-columns-count">{columns.length}</span>
      <ul data-testid="crud-field-names">
        {fields.map((field: FieldConfig) => (
          <li key={field.name}>{field.name}</li>
        ))}
      </ul>
      <ul data-testid="crud-column-keys">
        {columns.map((column: ColumnDef<unknown>) => (
          <li key={String(column.key)}>{String(column.key)}</li>
        ))}
      </ul>
      <ul data-testid="crud-unfiltered-columns">
        {columns
          .filter((column: ColumnDef<unknown>) => !column.filter)
          .map((column: ColumnDef<unknown>) => (
            <li key={String(column.key)}>{String(column.key)}</li>
          ))}
      </ul>
      <ul data-testid="crud-filter-params">
        {columns
          .filter((column: ColumnDef<unknown>) => column.filter)
          .map((column: ColumnDef<unknown>) => (
            <li key={column.filter!.param ?? String(column.key)}>
              {column.filter!.param ?? String(column.key)}
            </li>
          ))}
      </ul>
    </div>
  )),
}));

vi.mock("../../components/Crud/useEntityOptions", () => ({
  useEntityOptions: vi.fn(() => ({ options: [] })),
}));

const textsOf = (testId: string): string[] =>
  Array.from(screen.getByTestId(testId).querySelectorAll("li")).map((li) => li.textContent ?? "");

describe("PointagePage", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<PointagePage />);
    expect(screen.getByTestId("crud-page")).toBeTruthy();
  });

  it("passes the correct title to CrudPage", () => {
    render(<PointagePage />);
    expect(screen.getByTestId("crud-title").textContent).toBe("Pointages");
  });

  it("passes the correct endpoint to CrudPage", () => {
    render(<PointagePage />);
    expect(screen.getByTestId("crud-endpoint").textContent).toBe("pointage");
  });

  it("defines fields and columns", () => {
    render(<PointagePage />);
    expect(Number(screen.getByTestId("crud-fields-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("crud-columns-count").textContent)).toBeGreaterThan(0);
  });

  it("exposes every Pointage model field in the create/edit form", () => {
    render(<PointagePage />);
    const fieldNames = textsOf("crud-field-names");
    for (const modelField of MODEL_FIELDS) {
      expect(fieldNames).toContain(modelField);
    }
  });

  it("renders every Pointage model field as a table column", () => {
    render(<PointagePage />);
    const columnKeys = textsOf("crud-column-keys");
    expect(columnKeys).toContain("code_affectation");
    expect(columnKeys).toContain("taux_location");
    expect(columnKeys).toContain("user");
    expect(columnKeys).toContain("created_at");
    expect(columnKeys).toContain("updated_at");
  });

  it("provides a filter on every column", () => {
    render(<PointagePage />);
    expect(textsOf("crud-unfiltered-columns")).toEqual([]);
    expect(textsOf("crud-filter-params")).toEqual(
      expect.arrayContaining([
        "code_affectation",
        "code_materiel",
        "code_site",
        "code_filiale",
        "mmaa",
        "taux_location",
        "heures_service",
        "heures_chomage",
        "heures_panne",
        "potentiel",
        "montant_service",
        "montant_chomage",
        "montant_panne",
        "user",
        "date_modification",
        "created_at",
        "updated_at",
        "est_bloque",
      ]),
    );
  });
});