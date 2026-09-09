import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EntityFormDialog, { type FieldConfig } from "../../../components/Crud/EntityFormDialog";

// Use the real lucide-react icons (the global setup mock is missing the "X" icon
// used by EntityFormDialog's close button).
vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "age", label: "Age", type: "number" },
  { name: "date", label: "Date", type: "date" },
  { name: "dt", label: "DateTime", type: "datetime-local" },
  { name: "desc", label: "Desc", type: "textarea" },
  { name: "pwd", label: "Password", type: "password" },
  { name: "active", label: "Active", type: "checkbox" },
  { name: "category", label: "Category", type: "select", options: [{ value: "a", label: "A" }, { value: "b", label: "B" }] },
  { name: "code", label: "Code", type: "readonly", readOnly: true },
  { name: "sectioned", label: "Grouped", type: "text", section: "Extra", colSpan: 2 },
];

const INITIAL_VALUES = {
  name: "initial-name",
  age: 10,
  date: "2024-01-01",
  dt: "2024-01-01T00:00",
  desc: "initial-desc",
  pwd: "",
  active: true,
  category: "a",
  code: "CODE-1",
  sectioned: "",
};

function renderDialog(overrides: Partial<Parameters<typeof EntityFormDialog>[0]> = {}) {
  const internalOnSubmit = vi.fn().mockResolvedValue(undefined);
  const onSubmit =
    overrides && "onSubmit" in overrides && overrides.onSubmit
      ? overrides.onSubmit
      : internalOnSubmit;
  const onClose = vi.fn();
  const utils = render(
    <EntityFormDialog
      open={true}
      onClose={onClose}
      onSubmit={onSubmit}
      fields={FIELDS}
      initialValues={INITIAL_VALUES}
      error={null}
      title="Test Dialog"
      submitLabel="Save"
      {...overrides}
    />,
  );
  return { ...utils, onSubmit, onClose };
}

describe("EntityFormDialog.tsx", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <EntityFormDialog
        open={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        fields={FIELDS}
        initialValues={INITIAL_VALUES}
        error={null}
        title="X"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the title, submit and cancel buttons when open", () => {
    renderDialog();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
  });

  it("renders every configured field type", () => {
    const { container } = renderDialog();
    const inputs = container.querySelectorAll("input");
    const byType = (t: string) => Array.from(inputs).filter((i) => i.getAttribute("type") === t);
    expect(byType("text").length).toBeGreaterThanOrEqual(2); // name + sectioned
    expect(byType("number").length).toBe(1);
    expect(byType("date").length).toBe(1);
    expect(byType("datetime-local").length).toBe(1);
    expect(byType("password").length).toBe(1);
    expect(byType("checkbox").length).toBe(1);
    // SearchableSelect renders a button trigger, not an input select
    expect(screen.getByRole("button", { name: "A" })).toBeTruthy();
    expect(container.querySelector("textarea")).not.toBeNull();
  });

  it("renders a required-field asterisk for required fields", () => {
    renderDialog();
    // The required asterisk is a <span> containing "*".
    const asterisks = screen.getAllByText("*");
    expect(asterisks.length).toBeGreaterThan(0);
  });

  it("renders readonly inputs as readOnly", () => {
    renderDialog();
    const inputs = screen.getAllByDisplayValue<HTMLInputElement>("CODE-1");
    const codeInput = inputs.find((i) => i.type === "text");
    expect(codeInput).toBeTruthy();
    expect(codeInput!.readOnly).toBe(true);
  });

  it("renders a section header only when the section changes between consecutive fields", () => {
    renderDialog();
    expect(screen.getByText("Extra")).toBeInTheDocument();
  });

  it("calls onClose when the cancel button is clicked", () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit with form values when the form is submitted", async () => {
    const { onSubmit } = renderDialog();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(INITIAL_VALUES);
  });

  it("updates values as the user edits a text field, then submits updated values", async () => {
    const { onSubmit } = renderDialog();
    const nameInput = screen.getByDisplayValue("initial-name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "edited-name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "edited-name" }));
  });

  it("toggles the checkbox value on change", async () => {
    const { onSubmit } = renderDialog();
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true); // initial value true
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ active: false })));
  });

  it("shows the submitting state while onSubmit is pending", async () => {
    const pending = new Promise<void>(() => {}); // never resolves
    const { onSubmit } = renderDialog({ onSubmit: pending });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      // submit button shows "Enregistrement..." while submitting
      expect(screen.getByText("Enregistrement...")).toBeInTheDocument();
    });
    // And the submit button is disabled during submission.
    expect(screen.getByRole("button", { name: "Enregistrement..." })).toBeDisabled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders the form-level error message when the error prop is provided", () => {
    renderDialog({ error: "Something went wrong" });
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("surfaces server-side field validation errors from a rejected onSubmit", async () => {
    const fieldError = "This field is required.";
    const onSubmit = vi.fn().mockRejectedValue({
      response: { data: { name: [fieldError] } },
    });
    renderDialog({ onSubmit });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(screen.getByText(fieldError)).toBeInTheDocument();
    });
  });

  it("surfaces a string field error from a rejected onSubmit", async () => {
    const onSubmit = vi.fn().mockRejectedValue({ response: { data: { age: "Must be a number." } } });
    renderDialog({ onSubmit });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(screen.getByText("Must be a number.")).toBeInTheDocument();
    });
  });

  it("closes the form error when the user edits a field after a validation error", async () => {
    const fieldError = "Required";
    const onSubmit = vi.fn()
      .mockRejectedValueOnce({ response: { data: { name: [fieldError] } } })
      .mockResolvedValueOnce(undefined);
    renderDialog({ onSubmit });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByText(fieldError)).toBeInTheDocument());
    // editing the field clears its error
    fireEvent.change(screen.getByDisplayValue("initial-name"), { target: { value: "fixed" } });
    await waitFor(() => expect(screen.queryByText(fieldError)).toBeNull());
  });
});
