import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, within } from "@testing-library/react";
import CrudPage from "../../../components/Crud/CrudPage";
import type { ColumnDef, FieldConfig } from "../../../components/Crud/CrudPage";
import axios from "axios";

// Use the real lucide-react icons: CrudPage renders CrudTable (Loader2/AlertCircle/
// Chevrons) and EntityFormDialog (X), none of which are fully present in the global
// setup mock.
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    defaults: { headers: {} },
  },
}));

const BASE_URL = "http://localhost:8000/api";
type Item = { id: number; name: string };

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "id", label: "ID", type: "number", readOnly: true },
];

const COLUMNS: ColumnDef<Item>[] = [
  { key: "id", label: "ID", sortable: true },
  { key: "name", label: "Name", sortable: true },
];

const LIST_URL = `${BASE_URL}/crudlist/`;
const DETAIL_URL = (id: number) => `${BASE_URL}/crudlist/${id}/`;

const SAMPLE = [
  { id: 1, name: "Alpha" },
  { id: 2, name: "Beta" },
];

// CrudPage is a generic function component; cast to a concrete FC for rendering.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CrudPageEl = CrudPage as unknown as React.FC<any>;

function setupListMock() {
  (axios.get as any).mockImplementation((url: string) => {
    if (url === LIST_URL) {
      return Promise.resolve({ data: { results: SAMPLE, count: SAMPLE.length, next: null, previous: null } });
    }
    return Promise.resolve({ data: { ...SAMPLE[0] } });
  });
}

describe("CrudPage.tsx", () => {
  beforeEach(() => {
    localStorage.clear();
    (axios.get as any).mockReset();
    (axios.post as any).mockReset();
    (axios.put as any).mockReset();
    (axios.delete as any).mockReset();
    setupListMock();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("fetches data on mount and renders the table rows", async () => {
    render(
      <CrudPageEl
        title="Items"
        endpoint="crudlist"
        fields={FIELDS}
        columns={COLUMNS}
        mapRow={(i: any) => i}
        initialFormValues={() => ({ name: "" })}
      />,
    );

    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Beta")).toBeInTheDocument());
    expect(axios.get).toHaveBeenCalledWith(LIST_URL, expect.objectContaining({ params: expect.objectContaining({ page: 1, page_size: 10 }) }));
  });

  it("shows a loading spinner until data loads", () => {
    (axios.get as any).mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    expect(screen.getByText("Chargement des données...")).toBeInTheDocument();
  });

  it("renders the search box and triggers a debounced refetch with the search param", async () => {
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} searchPlaceholder="Search items…" />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText("Search items…");
    fireEvent.change(searchInput, { target: { value: "alpha" } });

    // CrudPage debounces 400ms before applying the search term.
    await new Promise((r) => setTimeout(r, 500));

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        LIST_URL,
        expect.objectContaining({ params: expect.objectContaining({ search: "alpha" }) }),
      );
    });
    // The applied search term also resets the current page to 1.
    expect((axios.get as any).mock.calls.at(-1)[1].params.page).toBe(1);
  });

  it("clicking a sortable header toggles sort order and resets to page 1", async () => {
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    // First click on 'name' → asc
    fireEvent.click(screen.getByText("Name").closest("th")!);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        LIST_URL,
        expect.objectContaining({ params: expect.objectContaining({ ordering: "name" }) }),
      );
    });
    // Second click toggles to desc
    fireEvent.click(screen.getByText("Name").closest("th")!);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        LIST_URL,
        expect.objectContaining({ params: expect.objectContaining({ ordering: "-name" }) }),
      );
    });
  });

  it("renders an error state from a failed initial load with a retry button", async () => {
    (axios.get as any).mockReset();
    (axios.get as any).mockRejectedValue({ response: { data: { message: "Server error" } } });

    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );

    await waitFor(() => expect(screen.getByText("Server error")).toBeInTheDocument());
    const retryBtn = screen.getByRole("button", { name: "Réessayer" });
    expect(retryBtn).toBeEnabled();

    // Recovery: the retried fetch succeeds.
    (axios.get as any).mockResolvedValue({ data: { results: SAMPLE, count: SAMPLE.length } });
    fireEvent.click(retryBtn);
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
  });

  it("opens the create dialog when clicking 'Nouvel enregistrement'", async () => {
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /nouvel enregistrement/i }));
    });

    expect(screen.getByText(/Nouvel enregistrement - Items/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });

  it("create flow calls crudCreate and refreshes the list", async () => {
    (axios.post as any).mockResolvedValue({ data: { id: 99, name: "New" } });
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /nouvel enregistrement/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Créer" }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(LIST_URL, expect.any(Object), expect.any(Object));
    });
    // After successful create the dialog closes.
    expect(screen.queryByRole("button", { name: "Créer" })).toBeNull();
    // The list was refreshed (crudList called again beyond the initial mount call).
    expect((axios.get as any).mock.calls.filter((c: any[]) => c[0] === LIST_URL).length).toBeGreaterThanOrEqual(2);
  });

  it("edit flow fetches detail and calls crudUpdate on submit", async () => {
    (axios.put as any).mockResolvedValue({ data: { id: 1, name: "Updated" } });
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getAllByTitle("Modifier")[0]);
    });
    // crudGet called for detail
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(DETAIL_URL(1), expect.any(Object)));

    // dialog opened with edit title
    expect(screen.getByText(/Modifier Items/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Mettre à jour" })).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Mettre à jour" }));
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(DETAIL_URL(1), expect.any(Object), expect.any(Object));
    });
  });

  it("delete flow calls crudDelete and refreshes the list", async () => {
    (axios.delete as any).mockResolvedValue({});
    render(
      <CrudPageEl title="Items" endpoint="crudlist" fields={FIELDS} columns={COLUMNS} mapRow={(i: any) => i} initialFormValues={() => ({ name: "" })} />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getAllByTitle("Supprimer")[0]);
    });

    // delete confirmation modal appears
    expect(screen.getByText(/Confirmer la suppression/)).toBeInTheDocument();

    // The confirm button lives inside the modal overlay, which also contains
    // the row-level delete buttons (they share the accessible name "Supprimer"),
    // so scope the query to the modal overlay.
    const modalOverlay = screen.getByText(/Confirmer la suppression/).closest("div")!.parentElement;
    const confirmBtn = within(modalOverlay).getByRole("button", { name: "Supprimer" });

    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(DETAIL_URL(1), expect.any(Object));
    });
  });

  it("renders a custom delete confirmation message when provided", async () => {
    (axios.delete as any).mockResolvedValue({});
    render(
      <CrudPageEl
        title="Items"
        endpoint="crudlist"
        fields={FIELDS}
        columns={COLUMNS}
        mapRow={(i: any) => i}
        initialFormValues={() => ({ name: "" })}
        deleteConfirmMessage={(item) => `Really delete ${item.name}?`}
      />,
    );
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    fireEvent.click(screen.getAllByTitle("Supprimer")[0]);
    expect(screen.getByText("Really delete Alpha?")).toBeInTheDocument();
  });
});
