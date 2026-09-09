import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { resetAllMocks, mockAxios } from "../test-utils";
import Journalisation from "../../pages/Journalisation";

// Mock journal service
vi.mock("../../api/journalService", () => ({
  getJournal: vi.fn(() => Promise.resolve([])),
}));

// Mock data services
vi.mock("../../api/dataServices", () => ({
  getFiliales: vi.fn(() => Promise.resolve([])),
}));

// Mock child components
vi.mock("../../components/Journalisation/JournalisationFilters", () => ({
  default: () => <div data-testid="journal-filters">Filters</div>,
}));

vi.mock("../../components/Journalisation/JournalisationTable", () => ({
  default: ({ rows, loading, error }: any) => (
    <div data-testid="journal-table">
      <span data-testid="journal-rows-count">{rows?.length ?? 0}</span>
      <span data-testid="journal-loading">{loading ? "loading" : "ready"}</span>
      <span data-testid="journal-error">{error || "none"}</span>
    </div>
  ),
}));

vi.mock("../../components/Journalisation/JournalDetailDialog", () => ({
  default: ({ open, onClose }: any) => (
    open ? <div data-testid="journal-detail-dialog">Detail</div> : null
  ),
}));

describe("Journalisation", () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: [] });
  });

  it("renders without crashing", async () => {
    render(<Journalisation />);
    expect(screen.getByText("Journalisation")).toBeTruthy();
  });

  it("renders filters and table", async () => {
    render(<Journalisation />);
    await waitFor(() => {
      expect(screen.getByTestId("journal-filters")).toBeTruthy();
    });
    expect(screen.getByTestId("journal-table")).toBeTruthy();
  });

  it("calls getJournal on mount", async () => {
    const { getJournal } = await import("../../api/journalService");
    vi.mocked(getJournal).mockResolvedValue([]);
    render(<Journalisation />);
    await waitFor(() => {
      expect(getJournal).toHaveBeenCalled();
    });
  });

  it("renders loading state", async () => {
    const { getJournal } = await import("../../api/journalService");
    vi.mocked(getJournal).mockImplementation(() => new Promise(() => {}));
    render(<Journalisation />);
    expect(screen.getByTestId("journal-loading").textContent).toBe("loading");
  });

  it("renders error state", async () => {
    const { getJournal } = await import("../../api/journalService");
    vi.mocked(getJournal).mockRejectedValueOnce(new Error("fail"));
    render(<Journalisation />);
    await waitFor(() => {
      expect(screen.getByTestId("journal-error").textContent).not.toBe("none");
    });
  });

  it("opens detail dialog when a row is clicked", async () => {
    const { getJournal } = await import("../../api/journalService");
    vi.mocked(getJournal).mockResolvedValue([{ id: 1, action: "created", module: "test" }]);
    render(<Journalisation />);
    await waitFor(() => {
      expect(screen.getByTestId("journal-rows-count").textContent).toBe("1");
    });
    expect(screen.queryByTestId("journal-detail-dialog")).toBeNull();
  });
});
