export type PermissionCategory = "administration" | "analyse" | "gestion" | "import";

export interface PermissionDefinition {
  key: string;
  label: string;
  category: PermissionCategory;
  route: string;
}

export const PERMISSIONS: PermissionDefinition[] = [
  { key: "administration.users", label: "Utilisateurs", category: "administration", route: "/admin/users" },
  { key: "administration.journalisation", label: "Journalisation", category: "administration", route: "/admin/journalisation" },

  { key: "analyse.dashboard", label: "Dashboard", category: "analyse", route: "/" },
  { key: "analyse.journal_materiel", label: "Journal Matériel", category: "analyse", route: "/reports/journal-materiel" },
  { key: "analyse.quantitative", label: "Analyse quantitative", category: "analyse", route: "/reports/analyse-quantitative" },
  { key: "analyse.exploitation", label: "Analyse exploitation", category: "analyse", route: "/reports/analyse-exploitation" },

  { key: "gestion.entreprises", label: "Entreprises", category: "gestion", route: "/gestion/entreprises" },
  { key: "gestion.filiales", label: "Filiales", category: "gestion", route: "/gestion/filiales" },
  { key: "gestion.divisions", label: "Divisions", category: "gestion", route: "/gestion/divisions" },
  { key: "gestion.familles_structures", label: "Familles Structures", category: "gestion", route: "/gestion/familles-structures" },
  { key: "gestion.categories_gm", label: "Catégories GM", category: "gestion", route: "/gestion/categories-gm" },
  { key: "gestion.familles_materiel", label: "Familles Matériel", category: "gestion", route: "/gestion/familles-materiel" },
  { key: "gestion.sous_familles_materiel", label: "Sous-Familles Matériel", category: "gestion", route: "/gestion/sous-familles-materiel" },
  { key: "gestion.marques_materiel", label: "Marques Matériel", category: "gestion", route: "/gestion/marques-materiel" },
  { key: "gestion.types_marque", label: "Types de Marque", category: "gestion", route: "/gestion/types-marque" },
  { key: "gestion.types_affectation", label: "Types Affectation", category: "gestion", route: "/gestion/types-affectation" },
  { key: "gestion.types_situation", label: "Types Situation", category: "gestion", route: "/gestion/types-situation" },
  { key: "gestion.types_etat_materiel", label: "Types État Matériel", category: "gestion", route: "/gestion/types-etat-materiel" },
  { key: "gestion.sites", label: "Sites", category: "gestion", route: "/gestion/sites" },
  { key: "gestion.grand_materiel", label: "Grand Matériel", category: "gestion", route: "/gestion/grand-materiel" },
  { key: "gestion.affectations", label: "Affectations", category: "gestion", route: "/gestion/affectations" },
  { key: "gestion.situations", label: "Situations", category: "gestion", route: "/gestion/situations" },
  { key: "gestion.pointages", label: "Pointages", category: "gestion", route: "/gestion/pointages" },
  { key: "gestion.regularisations_gm", label: "Régularisations GM", category: "gestion", route: "/gestion/regularisations-gm" },
  { key: "gestion.regularisations_mois", label: "Régularisations Mensuelles", category: "gestion", route: "/gestion/regularisations-mois" },

  { key: "import.pointage", label: "Import Pointage", category: "import", route: "/imports/pointage-csv" },
  { key: "import.grand_materiel", label: "Import Grand Matériel", category: "import", route: "/imports/gm-csv" },
  { key: "import.marque", label: "Import Marque", category: "import", route: "/imports/marque-csv" },
  { key: "import.type_marque", label: "Import Type Marque", category: "import", route: "/imports/type-marque-csv" },
  { key: "import.sous_famille", label: "Import Sous-Famille", category: "import", route: "/imports/sous-famille-csv" },
  { key: "import.situation_affectation", label: "Import Situation-Affectation", category: "import", route: "/imports/situation-affectation-csv" },
  { key: "import.site", label: "Import Site", category: "import", route: "/imports/site-csv" },
  { key: "import.regularisation", label: "Import Régularisation", category: "import", route: "/imports/regularisation-gm-csv" },
];

export const CATEGORY_LABELS: Record<PermissionCategory, string> = {
  administration: "Administration",
  analyse: "Analyse",
  gestion: "Gestion",
  import: "Import de données",
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "administration",
  "analyse",
  "gestion",
  "import",
];

export function getPermissionsByCategory(category: PermissionCategory): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => p.category === category);
}

export function getPermissionByRoute(route: string): PermissionDefinition | undefined {
  return PERMISSIONS.find((p) => p.route === route);
}

export function getPermissionsByRoutes(routes: string[]): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => routes.includes(p.route));
}
