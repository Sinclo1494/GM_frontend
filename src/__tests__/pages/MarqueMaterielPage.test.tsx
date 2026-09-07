import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import MarqueMaterielPage from "../../pages/MarqueMaterielPage";

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

vi.mock("../../components/Crud/useEntityOptions", () => ({
  useEntityOptions: vi.fn(() => ({ options: [] })),
}));

describe("MarqueMaterielPage", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<MarqueMaterielPage />);
    expect(screen.getByTestId("crud-page")).toBeTruthy();
  });

  it("passes the correct title to CrudPage", () => {
    render(<MarqueMaterielPage />);
    expect(screen.getByTestId("crud-title").textContent).toBe("Marques Matériel");
  });

  it("passes the correct endpoint to CrudPage", () => {
    render(<MarqueMaterielPage />);
    expect(screen.getByTestId("crud-endpoint").textContent).toBe("marque-materiel");
  });

  it("defines fields and columns", () => {
    render(<MarqueMaterielPage />);
    expect(Number(screen.getByTestId("crud-fields-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("crud-columns-count").textContent)).toBeGreaterThan(0);
  });
});
