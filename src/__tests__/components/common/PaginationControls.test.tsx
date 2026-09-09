import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PaginationControls from "../../../components/common/PaginationControls";

describe("PaginationControls.tsx", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    itemsPerPage: 10,
    onPageChange: vi.fn(),
    onItemsPerPageChange: vi.fn(),
  };

  it("renders previous/next buttons, page numbers and items-per-page select", () => {
    render(<PaginationControls {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
    // With 10 pages (>7) the first/last page buttons render.
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    // Items per page select renders the size options.
    expect(screen.getByText("Lignes :")).toBeInTheDocument();
  });

  it("disables the previous button on the first page", () => {
    render(<PaginationControls {...defaultProps} currentPage={1} />);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
  });

  it("disables the next button on the last page", () => {
    render(<PaginationControls {...defaultProps} currentPage={10} totalPages={10} />);
    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
  });

  it("calls onPageChange with currentPage-1 when clicking Précédent", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with currentPage+1 when clicking Suivant", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} currentPage={5} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Suivant" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("clamps navigation within [1, totalPages]", () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls {...defaultProps} currentPage={2} totalPages={3} onPageChange={onPageChange} />,
    );
    // Previous on page 2 -> max(1, 2-1) = 1
    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    // Next on page 2 of 3 -> min(3, 2+1) = 3
    fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("calls onPageChange with the clicked page number", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onItemsPerPageChange with the selected size", () => {
    const onItemsPerPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} onItemsPerPageChange={onItemsPerPageChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "50" } });
    expect(onItemsPerPageChange).toHaveBeenCalledWith(50);
  });

  it("disables all navigation buttons while loading", () => {
    render(<PaginationControls {...defaultProps} loading={true} currentPage={3} />);
    expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
    // page buttons also disabled while loading
    expect(screen.getByRole("button", { name: "1" })).toBeDisabled();
  });

  it("renders nothing when totalPages <= 1 and showItemCount is false", () => {
    const { container } = render(<PaginationControls {...defaultProps} totalPages={1} totalItems={1} showItemCount={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("still renders when totalPages <= 1 but showItemCount defaults to true", () => {
    render(<PaginationControls {...defaultProps} totalPages={1} totalItems={1} />);
    // Item count text "Affichage de 1 à 1 sur 1 résultat"
    expect(screen.getByText(/Affichage de/)).toBeInTheDocument();
  });

  it("displays 'Aucun résultat' when totalItems is 0", () => {
    render(<PaginationControls {...defaultProps} totalItems={0} totalPages={0} currentPage={1} />);
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("renders the item count range correctly", () => {
    render(<PaginationControls {...defaultProps} currentPage={2} itemsPerPage={20} totalItems={50} />);
    // startIdx = (2-1)*20+1 = 21; endIdx = min(2*20, 50) = 40
    const text = screen.getByText(/Affichage de/).textContent;
    expect(text).toContain("21");
    expect(text).toContain("40");
    expect(text).toContain("50");
  });

  it("renders ellipsis markers when totalPages exceeds the small-window threshold (7)", () => {
    render(<PaginationControls {...defaultProps} currentPage={5} totalPages={20} />);
    // With 20 pages, ellipsis '...' separators render.
    const ellipsis = screen.getAllByText("...");
    expect(ellipsis.length).toBeGreaterThanOrEqual(2);
    // First and last pages still render.
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "20" })).toBeInTheDocument();
  });

  it("highlights the current page with the active styling", () => {
    render(<PaginationControls {...defaultProps} currentPage={3} totalPages={10} />);
    const active = screen.getByRole("button", { name: "3" });
    // active button has the blue background classes.
    expect(active.className).toContain("bg-blue-600");
    expect(active.className).toContain("text-white");
  });

  it("uses a 1-based page window around the current page for large result sets", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls {...defaultProps} currentPage={5} totalPages={20} onPageChange={onPageChange} />);
    // Current window should include pages 4, 5, 6 (currentPage-1, current, current+1)
    expect(screen.getByRole("button", { name: "4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
  });
});
