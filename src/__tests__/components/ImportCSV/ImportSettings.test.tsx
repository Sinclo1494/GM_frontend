import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImportSettings from "../../../components/ImportCSV/ImportSettings";

const mockFiliales = [
  { value: "P", label: "Filiale P" },
  { value: "Q", label: "Filiale Q" },
];

describe("ImportSettings", () => {
  it("renders settings title", () => {
    render(
      <ImportSettings
        filiales={[]}
        selectedFiliale=""
        onFilialeChange={vi.fn()}
        isAdmin={false}
        userFiliale={null}
      />
    );
    expect(screen.getByText("Paramètres d'import")).toBeTruthy();
  });

  it("renders filiale select for admin", () => {
    render(
      <ImportSettings
        filiales={mockFiliales}
        selectedFiliale=""
        onFilialeChange={vi.fn()}
        isAdmin={true}
      />
    );
    expect(screen.getByText("Filiale")).toBeTruthy();
    expect(screen.getByText("Sélectionnez une filiale...")).toBeTruthy();
  });

  it("renders filiale options for admin", () => {
    render(
      <ImportSettings
        filiales={mockFiliales}
        selectedFiliale=""
        onFilialeChange={vi.fn()}
        isAdmin={true}
      />
    );
    expect(screen.getByText("P - Filiale P")).toBeTruthy();
    expect(screen.getByText("Q - Filiale Q")).toBeTruthy();
  });

  it("calls onFilialeChange when selection changes", () => {
    const onFilialeChange = vi.fn();
    render(
      <ImportSettings
        filiales={mockFiliales}
        selectedFiliale=""
        onFilialeChange={onFilialeChange}
        isAdmin={true}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "P" } });
    expect(onFilialeChange).toHaveBeenCalledWith("P");
  });

  it("shows read-only filiale for non-admin user", () => {
    render(
      <ImportSettings
        filiales={mockFiliales}
        selectedFiliale=""
        onFilialeChange={vi.fn()}
        isAdmin={false}
        userFiliale="P"
      />
    );
    const filialeEl = document.getElementById("filiale");
    expect(filialeEl?.textContent).toContain("Filiale P");
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
