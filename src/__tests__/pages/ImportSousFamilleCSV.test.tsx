import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { resetAllMocks, mockAxios } from "../test-utils";
import SousFamilleImportCsvPage from "../../pages/ImportSousFamilleCSV";

// Mock ImportCSV components
vi.mock("../../components/ImportCSV/UploadZone", () => ({
  default: ({ onFileSelected }: any) => (
    <div data-testid="upload-zone">
      <button onClick={() => onFileSelected(new File(["test"], "test.csv", { type: "text/csv" }))}>
        Upload
      </button>
    </div>
  ),
}));

vi.mock("../../components/ImportCSV/FileInformation", () => ({
  default: ({ file }: any) => (
    <div data-testid="file-information">{file.name}</div>
  ),
}));

vi.mock("../../components/ImportCSV/ImportStepper", () => ({
  default: ({ step }: any) => <div data-testid="import-stepper">Step {step}</div>,
}));

vi.mock("../../components/ImportCSV/MappingTable", () => ({
  default: ({ preview, mapping, onMappingChange }: any) => (
    <div data-testid="mapping-table">
      {preview.map((col: any) => (
        <div key={col.index}>
          <span>Col {col.index + 1}</span>
          <select onChange={(e) => onMappingChange(col.index, e.target.value)}>
            <option value="">Ignore</option>
            <option value="field1">Field 1</option>
          </select>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../../components/ImportCSV/MappingStatus", () => ({
  default: ({ missingRequired, ignoredColumns }: any) => (
    <div data-testid="mapping-status">
      Missing: {missingRequired.length}, Ignored: {ignoredColumns}
    </div>
  ),
}));

vi.mock("../../components/ImportCSV/ValidationProgress", () => ({
  default: ({ title, description }: any) => (
    <div data-testid="validation-progress">{title} {description}</div>
  ),
}));

vi.mock("../../components/ImportCSV/ValidationSummary", () => ({
  default: ({ summary }: any) => (
    <div data-testid="validation-summary">{summary.total_rows} total</div>
  ),
}));

vi.mock("../../components/ImportCSV/ValidationIssueTable", () => ({
  default: ({ issues, severity }: any) => (
    <div data-testid="validation-issue-table">{severity} {issues?.length ?? 0}</div>
  ),
}));

vi.mock("../../components/ImportCSV/ImportSuccess", () => ({
  default: ({ result }: any) => (
    <div data-testid="import-success">{result.message}</div>
  ),
}));

vi.mock("../../components/ImportCSV/ImportError", () => ({
  default: ({ message }: any) => (
    <div data-testid="import-error">{message}</div>
  ),
}));

// Mock theme components
vi.mock("../../theme/components", () => ({
  components: {
    card: "card",
    cardHeader: "card-header",
    pageDescription: "page-description",
    button: {
      primary: "btn-primary",
      primaryLarge: "btn-primary-large",
      secondary: "btn-secondary",
      successLarge: "btn-success-large",
      danger: "btn-danger",
    },
  },
}));

describe("ImportSousFamilleCSV", () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [] });
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it("renders without crashing", async () => {
    render(<SousFamilleImportCsvPage />);
    expect(screen.getByText("Sous Familles Matériel - Import Des Données")).toBeTruthy();
  });

  it("renders the upload zone in step 1", async () => {
    render(<SousFamilleImportCsvPage />);
    expect(screen.getByTestId("upload-zone")).toBeTruthy();
  });

  it("renders the stepper", async () => {
    render(<SousFamilleImportCsvPage />);
    expect(screen.getByTestId("import-stepper")).toBeTruthy();
  });

  it("does not require filiale selection to continue", async () => {
    render(<SousFamilleImportCsvPage />);
    fireEvent.click(screen.getByText("Upload"));
    await waitFor(() => {
      expect(screen.getByTestId("file-information")).toBeTruthy();
    });
  });
});
