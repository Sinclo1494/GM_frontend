import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchableSelect from "../../../components/common/SearchableSelect";
import type { SelectOption } from "../../../components/common/SearchableSelect";

// Use the real lucide-react icons (the global setup mock only stubs a subset).
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const OPTIONS: SelectOption[] = [
  { value: "1", label: "Alpha" },
  { value: "2", label: "Beta" },
  { value: "3", label: "Gamma" },
];

describe("SearchableSelect.tsx", () => {
  it("renders the placeholder when no value is selected", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} placeholder="Pick one…" />);
    expect(screen.getByText("Pick one…")).toBeInTheDocument();
  });

  it("renders the selected option's label when a value is set", () => {
    render(<SearchableSelect value="2" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders the placeholder when the value does not match any option", () => {
    render(<SearchableSelect value="999" onChange={vi.fn()} options={OPTIONS} placeholder="Sélectionner…" />);
    expect(screen.getByText("Sélectionner…")).toBeInTheDocument();
  });

  it("opens the dropdown showing all options on button click", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Rechercher...")).toBeInTheDocument();
  });

  it("calls onChange with the selected value and closes the dropdown", () => {
    const onChange = vi.fn();
    render(<SearchableSelect value="" onChange={onChange} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("Beta"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("2");
    // dropdown closed after selection
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("filters options by the search input (case-insensitive)", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByPlaceholderText("Rechercher..."), { target: { value: "be" } });
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();
    expect(screen.queryByText("Gamma")).toBeNull();
  });

  it("shows 'Aucun résultat' when the search matches no options", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByPlaceholderText("Rechercher..."), { target: { value: "zzz" } });
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("closes the dropdown and clears the search on click outside", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("does not open the dropdown when disabled", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} disabled={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    fireEvent.click(button);
    // clicking a disabled button does not open the dropdown
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("highlights the currently selected option in the dropdown", () => {
    render(<SearchableSelect value="1" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button"));
    // The selected option div carries the bg-blue-100 highlight class;
    // the trigger also shows the label text, so pick the highlighted one.
    const highlighted = screen
      .getAllByText("Alpha")
      .find((el) => el.className.includes("bg-blue-100"));
    expect(highlighted).toBeTruthy();
  });

  it("applies error styling on the trigger when error is true", () => {
    const { container } = render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} error={true} />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border-red-300");
  });

  it("toggles closed when reopening after it was open (search resets)", () => {
    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);
    const button = screen.getByRole("button");
    fireEvent.click(button); // open
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    fireEvent.click(button); // close (search reset)
    expect(screen.queryByText("Alpha")).toBeNull();
    fireEvent.click(button); // open again
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });
});
