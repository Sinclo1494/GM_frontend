export interface AnalyseQuantitativeType {
  code_sous_famille: string;
  libelle_sous_famille: string;
  code_categorie: string;
  libelle_categorie: string;

  nbr: number;
  age_total: number;
  age_moyen: number;

  exploitation: {
    en_service: number;
    en_chomage: number;
    en_panne: number;
  };

  immobilise: {
    en_chomage: number;
    en_reparation: number;
    autre: number;
  };

  reparation: {
    ALREM: number;
    autre: number;
  };
}

export interface AnalyseQuantitativeResumeType {
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
    autre: number;
    ALREM: number;
  };
}