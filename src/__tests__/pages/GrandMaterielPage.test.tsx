import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import GrandMaterielPage from "../../pages/GrandMaterielPage";

vi.mock("../../components/Crud/CrudPage", () => ({
  default: vi.fn(({ title, endpoint, fields, columns, initialFormValues, beforeSubmit }) => (
    <div data-testid="crud-page">
      <h1 data-testid="crud-title">{title}</h1>
      <span data-testid="crud-endpoint">{endpoint}</span>
      <span data-testid="crud-fields-count">{fields.length}</span>
      <span data-testid="crud-columns-count">{columns.length}</span>
      <span data-testid="has-initial-form">{initialFormValues ? "yes" : "no"}</span>
      <span data-testid="has-before-submit">{beforeSubmit ? "yes" : "no"}</span>
    </div>
  )),
}));

vi.mock("../../components/Crud/useEntityOptions", () => ({
  useEntityOptions: vi.fn(() => ({ options: [] })),
}));

describe("GrandMaterielPage", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<GrandMaterielPage />);
    expect(screen.getByTestId("crud-page")).toBeTruthy();
  });

  it("passes the correct title to CrudPage", () => {
    render(<GrandMaterielPage />);
    expect(screen.getByTestId("crud-title").textContent).toBe("Grand Matériel");
  });

  it("passes the correct endpoint to CrudPage", () => {
    render(<GrandMaterielPage />);
    expect(screen.getByTestId("crud-endpoint").textContent).toBe("grand-materiel");
  });

  it("defines fields and columns", () => {
    render(<GrandMaterielPage />);
    expect(Number(screen.getByTestId("crud-fields-count").textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("crud-columns-count").textContent)).toBeGreaterThan(0);
  });

  it("passes initialFormValues and beforeSubmit to CrudPage", () => {
    render(<GrandMaterielPage />);
    expect(screen.getByTestId("has-initial-form").textContent).toBe("yes");
    expect(screen.getByTestId("has-before-submit").textContent).toBe("yes");
  });
});
