export interface DashboardV2Option {
  value: string;
  label: string;
}

export interface DashboardV2GlobalKpis {
  parc_total: number;
  /**
   * Distinct materials carrying a latest situation at `date_fin`. Can be lower
   * than `parc_total` (materials with no situation row), never higher.
   */
  situation_total: number;
  en_service: number;
  en_chomage: number;
  en_panne: number;
  immobilise_base: number;
  /** Materials on an "Immobilisé" affectation whose situation is "En réparation". */
  en_reparation: number;
  /**
   * `(type_affectation, type_situation)` pairs outside the reference grid
   * (cessions, réformes, acquisition, "NON FOURNIE"). Kept explicit so the
   * buckets add up to `situation_total` instead of dropping rows.
   */
  autres: number;
  alrem: number;
  age_moyen: number;
}

export interface DashboardV2MaintenanceKpis {
  /** (potentiel − heures panne − heures chômage) / potentiel × 100 */
  tamd: number;
  /** heures service / (potentiel − heures panne) × 100 */
  tam: number;
  /** heures panne / potentiel × 100 (hours-based, same value as taux_panne) */
  tip: number;
  note: string;
  en_panne: number;
  en_reparation: number;
  taux_service: number;
  taux_chomage: number;
  taux_panne: number;
  disponibilite: number;
  potentiel_total: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
}

export interface DashboardV2FinancialKpis {
  /** ca réalisé + chômage + panne */
  totalFacture: number;
  /** Σ(montant_service ?? heures_service × taux_location) */
  caRealise: number;
  /** Σmontant_service (stored amounts only, no fallback) */
  factService: number;
  factChomage: number;
  factPanne: number;
  /** ca_potentiel − ca_réalisé, signed (negative = billed above potential) */
  manqueAGagner: number;
  caPotentiel: number;
  totalRegularisation: number;
  /** ca_réalisé − Σmontant_régularisation */
  marge: number;
  /** (ca_potentiel − ca_réalisé) / ca_potentiel × 100 — positive is good */
  ecartCible: number;
}

export interface DashboardV2FilialeDistributionItem {
  code_filiale: string;
  libelle_filiale: string;
  totalMateriel: number;
}

export interface DashboardV2Overview {
  globalKpis: DashboardV2GlobalKpis;
  maintenanceKpis: DashboardV2MaintenanceKpis;
  financialKpis: DashboardV2FinancialKpis;
  filialeDistribution: DashboardV2FilialeDistributionItem[];
}

export interface DashboardV2PointagePoint {
  mmaa: string | null;
  potentiel: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  disponibilite: number;
  tamd: number;
  tam: number;
  tip: number;
  taux_utilisation: number;
  taux_chomage: number;
  rendement: number;
}

export type DashboardV2RatioPoint = {
  mmaa: string | null;
  code: string;
  libelle: string;
  potentiel: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  disponibilite: number;
  tamd: number;
  tam: number;
  tip: number;
  taux_utilisation: number;
  taux_chomage: number;
  rendement: number;
};

export interface DashboardV2SituationDistributionItem {
  /**
   * Bucket code as published by the service (`01`, `02`, `03`, `04`, `06`,
   * `07`, `99`). It identifies the `(type_affectation, type_situation)` bucket
   * rather than the raw situation code, and matches the matching KPI card.
   */
  code_type_situation: string;
  libelle_type_situation: string;
  count: number;
}

export type DashboardV2FamilleDistributionItem = {
  code_famille: string;
  libelle_famille: string;
  code_sous_famille: string;
  libelle_sous_famille: string;
  count: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  potentiel: number;
};

export interface DashboardV2Situation {
  situationDistribution: DashboardV2SituationDistributionItem[];
  pointageEvolution: DashboardV2PointagePoint[];
  familleDistribution: DashboardV2FamilleDistributionItem[];
}

export interface DashboardV2Disponibilite {
  evolution: DashboardV2PointagePoint[];
  breakdown: DashboardV2RatioPoint[];
}

export interface DashboardV2MtbfSeries {
  evolution: {
    mmaa: string | null;
    heures_service: number;
    nombre_pannes: number;
    mtbf: number | null;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    heures_service: number;
    nombre_pannes: number;
    mtbf: number | null;
  }[];
}

export interface DashboardV2MttrSeries {
  evolution: {
    mmaa: string | null;
    heures_panne: number;
    interventions_correctives: number;
    mttr: number | null;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    heures_panne: number;
    interventions_correctives: number;
    mttr: number | null;
  }[];
}

export interface DashboardV2CoutPanneSeries {
  evolution: {
    mmaa: string | null;
    heures_panne: number;
    /** heures de panne des seuls pointages qui portent un taux_location */
    heures_panne_avec_tarif: number;
    cout_panne: number;
    records_with_tarif: number;
    records_without_tarif: number;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    heures_panne: number;
    heures_panne_avec_tarif: number;
    cout_panne: number;
    records_with_tarif: number;
    records_without_tarif: number;
  }[];
}

export interface DashboardV2Maintenance {
  mtbf: DashboardV2MtbfSeries;
  mttr: DashboardV2MttrSeries;
  coutPanne: DashboardV2CoutPanneSeries;
}

export interface DashboardV2Rendement {
  /** monthly fold of the niveau-aware pointage rows (hours + ratios) */
  pointageEvolution: DashboardV2PointagePoint[];
  /** same series as pointageEvolution — kept for payload compatibility */
  rendementEvolution: DashboardV2PointagePoint[];
  /** per-entity rows honouring `niveau` (replaces a /disponibilite round-trip) */
  breakdown: DashboardV2RatioPoint[];
}

export interface DashboardV2CaSeries {
  evolution: {
    mmaa: string | null;
    ca_total: number;
    /** Σmontant_service (montants saisis) */
    ca_stocke: number;
    /** Σ(heures_service × taux_location) for rows without montant_service */
    ca_calculee: number;
    records_with_montant: number;
    records_without_montant: number;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    ca_total: number;
    ca_stocke: number;
    ca_calculee: number;
    records_with_montant: number;
    records_without_montant: number;
  }[];
}

export interface DashboardV2RentabiliteSeries {
  evolution: {
    quarter: string | null;
    chiffre_affaires: number;
    regularisation: number;
    marge: number;
  }[];
  ranking: {
    code_materiel: string;
    designation: string;
    libelle_famille: string;
    libelle_filiale: string;
    chiffre_affaires: number;
    regularisation: number;
    marge: number;
  }[];
}

/** Fleet-scoped affectation rate: never re-derive it by summing a breakdown. */
export interface DashboardV2TauxAffectationGlobal {
  parc_total: number;
  engins_affectes: number;
  taux_affectation: number;
}

export interface DashboardV2TauxAffectationSeries {
  evolution: {
    mmaa: string | null;
    engins_affectes: number;
    parc_total: number;
    taux_affectation: number;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    parc_total: number;
    engins_affectes: number;
    taux_affectation: number;
  }[];
  global: DashboardV2TauxAffectationGlobal;
}

export interface DashboardV2TauxUtilisationSeries {
  evolution: {
    mmaa: string | null;
    heures_service: number;
    potentiel: number;
    taux_utilisation: number;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    heures_service: number;
    potentiel: number;
    taux_utilisation: number;
  }[];
}

export interface DashboardV2TauxChomageSeries {
  evolution: {
    mmaa: string | null;
    heures_chomage: number;
    potentiel: number;
    taux_chomage: number;
  }[];
  breakdown: {
    code: string;
    libelle: string;
    heures_chomage: number;
    potentiel: number;
    taux_chomage: number;
  }[];
}

export interface DashboardV2Finances {
  caLocationInterne: DashboardV2CaSeries;
  rentabilite: DashboardV2RentabiliteSeries;
  tauxAffectation: DashboardV2TauxAffectationSeries;
  tauxAffectationGlobal: DashboardV2TauxAffectationGlobal;
  tauxUtilisation: DashboardV2TauxUtilisationSeries;
  tauxChomage: DashboardV2TauxChomageSeries;
}

export interface DashboardV2FilialeStat {
  code_filiale: string;
  libelle_filiale: string;
  totalMateriel: number;
  totalAffectations: number;
  totalHeuresService: number;
  totalPointages: number;
}
