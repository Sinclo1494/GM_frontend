import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ImportSuccess from "../../../components/ImportCSV/ImportSuccess";

describe("ImportSuccess", () => {
  it("renders success title", () => {
    render(<ImportSuccess result={{ message: "Done", imported_rows: 5 }} />);
    expect(screen.getByText("Import terminé")).toBeTruthy();
  });

  it("renders result message when provided", () => {
    render(<ImportSuccess result={{ message: "Custom success", imported_rows: 5 }} />);
    expect(screen.getByText("Custom success")).toBeTruthy();
  });

  it("renders default message when no custom message", () => {
    render(<ImportSuccess result={{ imported_rows: 3 }} />);
    expect(screen.getByText("3 ligne(s) importée(s) avec succès.")).toBeTruthy();
  });
});
