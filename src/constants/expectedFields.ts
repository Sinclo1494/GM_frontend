export const POINTAGE_EXPECTED_FIELDS = [
  {
    value: "code_materiel",
    label: "Code matériel",
    required: true,
  },
  {
    value: "code_site",
    label: "Code site",
    required: true,
  },
  {
    value: "date_affectation",
    label: "Date d'affectation",
    required: true,
  },
  {
    value: "taux_location",
    label: "Taux de location",
    required: false,
  },
  {
    value: "heures_service",
    label: "Heures de service",
    required: true,
  },
  {
    value: "heures_chomage",
    label: "Heures de chômage",
    required: true,
  },
  {
    value: "heures_panne",
    label: "Heures de panne",
    required: true,
  },
  {
    value: "potentiel",
    label: "Potentiel",
    required: true,
  },
  {
    value: "montant_service",
    label: "Montant Service",
    required: false,
  },
  {
    value: "montant_chomage",
    label: "Montant Chômage",
    required: false,
  },
  {
    value: "montant_panne",
    label: "Montant Panne",
    required: false,
  },
  {
    value: "mmaa",
    label: "Mois / Année",
    required: true,
  },
  {
    value: "date_modification",
    label: "Date de modification",
    required: true,
  },
  {
    value: "est_bloque",
    label: "Est bloqué",
    required: true,
  },
];

export const GM_EXPECTED_FIELDS = [
  {
    value: "code_materiel",
    label: "Code matériel",
    required: true,
  },

  {
    value: "designation",
    label: "Désignation",
    required: true,
  },

  {
    value: "num_serie",
    label: "N° de série",
    required: false,
  },

  {
    value: "immatriculation",
    label: "Immatriculation",
    required: false,
  },

  {
    value: "date_acquisition",
    label: "Date d'acquisition",
    required: false,
  },

  {
    value: "valeur_acquisition",
    label: "Valeur d'acquisition",
    required: true,
  },

  {
    value: "valeur_remplacement",
    label: "Valeur de remplacement",
    required: false,
  },

  {
    value: "taux_amortissement",
    label: "Taux d'amortissement",
    required: false,
  },

  {
    value: "puissance_materiel",
    label: "Puissance",
    required: false,
  },

  {
    value: "code_sous_famille_materiel",
    label: "Sous-famille",
    required: true,
  },

  {
    value: "code_type_marque",
    label: "Type Marque",
    required: false,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

  {
    value: "code_filiale_g",
    label: "Filiale",
    required: false,
  },

  {
    value: "date_modification",
    label: "Date de modification",
    required: false,
  },
];



export const MARQUE_EXPECTED_FIELDS = [
  {
    value: "code_marque",
    label: "Code marque",
    required: true,
  },

  {
    value: "libelle_marque",
    label: "Libellé marque",
    required: true,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

];

export const TYPE_MARQUE_EXPECTED_FIELDS = [
  {
    value: "code_type_marque",
    label: "Code type marque",
    required: true,
  },

  {
    value: "libelle_type_marque",
    label: "Libellé type marque",
    required: true,
  },

  {
    value: "code_marque",
    label: "Code marque",
    required: true,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

];


export const SOUS_FAMILLE_EXPECTED_FIELDS = [
  {
    value: "code_sous_famille",
    label: "Code sous famille",
    required: true,
  },

  {
    value: "libelle_sous_famille",
    label: "Libellé sous famille",
    required: true,
  },

  {
    value: "code_famille_materiel",
    label: "Code famille materiel",
    required: true,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

];

export const FAMILLE_EXPECTED_FIELDS = [
  {
    value: "code_famille",
    label: "Code famille",
    required: true,
  },

  {
    value: "libelle_famille",
    label: "Libellé famille",
    required: true,
  },

  {
    value: "code_categorie_gm",
    label: "Code catégorie GM",
    required: true,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

];

export const CATEGORIE_GM_EXPECTED_FIELDS = [
  {
    value: "code_categorie",
    label: "Code catégorie",
    required: true,
  },

  {
    value: "libelle_categorie",
    label: "Libellé catégorie",
    required: true,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

];

export const SITUATION_AFFECTATION_EXPECTED_FIELDS = [
  {
    value: "code_materiel",
    label: "Code matériel",
    required: true,
  },

  {
    value: "code_type_affectation",
    label: "Code type affectation",
    required: true,
  },

  {
    value: "code_type_situation",
    label: "Code type situation",
    required: true,
  },

  {
    value: "code_site",
    label: "Code site",
    required: true,
  },

  {
    value: "date_affectation",
    label: "Date affectation",
    required: true,
  },

  {
    value: "code_type_etat_materiel",
    label: "Code type état matériel",
    required: true,
  },

  {
    value: "date_modification",
    label: "Date modification",
    required: false,
  },

  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },

  {
    value: "date_situation",
    label: "Date situation",
    required: false,
  },
];

export const SITE_EXPECTED_FIELDS = [
  {
    value: "code_site",
    label: "Code site",
    required: true,
  },
  {
    value: "code_filiale",
    label: "Code filiale",
    required: true,
  },
  {
    value: "code_region",
    label: "Code région",
    required: true,
  },
  {
    value: "libelle_site",
    label: "Libellé site",
    required: true,
  },
  {
    value: "code_agence",
    label: "Code agence",
    required: true,
  },
  {
    value: "type_site",
    label: "Type site",
    required: true,
  },
  {
    value: "code_division",
    label: "Code division",
    required: false,
  },
  {
    value: "numero_ss_employeur",
    label: "Numéro SS employeur",
    required: true,
  },
  {
    value: "code_commune_site",
    label: "Code commune",
    required: true,
  },
  {
    value: "jour_cloture_mouv_RH_paie",
    label: "Jour clôture RH/Paie",
    required: false,
  },
  {
    value: "date_ouverture_site",
    label: "Date d'ouverture",
    required: false,
  },
  {
    value: "date_cloture_site",
    label: "Date de clôture",
    required: false,
  },
  {
    value: "est_bloque",
    label: "Bloqué",
    required: false,
  },
];

export const REGULARISATION_GM_EXPECTED_FIELDS = [
  {
    value: "code_site",
    label: "Code site",
    required: true,
  },
  {
    value: "mmaa",
    label: "Mois / Année",
    required: true,
  },
  {
    value: "montant_regularisation",
    label: "Montant régularisation",
    required: true,
  },
  {
    value: "observation",
    label: "Observation",
    required: false,
  },
  {
    value: "est_bloque",
    label: "Est bloqué",
    required: false,
  },
  {
    value: "date_modification",
    label: "Date de modification",
    required: false,
  },
];