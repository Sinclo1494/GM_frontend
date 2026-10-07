import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HealthBar from "../../../../components/dashboard/v2/HealthBar";

describe("components/dashboard/v2/HealthBar", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
  });

  it("renders the four tile labels", () => {
    render(<HealthBar kpis={{}} />);
    expect(screen.getByText("Parc total")).toBeDefined();
    expect(screen.getByText("Disponibilité")).toBeDefined();
    expect(screen.getByText("Rendement")).toBeDefined();
    // The margin tile is displayed in millions of DA.
    expect(screen.getByText("Marge (M DA)")).toBeDefined();
  });

  it("applies the success color class when the ratio is at/above target", () => {
    render(<HealthBar kpis={{ disponibilite: 90, rendement: 70, marge: 100 }} />);
    // Disponibilite >= 85 -> green, Rendement >= 60 -> green, Marge >= 0 -> green.
    const values = screen.getAllByText(/%|DA/);
    const green = values.filter((el) =>
      el.className.includes("text-green-600"),
    );
    expect(green.length).toBeGreaterThan(0);
  });

  it("applies the danger color class when the ratio is below target", () => {
    render(<HealthBar kpis={{ disponibilite: 50, rendement: 10, marge: -5 }} />);
    const red = screen
      .getAllByText(/%|DA/)
      .filter((el) => el.className.includes("text-red-600"));
    expect(red.length).toBeGreaterThan(0);
  });
});