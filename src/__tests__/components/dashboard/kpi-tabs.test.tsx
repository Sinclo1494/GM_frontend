import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const createKpiTabTest = (name: string, title: string, mockImport: any) => {
  describe(`components/dashboard/kpi/${name}`, () => {
    beforeEach(() => {
      vi.resetAllMocks();
      vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
      vi.doMock('react-chartjs-2', () => ({
        Line: () => <div>LineChartMock</div>,
      }));
    });

    it('renders without crashing', async () => {
      const mod = await mockImport();
      render(<mod.default />);
      expect(screen.getByText(title)).toBeDefined();
    });
  });
};

createKpiTabTest('DisponibiliteTab', 'Disponibilité', () => import('../../../components/dashboard/kpi/DisponibiliteTab'));
createKpiTabTest('PanneTab', 'Pannes', () => import('../../../components/dashboard/kpi/PanneTab'));
createKpiTabTest('MtbfTab', 'MTBF', () => import('../../../components/dashboard/kpi/MtbfTab'));
createKpiTabTest('MttrTab', 'MTTR', () => import('../../../components/dashboard/kpi/MttrTab'));
createKpiTabTest('TauxUtilisationTab', "Taux d'Utilisation", () => import('../../../components/dashboard/kpi/TauxUtilisationTab'));
createKpiTabTest('TauxChomageTab', 'Taux de Chômage', () => import('../../../components/dashboard/kpi/TauxChomageTab'));
createKpiTabTest('TauxAffectationTab', "Taux d'Affectation", () => import('../../../components/dashboard/kpi/TauxAffectationTab'));
createKpiTabTest('CaLocationInterneTab', 'CA Location Interne', () => import('../../../components/dashboard/kpi/CaLocationInterneTab'));
createKpiTabTest('CoutPanneTab', 'Coût des Pannes', () => import('../../../components/dashboard/kpi/CoutPanneTab'));
createKpiTabTest('RendementTab', 'Rendement', () => import('../../../components/dashboard/kpi/RendementTab'));
createKpiTabTest('RentabiliteTab', 'Rentabilité', () => import('../../../components/dashboard/kpi/RentabiliteTab'));
