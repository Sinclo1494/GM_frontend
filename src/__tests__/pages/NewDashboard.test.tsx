import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DashboardFiltersProvider } from "../../context/DashboardFiltersContext";
import NewDashboard from "../../pages/NewDashboard";

// Mock the lazy-loaded screens so they resolve synchronously without importing
// the full v2 screen module graph (which itself pulls in chartjs, etc.).
vi.mock("../../components/dashboard/v2/screens/ApercuScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));
vi.mock("../../components/dashboard/v2/screens/DisponibiliteScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));
vi.mock("../../components/dashboard/v2/screens/MaintenanceScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));
vi.mock("../../components/dashboard/v2/screens/RendementScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));
vi.mock("../../components/dashboard/v2/screens/FinancesScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));
vi.mock("../../components/dashboard/v2/screens/ParcScreen", () => ({
  __esModule: true,
  default: () => <div>ScreenStub</div>,
}));

vi.mock("../../api/dashboardV2Services", () => ({
  getDashboardV2Overview: vi.fn(),
  getDashboardV2Filiales: vi.fn().mockResolvedValue([]),
  getDashboardV2Familles: vi.fn().mockResolvedValue([]),
}));

import { getDashboardV2Overview } from "../../api/dashboardV2Services";

const mockOverview = vi.mocked(getDashboardV2Overview);

const overview = {
  globalKpis: {
    parc_total: 10,
    en_service: 8,
    en_chomage: 1,
    en_panne: 1,
    immobilise_base: 0,
    alrem: 0,
    age_moyen: 5,
  },
  maintenanceKpis: {
    tamd: 80,
    tam: 65,
    tip: 15,
    note: "",
    en_panne: 1,
    en_reparation: 0,
    taux_service: 42,
    taux_panne: 5,
    disponibilite: 90,
    potentiel_total: 1000,
    heures_service: 420,
    heures_chomage: 80,
    heures_panne: 50,
  },
  financialKpis: {
    totalFacture: 1000,
    factService: 800,
    factChomage: 150,
    factPanne: 50,
    manqueAGagner: 0,
    caPotentiel: 1000,
    totalRegularisation: 200,
    marge: 600,
    ecartCibleMag: 0,
  },
  alerts: [],
  recentActivity: [],
};

describe("pages/NewDashboard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8000");
    mockOverview.mockResolvedValue(overview);
  });

  it("renders the Dashboard V2 title", async () => {
    render(
      <MemoryRouter>
        <DashboardFiltersProvider>
          <NewDashboard />
        </DashboardFiltersProvider>
      </MemoryRouter>,
    );
    await waitFor(
      () => {
        expect(screen.getByText("Dashboard V2")).toBeDefined();
      },
      { timeout: 15000 },
    );
  }, 20000);

  it("renders the six main tab labels", async () => {
    render(
      <MemoryRouter>
        <DashboardFiltersProvider>
          <NewDashboard />
        </DashboardFiltersProvider>
      </MemoryRouter>,
    );
    await waitFor(
      () => {
        expect(screen.getByText("APERÇU")).toBeDefined();
      },
      { timeout: 15000 },
    );
    expect(screen.getByText("DISPONIBILITÉ")).toBeDefined();
    expect(screen.getByText("MAINTENANCE")).toBeDefined();
    expect(screen.getByText("RENDEMENT")).toBeDefined();
    expect(screen.getByText("FINANCES")).toBeDefined();
    expect(screen.getByText("PARC")).toBeDefined();
  }, 20000);
});