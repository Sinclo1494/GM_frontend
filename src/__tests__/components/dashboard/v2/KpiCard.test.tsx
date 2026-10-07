import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import KpiCard from "../../../../components/dashboard/v2/KpiCard";

describe("components/dashboard/v2/KpiCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
  });

  it("renders the value text", () => {
    render(<KpiCard title="Parc total" value={1234} />);
    expect(screen.getByText("1234")).toBeDefined();
  });

  it("renders string values verbatim", () => {
    render(<KpiCard title="Taux" value="42.5%" />);
    expect(screen.getByText("42.5%")).toBeDefined();
  });

  it("applies the red top-border class when status is danger", () => {
    const { container } = render(
      <KpiCard title="En panne" value={5} status="danger" />,
    );
    expect(container.querySelector(".bg-red-500")).not.toBeNull();
  });

  it("applies the green top-border class when status is success", () => {
    const { container } = render(
      <KpiCard title="En service" value={100} status="success" />,
    );
    expect(container.querySelector(".bg-green-500")).not.toBeNull();
  });

  it("does not render a status bar when status is omitted", () => {
    const { container } = render(
      <KpiCard title="Titre" value={1} />,
    );
    expect(container.querySelector(".absolute.top-0")).toBeNull();
  });
});