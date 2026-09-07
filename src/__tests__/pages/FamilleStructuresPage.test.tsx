import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import FamilleStructuresPage from "../../pages/FamilleStructuresPage";

vi.mock("../../components/Crud/CrudPage", () => ({
  default: vi.fn(({ title, endpoint, fields, columns }) => (
    <div data-testid="crud-page">
      <h1 data-testid="crud-title">{title}</h1>
      <span data-testid="crud-endpoint">{endpoint}</span>
      <span data-testid="crud-fields-count">{fields.length}</span>
      <span data-testid="crud-columns-count">{columns.length}</span>
    </div>
  )),
}));

describe("FamilleStructuresPage", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<FamilleStructuresPage />);
    expect(screen.getByTestId("crud-page")).toBeTruthy();
  });

  it("passes the correct title to CrudPage", () => {
    render(<FamilleStructuresPage />);
    expect(screen.getByTestId("crud-title").textContent).toBe("Familles de Structures");
  });

  it("passes the correct endpoint to CrudPage", () => {
    render(<FamilleStructuresPage />);
    expect(screen.getByTestId("crud-endpoint").textContent).toBe("famille-structures");
  });

  it("defines fields and columns", () => {
    render(<FamilleStructuresPage />);
    expect(Number(screen.getByTestId("crud-fields-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("crud-columns-count").textContent)).toBeGreaterThan(0);
  });
});
