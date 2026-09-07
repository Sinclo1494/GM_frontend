import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImportSettings from "../../../components/ImportCSV/ImportSettings";

const mockFiliales = [
  { value: "P", label: "Filiale P" },
  { value: "Q", label: "Filiale Q" },
];

describe("ImportSettings", () => {
  it("renders settings title", () => {
    render(<ImportSettings filiales={[]} selectedFiliale="" onFilialeChange={vi.fn()} />);
    expect(screen.getByText("Paramètres d'import")).toBeTruthy();
  });

  it("renders filiale select", () => {
    render(<ImportSettings filiales={mockFiliales} selectedFiliale="" onFilialeChange={vi.fn()} />);
    expect(screen.getByText("Filiale")).toBeTruthy();
    expect(screen.getByText("Sélectionnez une filiale...")).toBeTruthy();
  });

  it("renders filiale options", () => {
    render(<ImportSettings filiales={mockFiliales} selectedFiliale="" onFilialeChange={vi.fn()} />);
    expect(screen.getByText("P - Filiale P")).toBeTruthy();
    expect(screen.getByText("Q - Filiale Q")).toBeTruthy();
  });

  it("calls onFilialeChange when selection changes", () => {
    const onFilialeChange = vi.fn();
    render(<ImportSettings filiales={mockFiliales} selectedFiliale="" onFilialeChange={onFilialeChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "P" } });
    expect(onFilialeChange).toHaveBeenCalledWith("P");
  });
});
