import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import RegularisationMoisGM2Page from "../../pages/RegularisationMoisGM2Page";

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

describe("RegularisationMoisGM2Page", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<RegularisationMoisGM2Page />);
    expect(screen.getByTestId("crud-page")).toBeTruthy();
  });

  it("passes the correct title to CrudPage", () => {
    render(<RegularisationMoisGM2Page />);
    expect(screen.getByTestId("crud-title").textContent).toBe("Régularisations Mensuelles");
  });

  it("passes the correct endpoint to CrudPage", () => {
    render(<RegularisationMoisGM2Page />);
    expect(screen.getByTestId("crud-endpoint").textContent).toBe("regularisation-mois-gm2");
  });

  it("defines fields and columns", () => {
    render(<RegularisationMoisGM2Page />);
    expect(Number(screen.getByTestId("crud-fields-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("crud-columns-count").textContent)).toBeGreaterThan(0);
  });
});
