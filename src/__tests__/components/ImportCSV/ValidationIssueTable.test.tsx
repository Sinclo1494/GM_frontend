import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ValidationIssueTable from "../../../components/ImportCSV/ValidationIssueTable";

const mockIssues = [
  { line: 1, field: "name", value: "", message: "Required field missing" },
  { line: 2, field: "age", value: "abc", message: "Invalid number" },
];

describe("ValidationIssueTable", () => {
  it("renders error title for errors", () => {
    render(<ValidationIssueTable issues={mockIssues} severity="error" />);
    expect(screen.getByText("Erreurs (2/2)")).toBeTruthy();
  });

  it("renders warning title for warnings", () => {
    render(<ValidationIssueTable issues={mockIssues} severity="warning" />);
    expect(screen.getByText("Avertissements (2/2)")).toBeTruthy();
  });

  it("renders issue rows", () => {
    render(<ValidationIssueTable issues={mockIssues} severity="error" />);
    expect(screen.getByText("Required field missing")).toBeTruthy();
    expect(screen.getByText("Invalid number")).toBeTruthy();
  });

  it("renders empty state when no issues", () => {
    render(<ValidationIssueTable issues={[]} severity="error" />);
    expect(screen.getByText("✓ Aucun problème.")).toBeTruthy();
  });

  it("renders issue count badge", () => {
    render(<ValidationIssueTable issues={mockIssues} severity="error" />);
    expect(screen.getByText("Bloquantes")).toBeTruthy();
  });

  it("renders issue line numbers", () => {
    render(<ValidationIssueTable issues={mockIssues} severity="error" />);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
  });
});
