import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MappingRow from "../../../components/ImportCSV/MappingRow";

const mockColumn = {
  index: 0,
  samples: ["value1", "value2", "value3"],
};

const mockExpectedFields = [
  { value: "field1", label: "Field 1", required: true },
  { value: "field2", label: "Field 2", required: false },
];

describe("MappingRow", () => {
  it("renders column index", () => {
    render(
      <MappingRow
        column={mockColumn}
        selectedField=""
        usedFields={[]}
        expectedFields={mockExpectedFields}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("Col. 1")).toBeTruthy();
  });

  it("renders sample values", () => {
    render(
      <MappingRow
        column={mockColumn}
        selectedField=""
        usedFields={[]}
        expectedFields={mockExpectedFields}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("value1")).toBeTruthy();
    expect(screen.getByText("value2")).toBeTruthy();
    expect(screen.getByText("value3")).toBeTruthy();
  });

  it("renders field options", () => {
    render(
      <MappingRow
        column={mockColumn}
        selectedField=""
        usedFields={[]}
        expectedFields={mockExpectedFields}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText("Field 1 *")).toBeTruthy();
    expect(screen.getByText("Field 2")).toBeTruthy();
  });

  it("calls onChange when selection changes", () => {
    const onChange = vi.fn();
    render(
      <MappingRow
        column={mockColumn}
        selectedField=""
        usedFields={[]}
        expectedFields={mockExpectedFields}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "field1" } });
    expect(onChange).toHaveBeenCalledWith(0, "field1");
  });

  it("disables already used fields", () => {
    render(
      <MappingRow
        column={mockColumn}
        selectedField=""
        usedFields={["field1"]}
        expectedFields={mockExpectedFields}
        onChange={vi.fn()}
      />
    );
    const select = screen.getByRole("combobox");
    const options = select.querySelectorAll("option");
    const field1Option = Array.from(options).find((o) => o.value === "field1");
    expect(field1Option?.hasAttribute("disabled")).toBe(true);
  });
});
