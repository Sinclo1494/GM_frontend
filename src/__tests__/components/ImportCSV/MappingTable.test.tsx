import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MappingTable from "../../../components/ImportCSV/MappingTable";

const mockPreview = [
  { index: 0, samples: ["a", "b"] },
  { index: 1, samples: ["c", "d"] },
];

const mockExpectedFields = [
  { value: "field1", label: "Field 1", required: true },
  { value: "field2", label: "Field 2", required: false },
];

describe("MappingTable", () => {
  it("renders table headers", () => {
    render(
      <MappingTable
        preview={mockPreview}
        mapping={{}}
        expectedFields={mockExpectedFields}
        onMappingChange={vi.fn()}
      />
    );
    expect(screen.getByText("Colonne")).toBeTruthy();
    expect(screen.getByText("Aperçu")).toBeTruthy();
    expect(screen.getByText("Champ attendu")).toBeTruthy();
  });

  it("renders mapping rows", () => {
    render(
      <MappingTable
        preview={mockPreview}
        mapping={{}}
        expectedFields={mockExpectedFields}
        onMappingChange={vi.fn()}
      />
    );
    expect(screen.getByText("Col. 1")).toBeTruthy();
    expect(screen.getByText("Col. 2")).toBeTruthy();
  });

  it("renders sample values", () => {
    render(
      <MappingTable
        preview={mockPreview}
        mapping={{}}
        expectedFields={mockExpectedFields}
        onMappingChange={vi.fn()}
      />
    );
    expect(screen.getByText("a")).toBeTruthy();
    expect(screen.getByText("b")).toBeTruthy();
    expect(screen.getByText("c")).toBeTruthy();
    expect(screen.getByText("d")).toBeTruthy();
  });

  it("renders empty state when no preview", () => {
    render(
      <MappingTable
        preview={[]}
        mapping={{}}
        expectedFields={mockExpectedFields}
        onMappingChange={vi.fn()}
      />
    );
    expect(screen.queryByText("Col. 1")).toBeNull();
  });
});
