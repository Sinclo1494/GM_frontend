import { describe, it, expect } from 'vitest';
import type {
  Entreprise,
  Filiale,
  Division,
  FamilleMateriel,
  SousFamilleMateriel,
  GrandMateriel,
  TypeAffectation,
  TypeSituation,
  TypeEtatMateriel,
  Site,
  JournalEntry,
  UserInfo,
  UserPreferences,
  DashboardData,
  AnalyseQuantitativeType,
  AnalyseExploitationType,
} from '../../types/models';

describe('types/models', () => {
  it('can construct minimal model objects', () => {
    const entreprise: Entreprise = {
      code_entreprise: 'E1',
      raison_sociale: 'R',
      numero_identification_fiscale: null,
      numero_article_imposition: null,
      numero_registre_commerce: 'R1',
      numero_compte_bancaire: 'B1',
      capital_social: '1000',
      entete: null,
      date_registre_commerce: '2024-01-01',
      logo: null,
      type_dossier: 't',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const filiale: Filiale = {
      code_filiale: 'F1',
      code_entreprise: 'E1',
      libelle_filiale: 'Fil 1',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const division: Division = {
      code_division: 'D1',
      libelle_division: 'Div 1',
      code_filiale: 'F1',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const famille: FamilleMateriel = {
      code_famille: 'FA1',
      code_categorie_gm: 'CA1',
      libelle_famille: 'Fam 1',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const sousFamille: SousFamilleMateriel = {
      code_sous_famille: 'SF1',
      libelle_sous_famille: 'SF 1',
      code_famille_materiel: 'FA1',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const gm: GrandMateriel = {
      code_materiel: 'GM1',
      code_filiale_g: 'F1',
      designation: 'Desc',
      num_serie: 'S1',
      immatriculation: 'I1',
      date_acquisition: '2024-01-01',
      valeur_acquisition: 1000,
      valeur_remplacement: 800,
      taux_amortissement: 10,
      puissance_materiel: 'P',
      code_sous_famille_materiel: 'SF1',
      code_type_marque: 'TM1',
      est_bloque: false,
      code_site: 'S1',
      date_affectation: '2024-01-01T00:00:00Z',
      date_debut_affectation: '2024-01-01T00:00:00Z',
      date_fin_affectation: '2024-01-01T00:00:00Z',
      prenable: true,
      code_type_etat_materiel: 'NEUF',
      type_situation_id: '1',
      date_situation: '2024-01-01T00:00:00Z',
      situation_est_bloque: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const typeAffectation: TypeAffectation = {
      code_type_affectation: 'TA1',
      libelle_type_affectation: 'Type A',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const typeSituation: TypeSituation = {
      id: 1,
      libelle_type_situation: 'TS1',
      est_bloque: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const typeEtat: TypeEtatMateriel = {
      code_type_etat_materiel: 'NEUF',
      libelle_type_etat_materiel: 'Neuf',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const site: Site = {
      code_site: 'S1',
      libelle_site: 'Site 1',
      est_bloque: false,
      user_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const journal: JournalEntry = {
      id: 1,
      model_name: 'grand_materiel',
      object_id: '1',
      action: 'create',
      data: {},
      user: 'admin',
      timestamp: '2024-01-01T00:00:00Z',
    };

    const user: UserInfo = {
      id: 1,
      username: 'u',
      first_name: 'F',
      last_name: 'L',
      email: 'u@e.com',
      is_active: true,
      is_superuser: false,
      permissions: [],
      groups: [],
    };

    const prefs: UserPreferences = {
      default_landing_page: '/',
      remember_last_visited_page: true,
      last_visited_page: '/',
    };

    const dashboard: DashboardData = {
      global_kpis: null,
      maintenance_kpis: null,
      financial_kpis: null,
      quantitative_resume: null,
      exploitation_resume: null,
      alerts: [],
      material_details: [],
    };

    const aqt: AnalyseQuantitativeType = {
      code_materiel: 'GM1',
      designation: 'D',
      code_filiale: 'F1',
      libelle_filiale: 'Fil',
      code_sous_famille: 'SF1',
      libelle_sous_famille: 'SF',
      mois: '2024-01',
      heures_service: 100,
      heures_chomage: 20,
      heures_panne: 5,
      potentiel: 80,
      taux_utilisation: 0.8,
      taux_chomage: 0.2,
      mttr: 2,
      mtbf: 10,
      cout_panne: 100,
      taux_affectation: 1,
      disponibilite: 0.9,
    };

    const aet: AnalyseExploitationType = {
      ...aqt,
      montant_service: 1000,
      montant_chomage: 200,
      montant_panne: 50,
      ca_location: 800,
      rentabilite: 0.7,
      rendement: 0.6,
    };

    expect(entreprise).toBeDefined();
    expect(filiale).toBeDefined();
    expect(division).toBeDefined();
    expect(famille).toBeDefined();
    expect(sousFamille).toBeDefined();
    expect(gm).toBeDefined();
    expect(typeAffectation).toBeDefined();
    expect(typeSituation).toBeDefined();
    expect(typeEtat).toBeDefined();
    expect(site).toBeDefined();
    expect(journal).toBeDefined();
    expect(user).toBeDefined();
    expect(prefs).toBeDefined();
    expect(dashboard).toBeDefined();
    expect(aqt).toBeDefined();
    expect(aet).toBeDefined();
  });
});
