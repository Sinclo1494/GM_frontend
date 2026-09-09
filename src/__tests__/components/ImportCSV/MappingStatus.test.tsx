import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MappingStatus from "../../../components/ImportCSV/MappingStatus";

const mockMissingRequired = [
  { value: "field1", label: "Field 1", required: true },
];

describe("MappingStatus", () => {
  it("renders ignored columns count", () => {
    render(<MappingStatus missingRequired={[]} ignoredColumns={2} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("renders success message when no missing required fields", () => {
    render(<MappingStatus missingRequired={[]} ignoredColumns={0} />);
    expect(screen.getByText("✓ Tous les champs obligatoires sont associés.")).toBeTruthy();
  });

  it("renders missing required warning when fields are missing", () => {
    render(<MappingStatus missingRequired={mockMissingRequired} ignoredColumns={1} />);
    expect(screen.getByText("Champs obligatoires manquants")).toBeTruthy();
    expect(screen.getByText("Field 1")).toBeTruthy();
  });
});
