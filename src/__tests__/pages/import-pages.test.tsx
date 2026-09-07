import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const createImportPageTest = (name: string, title: string, mockImport: any) => {
  describe(`pages/${name}`, () => {
    beforeEach(() => {
      vi.resetAllMocks();
      vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    });

    it('renders import page title', async () => {
      const mod = await mockImport();
      render(<mod.default />);
      expect(screen.getByText(title)).toBeDefined();
    });
  });
};

createImportPageTest('ImportMarqueCSV', 'Import Marque CSV', () => import('../../pages/ImportMarqueCSV'));
createImportPageTest('ImportPointageCSV', 'Import Pointage CSV', () => import('../../pages/ImportPointageCSV'));
createImportPageTest('ImportRegularisationCSV', 'Import Régularisation GM CSV', () => import('../../pages/ImportRegularisationCSV'));
createImportPageTest('ImportSiteCSV', 'Import Site CSV', () => import('../../pages/ImportSiteCSV'));
createImportPageTest('ImportSituationAffectationCSV', 'Import Situation/Affectation CSV', () => import('../../pages/ImportSituationAffectationCSV'));
createImportPageTest('ImportSousFamilleCSV', 'Import Sous-Famille CSV', () => import('../../pages/ImportSousFamilleCSV'));
createImportPageTest('ImportTypeMarqueCSV', 'Import Type Marque CSV', () => import('../../pages/ImportTypeMarqueCSV'));
