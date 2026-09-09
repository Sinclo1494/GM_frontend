import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const createPageTest = (name: string, title: string, mockImport: any) => {
  describe(`pages/${name}`, () => {
    beforeEach(() => {
      vi.resetAllMocks();
      vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
      vi.doMock('../../components/Crud/CrudPage', () => ({
        __esModule: true,
        default: () => <div>CrudPageMock</div>,
      }));
      vi.doMock('../../api/dataServices', () => ({
        getAQTP: vi.fn(),
        getAQTPR: vi.fn(),
        getAETP: vi.fn(),
        getAETPR: vi.fn(),
        getFiliales: vi.fn(),
        getFamilles: vi.fn(),
        getDashboard: vi.fn(),
        getMaterialDetails: vi.fn(),
      }));
    });

    it('renders page title', async () => {
      const mod = await mockImport();
      render(<mod.default />);
      expect(screen.getByText(title)).toBeDefined();
    });
  });
};

createPageTest('AnalyseExploitation', 'Analyse d\'Exploitation', () => import('../../pages/AnalyseExploitation'));
createPageTest('AnalyseQuantitative', 'Analyse Quantitative', () => import('../../pages/AnalyseQuantitative'));
createPageTest('Journalisation', 'Journalisation', () => import('../../pages/Journalisation'));
createPageTest('JournalMateriel', 'Journal Matériel', () => import('../../pages/JournalMateriel'));
