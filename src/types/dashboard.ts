export interface DashboardFilters {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  periode?: string;
  mode?: "standard" | "vs_cible";
}

export interface DashboardFiltersApplied {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  periode?: string;
  mode?: "standard" | "vs_cible";
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

export interface DashboardFinancialKpis {
  totalFacture: number;
  factService: number;
  totalRegularisation: number;
  marge: number;
}

export interface DashboardMaintenanceKpis {
  tamd: number | null;
  tam: number | null;
  tip: number | null;
  note: string;
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
  financialKpis?: DashboardFinancialKpis;
  maintenanceKpis?: DashboardMaintenanceKpis;
  materialDetails?: DashboardMaterialDetailsResponse;
  filters?: DashboardFiltersApplied;
}
