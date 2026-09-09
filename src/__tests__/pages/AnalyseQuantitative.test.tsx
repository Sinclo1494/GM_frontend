import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { resetAllMocks, mockAxios } from "../test-utils";
import AnalyseQuantitative from "../../pages/AnalyseQuantitative";

// Mock data services
vi.mock("../../api/dataServices", () => ({
  getAQTP: vi.fn(),
  getAQTPR: vi.fn(),
  getFiliales: vi.fn(() => Promise.resolve([])),
}));

// Mock child components
vi.mock("../../components/AnalyseQuantitative/AnalyseQuantitativeResume", () => ({
  default: () => <div data-testid="aq-resume">Resume</div>,
}));

vi.mock("../../components/AnalyseQuantitative/AnalyseQuantitativeTable", () => ({
  default: ({ rows, loading }: any) => (
    <div data-testid="aq-table">
      <span data-testid="aq-table-rows">{rows?.length ?? 0}</span>
      <span data-testid="aq-table-loading">{loading ? "loading" : "ready"}</span>
    </div>
  ),
}));

// Mock exportPDF
vi.mock("../../utils/exportPDF", () => ({
  exportAnalyseQuantitative: vi.fn(),
}));

// Mock theme components
vi.mock("../../theme/components", () => ({
  components: {
    pageTitle: "page-title",
    pageDescription: "page-description",
    card: "card",
    label: "label",
    select: "select",
    input: "input",
    button: {
      primary: "btn-primary",
      success: "btn-success",
    },
  },
}));

describe("AnalyseQuantitative", () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [] });
  });

  it("renders without crashing", async () => {
    render(<AnalyseQuantitative />);
    expect(screen.getByText("Analyse Quantitative")).toBeTruthy();
  });

  it("renders filter controls", async () => {
    render(<AnalyseQuantitative />);
    expect(screen.getByText("Filiale")).toBeTruthy();
    expect(screen.getByText("Date début")).toBeTruthy();
    expect(screen.getByText("Date fin")).toBeTruthy();
    expect(screen.getByText("Calculate")).toBeTruthy();
    expect(screen.getByText("Export PDF")).toBeTruthy();
  });

  it("renders empty state when no data", async () => {
    render(<AnalyseQuantitative />);
    await waitFor(() => {
      expect(screen.getByText("Analyse Quantitative")).toBeTruthy();
    });
    expect(screen.queryByTestId("aq-resume")).toBeNull();
  });

  it("calls getFiliales on mount", async () => {
    const { getFiliales } = await import("../../api/dataServices");
    vi.mocked(getFiliales).mockResolvedValue([]);
    render(<AnalyseQuantitative />);
    await waitFor(() => {
      expect(getFiliales).toHaveBeenCalled();
    });
  });
});
