export interface DashboardFilters {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  periode?: string;
  mode?: "standard" | "vs_cible";
  niveau?: string;
  annee?: string;
  trimestre?: string;
}

export interface DashboardFiltersApplied {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  periode?: string;
  mode?: "standard" | "vs_cible";
  niveau?: string;
  annee?: string;
}

export interface DashboardOverview {
  totalMateriel: number;
  materielActif: number;
  materielInactif: number;
  materielAffecte: number;
  materielNonAffecte: number;
  totalAffectations: number;
  affectationsActives: number;
  totalPointages: number;
  totalHeuresService: number;
  totalHeuresChomage: number;
  totalHeuresPanne: number;
  totalMontantService: number;
  totalMontantChomage: number;
  totalMontantPanne: number;
  totalRegularisation: number;
}

export interface DashboardSituationDistribution {
  code_type_situation: string;
  libelle_type_situation: string;
  count: number;
}

export interface DashboardPointageEvolution {
  mmaa: string | null;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  potentiel: number;
}

export interface DashboardFilialeStat {
  code_filiale: string;
  libelle_filiale: string;
  totalMateriel: number;
  totalAffectations: number;
  totalHeuresService: number;
  totalPointages: number;
}

export interface DashboardAlert {
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  count: number;
  href?: string;
}

export interface DashboardRecentActivity {
  id: number;
  date_action: string | null;
  action: string;
  module: string;
  description: string;
  objet_type: string;
  objet_id: string;
  user: { username: string } | null;
}

export interface DashboardQuantitativeResume {
  nombre_totale: number;
  age_moyen: number;
  exploitation: {
    en_service: number;
    en_chomage: number;
    en_panne: number;
  };
  immobilises: {
    en_chomage: number;
    en_reparation: number;
    autre: number;
  };
  reparation_externe: {
    ALREM: number;
    autre: number;
  };
}

export interface DashboardExploitationResume {
  nombre_total: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  montant_service: number;
  montant_chomage: number;
  montant_panne: number;
  potentiel_moyen: number;
  total_potentiel: number;
  taux_location_moyen: number;
  pct_heures_service: number;
  pct_heures_chomage: number;
  pct_heures_panne: number;
  pct_montant_service: number;
  pct_montant_chomage: number;
  pct_montant_panne: number;
}

export interface DashboardFamilleDistribution {
  code_famille: string;
  libelle_famille: string;
  code_sous_famille: string;
  libelle_sous_famille: string;
  count: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
}

export interface DashboardTrend {
  mmaa: string | null;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  montant_service: number;
  montant_chomage: number;
  montant_panne: number;
}

export interface DashboardMaintenanceKpis {
  tamd: number | null;
  tam: number | null;
  tip: number | null;
  note: string;
  en_panne: number;
  en_reparation: number;
  taux_service: number;
  taux_panne: number;
  disponibilite: number;
  potentiel_total: number;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
}

export interface DashboardGlobalKpis {
  parc_total: number;
  en_service: number;
  en_chomage: number;
  en_panne: number;
  immobilise_base: number;
  alrem: number;
  age_moyen: number;
}

export interface DashboardFinancialKpis {
  totalFacture: number;
  factService: number;
  factChomage: number;
  factPanne: number;
  manqueAGagner: number;
  caPotentiel: number;
  totalRegularisation: number;
  marge: number;
  ecartCibleMag: number;
}

export interface DashboardMaterialDetail {
  code_materiel: string;
  designation: string;
  code_sous_famille: string;
  libelle_sous_famille: string;
  code_famille: string;
  libelle_famille: string;
  code_type_marque: string;
  libelle_type_marque: string;
  code_filiale: string;
  libelle_filiale: string;
  est_bloque: boolean;
}

export interface DashboardMaterialDetailsResponse {
  items: DashboardMaterialDetail[];
  total: number;
  page: number;
  page_size: number;
}

export interface DisponibiliteEvolutionPoint {
  mmaa: string | null;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  potentiel: number;
}

export interface PanneEvolutionPoint {
  mmaa: string | null;
  heures_service: number;
  heures_chomage: number;
  heures_panne: number;
  potentiel: number;
}

export interface AvailabilityBreakdownItem {
  code: string;
  libelle: string;
  potentiel: number;
  heures_panne: number;
  disponibilite: number;
}

export interface PanneBreakdownItem {
  code: string;
  libelle: string;
  potentiel: number;
  heures_panne: number;
  taux_panne: number;
}

export interface MtbfEvolutionPoint {
  mmaa: string | null;
  heures_service: number;
  nombre_pannes: number;
}

export interface MtbfBreakdownItem {
  code: string;
  libelle: string;
  heures_service: number;
  nombre_pannes: number;
}

export interface MttrEvolutionPoint {
  mmaa: string | null;
  heures_panne: number;
  interventions_correctives: number;
}

export interface MttrBreakdownItem {
  code: string;
  libelle: string;
  heures_panne: number;
  interventions_correctives: number;
  mttr: number | null;
}

export interface TauxUtilisationEvolutionPoint {
  mmaa: string | null;
  heures_service: number;
  potentiel: number;
}

export interface TauxUtilisationBreakdownItem {
  code: string;
  libelle: string;
  heures_service: number;
  potentiel: number;
  taux_utilisation: number;
}

export interface TauxChomageEvolutionPoint {
  mmaa: string | null;
  heures_chomage: number;
  potentiel: number;
}

export interface TauxChomageBreakdownItem {
  code: string;
  libelle: string;
  potentiel: number;
  heures_chomage: number;
  taux_chomage: number;
}

export interface TauxAffectationEvolutionPoint {
  week: string | null;
  distinct_engins: number;
  parc_total: number;
  total_distinct_engins: number;
  taux_affectation: number;
}

export interface TauxAffectationBreakdownItem {
  code: string;
  libelle: string;
  parc_total: number;
  engins_affectes: number;
  taux_affectation: number;
}

export interface CaLocationInterneEvolutionPoint {
  mmaa: string | null;
  ca_stored: number;
  ca_calculated: number;
  total_ca: number;
  records_with_montant: number;
  records_without_montant: number;
}

export interface CaLocationInterneBreakdownItem {
  code: string;
  libelle: string;
  ca_total: number;
  records_with_montant: number;
  records_without_montant: number;
}

export interface CoutPanneEvolutionPoint {
  mmaa: string | null;
  heures_panne: number;
  cout_panne: number;
  records_with_tarif: number;
  records_without_tarif: number;
}

export interface CoutPanneBreakdownItem {
  code: string;
  libelle: string;
  heures_panne: number;
  cout_panne: number;
  records_with_tarif: number;
  records_without_tarif: number;
}

export interface RendementEvolutionPoint {
  mmaa: string | null;
  heures_service: number;
  heures_panne: number;
  potentiel: number;
  disponibilite: number;
  taux_utilisation: number;
  rendement: number;
}

export interface RendementBreakdownItem {
  code: string;
  libelle: string;
  potentiel: number;
  heures_service: number;
  heures_panne: number;
  disponibilite: number;
  taux_utilisation: number;
  rendement: number;
}

export interface RentabiliteEvolutionPoint {
  quarter: string | null;
  chiffre_affaires: number;
  regularisation: number;
  marge: number;
}

export interface RentabiliteRankingItem {
  code_materiel: string;
  designation: string;
  code_filiale: string;
  libelle_filiale: string;
  code_famille: string;
  libelle_famille: string;
  chiffre_affaires: number;
  regularisation: number;
  marge: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  situationDistribution: DashboardSituationDistribution[];
  pointageEvolution: DashboardPointageEvolution[];
  filialeStats: DashboardFilialeStat[];
  alerts: DashboardAlert[];
  recentActivity: DashboardRecentActivity[];
  quantitativeResume?: DashboardQuantitativeResume | null;
  exploitationResume?: DashboardExploitationResume | null;
  familleDistribution?: DashboardFamilleDistribution[];
  trends?: DashboardTrend[];
  globalKpis?: DashboardGlobalKpis | null;
  financialKpis?: DashboardFinancialKpis;
  maintenanceKpis?: DashboardMaintenanceKpis;
  materialDetails?: DashboardMaterialDetailsResponse;
  disponibiliteEvolution?: DisponibiliteEvolutionPoint[];
  availabilityBreakdown?: AvailabilityBreakdownItem[];
  tauxPanneEvolution?: PanneEvolutionPoint[];
  panneBreakdown?: PanneBreakdownItem[];
  mtbfEvolution?: MtbfEvolutionPoint[];
  mtbfBreakdown?: MtbfBreakdownItem[];
  mttrEvolution?: MttrEvolutionPoint[];
  mttrBreakdown?: MttrBreakdownItem[];
  tauxUtilisationEvolution?: TauxUtilisationEvolutionPoint[];
  tauxUtilisationBreakdown?: TauxUtilisationBreakdownItem[];
  tauxChomageEvolution?: TauxChomageEvolutionPoint[];
  tauxChomageBreakdown?: TauxChomageBreakdownItem[];
  tauxAffectationEvolution?: TauxAffectationEvolutionPoint[];
  tauxAffectationBreakdown?: TauxAffectationBreakdownItem[];
  caLocationInterneEvolution?: CaLocationInterneEvolutionPoint[];
  caLocationInterneBreakdown?: CaLocationInterneBreakdownItem[];
  coutPanneEvolution?: CoutPanneEvolutionPoint[];
  coutPanneBreakdown?: CoutPanneBreakdownItem[];
  rendementEvolution?: RendementEvolutionPoint[];
  rendementBreakdown?: RendementBreakdownItem[];
  rentabiliteEvolution?: RentabiliteEvolutionPoint[];
  rentabiliteRanking?: RentabiliteRankingItem[];
  filters?: DashboardFiltersApplied;
}
