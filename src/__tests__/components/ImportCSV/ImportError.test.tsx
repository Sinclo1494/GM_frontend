import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ImportError from "../../../components/ImportCSV/ImportError";

describe("ImportError", () => {
  it("renders error message", () => {
    render(<ImportError message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("renders failure title", () => {
    render(<ImportError message="Test error" />);
    expect(screen.getByText("Échec de l'import")).toBeTruthy();
  });
});
