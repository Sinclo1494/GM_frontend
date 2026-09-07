import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ValidationProgress from "../../../components/ImportCSV/ValidationProgress";

describe("ValidationProgress", () => {
  it("renders title", () => {
    render(<ValidationProgress title="Loading..." description="Please wait" />);
    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("renders description", () => {
    render(<ValidationProgress title="Loading..." description="Please wait" />);
    expect(screen.getByText("Please wait")).toBeTruthy();
  });

  it("renders without description", () => {
    render(<ValidationProgress title="Loading..." />);
    expect(screen.getByText("Loading...")).toBeTruthy();
    expect(screen.queryByText("Please wait")).toBeNull();
  });

  it("renders loading spinner", () => {
    render(<ValidationProgress title="Loading..." description="Please wait" />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });
});
