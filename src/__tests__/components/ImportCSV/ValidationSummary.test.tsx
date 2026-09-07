import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ValidationSummary from "../../../components/ImportCSV/ValidationSummary";

const mockSummary = {
  total_rows: 100,
  valid_rows: 80,
  errors: 15,
  warnings: 5,
};

describe("ValidationSummary", () => {
  it("renders total rows", () => {
    render(<ValidationSummary summary={mockSummary} />);
    expect(screen.getByText("100")).toBeTruthy();
  });

  it("renders valid rows", () => {
    render(<ValidationSummary summary={mockSummary} />);
    expect(screen.getByText("80")).toBeTruthy();
  });

  it("renders error count", () => {
    render(<ValidationSummary summary={mockSummary} />);
    expect(screen.getByText("15")).toBeTruthy();
  });

  it("renders warning count", () => {
    render(<ValidationSummary summary={mockSummary} />);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders all labels", () => {
    render(<ValidationSummary summary={mockSummary} />);
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Lignes valides")).toBeTruthy();
    expect(screen.getByText("Erreurs")).toBeTruthy();
    expect(screen.getByText("Avertissements")).toBeTruthy();
  });
});
