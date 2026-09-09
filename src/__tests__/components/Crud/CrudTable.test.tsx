import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CrudTable, { type ColumnDef } from "../../../components/Crud/CrudTable";

// Use the real lucide-react icons (the global setup mock only stubs a subset,
// which is missing Loader2/AlertCircle/ChevronUp/ChevronDown used by CrudTable).
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

type Item = { id: number; name: string; age: number };

const columns: ColumnDef<Item>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
  { key: "age", label: "Age", sortable: false },
  {
    key: "badge",
    label: "Badge",
    sortable: false,
    render: (value) => <span data-testid="badge-cell">{String(value)}</span>,
  },
];

const DATA: Item[] = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
];

const baseProps = {
  columns,
  data: DATA,
  loading: false,
  error: null,
  searchTerm: "",
  onSearchChange: vi.fn(),
  sortField: null,
  sortOrder: "asc" as const,
  onSort: vi.fn(),
  currentPage: 1,
  onPageChange: vi.fn(),
  itemsPerPage: 10,
  onItemsPerPageChange: vi.fn(),
  onRetry: vi.fn(),
  totalItems: 50,
};

describe("CrudTable.tsx", () => {
  it("renders a header cell for every column plus an Actions header when actions are provided", () => {
    render(<CrudTable {...baseProps} actions={() => <button data-testid="row-action">act</button>} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Badge")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("renders one row per data item with their cell values", () => {
    render(<CrudTable {...baseProps} />);
    // The badge render function produces one cell per row (value is undefined -> "undefined").
    expect(screen.getAllByTestId("badge-cell")).toHaveLength(2);
    // name column renders String(row.name)
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bob").length).toBeGreaterThan(0);
    expect(screen.getAllByText("30").length).toBeGreaterThan(0);
  });

  it("renders an empty-message row when data is empty and not loading/error", () => {
    render(<CrudTable {...baseProps} data={[]} totalItems={0} />);
    expect(screen.getByText("Aucun résultat trouvé")).toBeInTheDocument();
  });

  it("renders a custom empty message when provided", () => {
    render(<CrudTable {...baseProps} data={[]} totalItems={0} emptyMessage="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders the loading spinner when loading and no data", () => {
    render(<CrudTable {...baseProps} data={[]} loading={true} totalItems={0} />);
    expect(screen.getByText("Chargement des données...")).toBeInTheDocument();
  });

  it("continues to render data rows while loading=true if data already exists", () => {
    render(<CrudTable {...baseProps} loading={true} />);
    // Data rows remain visible even during a background loading state.
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
  });

  it("renders the error row with a retry button when error is set and not loading", () => {
    render(<CrudTable {...baseProps} data={[]} error="Boom" loading={false} />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });

  it("clicking Réessayer calls onRetry", () => {
    render(<CrudTable {...baseProps} data={[]} error="Boom" />);
    fireEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(baseProps.onRetry).toHaveBeenCalled();
  });

  describe("sorting", () => {
    it("clicking a sortable header calls onSort with the column key", () => {
      render(<CrudTable {...baseProps} />);
      const th = screen.getByText("Name").closest("th");
      fireEvent.click(th!);
      expect(baseProps.onSort).toHaveBeenCalledWith("name");
    });

    it("clicking a non-sortable header does not call onSort", () => {
      render(<CrudTable {...baseProps} />);
      const th = screen.getByText("Age").closest("th");
      fireEvent.click(th!);
      expect(baseProps.onSort).not.toHaveBeenCalled();
    });

    it("shows an up chevron for an ascending-sorted column", () => {
      render(<CrudTable {...baseProps} sortField="name" sortOrder="asc" />);
      // The sorted column's SortIcon renders a ChevronUp.
      const th = screen.getByText("Name").closest("th");
      expect(th!.querySelector("svg")).not.toBeNull();
    });

    it("shows a down chevron for a descending-sorted column", () => {
      render(<CrudTable {...baseProps} sortField="name" sortOrder="desc" />);
      const th = screen.getByText("Name").closest("th");
      expect(th!.querySelector("svg")).not.toBeNull();
    });

    it("renders a neutral placeholder for unsorted columns", () => {
      render(<CrudTable {...baseProps} sortField="name" />);
      const th = screen.getByText("ID").closest("th");
      // Unsorted SortIcon renders a gray placeholder div (class text-gray-300), not a chevron svg.
      expect(th!.querySelector(".text-gray-300")).not.toBeNull();
    });
  });

  describe("search", () => {
    it("calls onSearchChange when typing in the search input", () => {
      render(<CrudTable {...baseProps} />);
      const input = screen.getByPlaceholderText("Rechercher...");
      fireEvent.change(input, { target: { value: "hello" } });
      expect(baseProps.onSearchChange).toHaveBeenCalledWith("hello");
    });

    it("displays the current searchTerm in the input", () => {
      render(<CrudTable {...baseProps} searchTerm="abc" />);
      expect(screen.getByPlaceholderText("Rechercher...")).toHaveValue("abc");
    });
  });

  describe("items per page", () => {
    it("calls onItemsPerPageChange AND onPageChange(1) when the size changes", () => {
      render(<CrudTable {...baseProps} />);
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "50" } });
      expect(baseProps.onItemsPerPageChange).toHaveBeenCalledWith(50);
      expect(baseProps.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("pagination controls", () => {
    it("renders pagination when totalPages > 1", () => {
      render(<CrudTable {...baseProps} totalItems={50} itemsPerPage={10} currentPage={1} />);
      expect(screen.getByRole("button", { name: "Précédent" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "5" })).toBeInTheDocument();
    });

    it("disables Précédent on the first page", () => {
      render(<CrudTable {...baseProps} totalItems={50} itemsPerPage={10} currentPage={1} />);
      expect(screen.getByRole("button", { name: "Précédent" })).toBeDisabled();
    });

    it("disables Suivant on the last page", () => {
      render(<CrudTable {...baseProps} totalItems={50} itemsPerPage={10} currentPage={5} />);
      expect(screen.getByRole("button", { name: "Suivant" })).toBeDisabled();
    });

    it("calls onPageChange with the next/previous page", () => {
      render(<CrudTable {...baseProps} totalItems={50} itemsPerPage={10} currentPage={2} />);
      fireEvent.click(screen.getByRole("button", { name: "Suivant" }));
      expect(baseProps.onPageChange).toHaveBeenCalledWith(3);
      fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
      expect(baseProps.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  describe("row actions", () => {
    it("renders actions content for every row", () => {
      const actions = vi.fn(() => <button data-testid="row-action">act</button>);
      render(<CrudTable {...baseProps} actions={actions} />);
      expect(screen.getAllByTestId("row-action")).toHaveLength(2);
      expect(actions).toHaveBeenCalledTimes(2);
    });
  });

  describe("item count summary", () => {
    it("renders the 'Affichage de … sur … résultats' summary", () => {
      render(<CrudTable {...baseProps} totalItems={25} itemsPerPage={10} currentPage={2} />);
      // startIdx=(2-1)*10=10 -> "11 à 20 sur 25 résultats"
      const summary = screen.getByText(/Affichage de/);
      expect(summary).toHaveTextContent("11");
      expect(summary).toHaveTextContent("20");
      expect(summary).toHaveTextContent("25");
    });
  });
});
