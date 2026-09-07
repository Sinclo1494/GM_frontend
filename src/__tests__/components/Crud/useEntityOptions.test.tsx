import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { useEntityOptions } from "../../../components/Crud/useEntityOptions";
import axios from "axios";

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

// Hook probe component
type Item = { id: number; title: string };
function OptionsProbe({ endpoint = "categories", valueKey = "id", labelKey = "title", params }: any) {
  const { options, loading, error } = useEntityOptions<Item>(endpoint, valueKey, labelKey, params);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? "none"}</span>
      <span data-testid="count">{options.length}</span>
      <span data-testid="first-value">{options[0]?.value ?? "none"}</span>
      <span data-testid="first-label">{options[0]?.label ?? "none"}</span>
    </div>
  );
}

describe("useEntityOptions.ts", () => {
  beforeEach(() => {
    (axios.get as any).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts in a loading state", () => {
    (axios.get as any).mockReturnValue(new Promise(() => {})); // never resolves
    render(<OptionsProbe />);
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("fetches options on mount and maps them to {value,label}", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        results: [
          { id: 1, title: "Alpha" },
          { id: 2, title: "Beta" },
        ],
        count: 2,
      },
    });

    render(<OptionsProbe endpoint="categories" />);

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("first-value").textContent).toBe("1");
    expect(screen.getByTestId("first-label").textContent).toBe("Alpha");
    // crudOptions requests the endpoint with page_size: 1000 + auth headers
    expect(axios.get).toHaveBeenCalledWith(
      `${BASE_URL}/categories/`,
      expect.objectContaining({
        params: expect.objectContaining({ page_size: 1000 }),
      }),
    );
  });

  it("passes through extra params merged with page_size", async () => {
    (axios.get as any).mockResolvedValue({ data: { results: [{ id: 1, title: "A" }], count: 1 } });
    render(<OptionsProbe endpoint="familles" params={{ type: "gm" }} />);
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(axios.get).toHaveBeenCalledWith(
      `${BASE_URL}/familles/`,
      expect.objectContaining({
        params: expect.objectContaining({ type: "gm", page_size: 1000 }),
      }),
    );
  });

  it("sets error and stops loading when the request fails", async () => {
    (axios.get as any).mockRejectedValue(new Error("Network down"));
    render(<OptionsProbe endpoint="fail" />);
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("error").textContent).toBe("Network down");
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("refetches when the endpoint dependency changes", async () => {
    (axios.get as any).mockResolvedValue({ data: { results: [], count: 0 } });
    const { rerender } = render(<OptionsProbe endpoint="items" />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    rerender(<OptionsProbe endpoint="other" />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get).toHaveBeenLastCalledWith(
      `${BASE_URL}/other/`,
      expect.any(Object),
    );
  });

  it("refetches when valueKey/labelKey change", async () => {
    (axios.get as any).mockResolvedValue({ data: { results: [{ id: 1, title: "A" }], count: 1 } });
    const { rerender } = render(<OptionsProbe endpoint="x" valueKey="id" labelKey="title" />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    rerender(<OptionsProbe endpoint="x" valueKey="title" labelKey="id" />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  });

  it("does not perform a state update after unmount (no throw)", async () => {
    let resolveFetch: (val: any) => void;
    const pending = new Promise((res) => {
      resolveFetch = res;
    });
    (axios.get as any).mockReturnValue(pending);

    const { unmount } = render(<OptionsProbe endpoint="x" />);
    unmount();
    // Resolving after unmount should not throw or attempt setState on unmounted component.
    await act(async () => {
      resolveFetch!({ data: { results: [{ id: 1, title: "A" }], count: 1 } });
      await Promise.resolve();
    });
  });

  it("clears stale options/error state when refetching on param change", async () => {
    (axios.get as any).mockResolvedValueOnce({ data: { results: [{ id: 1, title: "A" }], count: 1 } });
    (axios.get as any).mockRejectedValueOnce(new Error("fail-2"));

    const { rerender } = render(<OptionsProbe endpoint="x" params={{ a: "1" }} />);
    await waitFor(() => expect(screen.getByTestId("count").textContent).toBe("1"));

    rerender(<OptionsProbe endpoint="x" params={{ a: "2" }} />);
    await waitFor(() => expect(screen.getByTestId("error").textContent).toBe("fail-2"));
  });
});
