import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { resetAllMocks } from "../test-utils";
import JournalMateriel from "../../pages/JournalMateriel";

vi.mock("../../components/JournalMateriel/JournalMaterielTable", () => ({
  default: () => <div data-testid="journal-materiel-table">Table</div>,
}));

describe("JournalMateriel", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it("renders without crashing", () => {
    render(<JournalMateriel />);
    expect(screen.getByText("Journal Matériel")).toBeTruthy();
  });

  it("displays page title and description", () => {
    render(<JournalMateriel />);
    expect(screen.getByText("Journal Matériel")).toBeTruthy();
    expect(screen.getByText("Consultation des équipements enregistrés.")).toBeTruthy();
  });

  it("renders the child table component", () => {
    render(<JournalMateriel />);
    expect(screen.getByTestId("journal-materiel-table")).toBeTruthy();
  });
});
