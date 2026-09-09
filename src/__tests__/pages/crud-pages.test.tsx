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
    });

    it('renders page title', async () => {
      const mod = await mockImport();
      render(<mod.default />);
      expect(screen.getByText(title)).toBeDefined();
    });
  });
};

createPageTest('AffectationMaterielPage', 'Affectations Matériel', () => import('../../pages/AffectationMaterielPage'));
createPageTest('CategorieGMPage', 'Catégories GM', () => import('../../pages/CategorieGMPage'));
createPageTest('DivisionPage', 'Divisions', () => import('../../pages/DivisionPage'));
createPageTest('EntreprisePage', 'Entreprises', () => import('../../pages/EntreprisePage'));
createPageTest('FamilleMaterielPage', 'Familles Matériel', () => import('../../pages/FamilleMaterielPage'));
createPageTest('FamilleStructuresPage', 'Familles Structures', () => import('../../pages/FamilleStructuresPage'));
createPageTest('FilialePage', 'Filiales', () => import('../../pages/FilialePage'));
createPageTest('MarqueMaterielPage', 'Marques Matériel', () => import('../../pages/MarqueMaterielPage'));
createPageTest('PointagePage', 'Pointages', () => import('../../pages/PointagePage'));
createPageTest('ProfilePage', 'Profil', () => import('../../pages/ProfilePage'));
createPageTest('RegularisationGMPage', 'Régularisations GM', () => import('../../pages/RegularisationGMPage'));
createPageTest('RegularisationMoisGM2Page', 'Régularisations Mensuelles', () => import('../../pages/RegularisationMoisGM2Page'));
createPageTest('SitePage', 'Sites', () => import('../../pages/SitePage'));
createPageTest('SituationMaterielPage', 'Situations Matériel', () => import('../../pages/SituationMaterielPage'));
createPageTest('SousFamilleMaterielPage', 'Sous-Familles Matériel', () => import('../../pages/SousFamilleMaterielPage'));
createPageTest('TypeAffectationPage', "Types d'Affectation", () => import('../../pages/TypeAffectationPage'));
createPageTest('TypeEtatMaterielPage', "Types d'État Matériel", () => import('../../pages/TypeEtatMaterielPage'));
createPageTest('TypeMarquePage', 'Types de Marque', () => import('../../pages/TypeMarquePage'));
createPageTest('TypeSituationPage', 'Types de Situation', () => import('../../pages/TypeSituationPage'));
