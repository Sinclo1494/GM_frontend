import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FileInformation from "../../../components/ImportCSV/FileInformation";

describe("FileInformation", () => {
  it("renders file name", () => {
    const file = new File(["content"], "test.csv", { type: "text/csv" });
    render(<FileInformation file={file} />);
    expect(screen.getByText("test.csv")).toBeTruthy();
  });

  it("renders file size in KB for small files", () => {
    const file = new File(["content"], "small.csv", { type: "text/csv" });
    render(<FileInformation file={file} />);
    expect(screen.getByText(/Taille :/)).toBeTruthy();
    expect(screen.getByText(/KB/)).toBeTruthy();
  });

  it("renders file size in MB for large files", () => {
    const content = new Array(2 * 1024 * 1024).fill("a").join("");
    const file = new File([content], "large.csv", { type: "text/csv" });
    render(<FileInformation file={file} />);
    expect(screen.getByText(/MB/)).toBeTruthy();
  });
});
