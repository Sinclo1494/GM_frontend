import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DonutChart from "../../../../components/dashboard/v2/DonutChart";

vi.mock("react-chartjs-2", () => ({
  Chart: (props: Record<string, unknown>) => (
    <div data-testid="chartjs-stub" data-data={JSON.stringify(props.data ?? null)}>
      ChartStub
    </div>
  ),
  Doughnut: (props: Record<string, unknown>) => (
    <div data-testid="doughnut-stub" data-data={JSON.stringify(props.data ?? null)}>
      DoughnutStub
    </div>
  ),
}));

describe("components/dashboard/v2/DonutChart", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
  });

  it("renders the Doughnut chart", () => {
    render(
      <DonutChart
        data={{ labels: ["A", "B"], values: [10, 20] }}
      />,
    );
    expect(screen.getByTestId("doughnut-stub")).toBeDefined();
  });

  it("renders the center label value", () => {
    render(
      <DonutChart
        data={{ labels: ["A", "B"], values: [10, 20] }}
        centerLabel="42.5%"
      />,
    );
    expect(screen.getByText("42.5%")).toBeDefined();
  });

  it("computes the total from the values", () => {
    render(
      <DonutChart
        data={{ labels: ["A", "B"], values: [10, 20] }}
        centerLabel="total"
      />,
    );
    const stub = screen.getByTestId("doughnut-stub");
    const parsed = JSON.parse(stub.getAttribute("data-data") ?? "null");
    expect(parsed.datasets[0].data).toEqual([10, 20]);
  });
});