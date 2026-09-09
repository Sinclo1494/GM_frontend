export interface Entreprise {
    code_entreprise: string;
    raison_sociale: string;
    numero_identification_fiscale: string | null;
    numero_article_imposition: string | null;
    numero_registre_commerce: string;
    numero_compte_bancaire: string;
    capital_social: string;
    entete: string | null;
    date_registre_commerce: string;
    logo: string | null;
    type_dossier: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface Filiale {
    code_filiale: string;
    code_entreprise: string;
    libelle_filiale: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface Division {
    code_division: string;
    libelle_division: string;
    code_filiale: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface FamilleStructures {
    code_famille_structure: string;
    libelle_famille_structure: string;
    numero_ordre: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface CategorieGM {
    code_categorie: string;
    libelle_categorie: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface FamilleMateriel {
    code_famille: string;
    code_categorie_gm: string;
    libelle_famille: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface SousFamilleMateriel {
    code_sous_famille: string;
    libelle_sous_famille: string;
    code_famille_materiel: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface MarqueMateriel {
    code_marque: string;
    libelle_marque: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TypeMarque {
    code_type_marque: string;
    libelle_type_marque: string;
    code_marque: string | null;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TypeAffectation {
    code_type_affectation: string;
    libelle_type_affectation: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TypeSituation {
    code_type_situation: string;
    libelle_type_situation: string;
    code_type_affectation: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface TypeEtatMateriel {
    code_type_etat_materiel: string;
    libelle_type_etat_materiel: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface Site {
    code_site: string;
    code_filiale: string;
    code_region: string;
    libelle_site: string;
    code_agence: string;
    type_site: string;
    code_division: string | null;
    numero_ss_employeur: string;
    code_commune_site: string;
    jour_cloture_mouv_RH_paie: number | null;
    date_ouverture_site: string | null;
    date_cloture_site: string | null;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface GrandMateriel {
    id: number;
    code_materiel: string;
    designation: string;
    num_serie: string | null;
    immatriculation: string | null;
    date_acquisition: string | null;
    valeur_acquisition: string;
    valeur_remplacement: string | null;
    taux_amortissement: string | null;
    puissance_materiel: string | null;
    code_sous_famille_materiel: string;
    code_type_marque: string | null;
    est_bloque: boolean;
    user_id: number;
    code_filiale_g: string;
    date_modification: string | null;
    created_at: string;
    updated_at: string;
}

export interface AffectationMateriel {
    id: number;
    code_affectation: string;
    code_materiel: string;
    code_filiale_mere: string;
    code_site: string;
    date_affectation: string;
    date_fin_affectation: string | null;
    nbr_jours_affectation: number;
    date_debut_affectation: string | null;
    prenable: boolean;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface SituationMateriel {
    id: number;
    id_situation: string | null;
    affectation_id: number;
    code_affectation: string;
    type_situation_id: number;
    code_type_affectation: string;
    code_type_situation: string;
    code_type_etat_materiel: string;
    etat_materiel: string;
    filiale: string;
    site: string;
    date_situation: string;
    est_bloque: boolean;
    user_id: number;
    date_modification: string | null;
    created_at: string;
    updated_at: string;
}

export interface Pointage {
    id: number;
    affectation_id: number;
    code_affectation: string;
    code_materiel: string;
    mmaa: string;
    taux_location: string | null;
    heures_service: string;
    heures_chomage: string;
    heures_panne: string;
    potentiel: string;
    montant_service: string | null;
    montant_chomage: string | null;
    montant_panne: string | null;
    est_bloque: boolean;
    user_id: number;
    date_modification: string;
    created_at: string;
    updated_at: string;
}

export interface RegularisationGM {
    id: number;
    code_site: string;
    mmaa: string;
    montant_regularisation: string;
    observation: string | null;
    est_bloque: boolean;
    user_id: number;
    date_modification: string | null;
    created_at: string;
    updated_at: string;
}

export interface RegularisationMoisGM2 {
    id: number;
    code_regularisation: string;
    montant_regularisation: string;
    est_bloque: boolean;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface OptionItem {
    value: string;
    label: string;
}
