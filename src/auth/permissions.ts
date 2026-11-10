export type PermissionCategory = "administration" | "analyse" | "gestion" | "import" | "menu";

export interface PermissionDefinition {
  key: string;
  label: string;
  category: PermissionCategory;
  route: string;
  hasRead: boolean;
  hasWrite: boolean;
  hasMenu: boolean;
  parentMenu?: string;
}

export const PERMISSIONS: PermissionDefinition[] = [
  { key: "menu.dashboard", label: "Dashboard", category: "menu", route: "/", hasRead: true, hasWrite: false, hasMenu: true },
  { key: "analyse.dashboard", label: "Dashboard", category: "analyse", route: "/", hasRead: true, hasWrite: false, hasMenu: false, parentMenu: "menu.dashboard" },
  { key: "menu.recapitulatifs", label: "Récapitulatifs", category: "menu", route: "/reports", hasRead: true, hasWrite: false, hasMenu: true },
  { key: "menu.gestion", label: "Gestion", category: "menu", route: "/gestion", hasRead: true, hasWrite: false, hasMenu: true },
  { key: "menu.imports", label: "Import. CSV", category: "menu", route: "/imports", hasRead: true, hasWrite: false, hasMenu: true },
  { key: "menu.administration", label: "Administration", category: "menu", route: "/admin", hasRead: true, hasWrite: false, hasMenu: true },

  { key: "administration.users", label: "Utilisateurs", category: "administration", route: "/admin/users", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "administration.all_filiales", label: "Accès à toutes les filiales", category: "administration", route: "/admin/users", hasRead: true, hasWrite: false, hasMenu: false, parentMenu: "menu.administration" },
  { key: "administration.journalisation", label: "Journalisation", category: "administration", route: "/admin/journalisation", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.administration" },
  { key: "administration.external_apps", label: "Applications externes", category: "administration", route: "/admin/external-apps", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "administration.pending_imports", label: "Imports en attente", category: "administration", route: "/admin/pending-imports", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.administration" },

  { key: "analyse.mgt_dashboard", label: "MGT Dashboard", category: "analyse", route: "/reports/mgt-dashboard", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.recapitulatifs" },
  { key: "analyse.journal_materiel", label: "Journal Matériel", category: "analyse", route: "/reports/journal-materiel", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.recapitulatifs" },
  { key: "analyse.quantitative", label: "Analyse quantitative", category: "analyse", route: "/reports/analyse-quantitative", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.recapitulatifs" },
  { key: "analyse.exploitation", label: "Anlyse d'Exploitation", category: "analyse", route: "/reports/analyse-exploitation", hasRead: true, hasWrite: false, hasMenu: true, parentMenu: "menu.recapitulatifs" },

  { key: "gestion.entreprises", label: "Entreprises", category: "gestion", route: "/gestion/entreprises", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.filiales", label: "Filiales", category: "gestion", route: "/gestion/filiales", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.divisions", label: "Divisions", category: "gestion", route: "/gestion/divisions", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.familles_structures", label: "Familles Structures", category: "gestion", route: "/gestion/familles-structures", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.categories_gm", label: "Catégories GM", category: "gestion", route: "/gestion/categories-gm", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.familles_materiel", label: "Familles Matériel", category: "gestion", route: "/gestion/familles-materiel", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.sous_familles_materiel", label: "Sous-Familles Matériel", category: "gestion", route: "/gestion/sous-familles-materiel", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.marques_materiel", label: "Marques Matériel", category: "gestion", route: "/gestion/marques-materiel", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.types_marque", label: "Types de Marque", category: "gestion", route: "/gestion/types-marque", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.types_affectation", label: "Types Affectation", category: "gestion", route: "/gestion/types-affectation", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.types_situation", label: "Types Situation", category: "gestion", route: "/gestion/types-situation", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.types_etat_materiel", label: "Types État Matériel", category: "gestion", route: "/gestion/types-etat-materiel", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.administration" },
  { key: "gestion.sites", label: "Sites", category: "gestion", route: "/gestion/sites", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.grand_materiel", label: "Grand Matériel", category: "gestion", route: "/gestion/grand-materiel", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.affectations", label: "Affectations", category: "gestion", route: "/gestion/affectations", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.situations", label: "Situations", category: "gestion", route: "/gestion/situations", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.pointages", label: "Pointages", category: "gestion", route: "/gestion/pointages", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.regularisations_gm", label: "Régularisations GM", category: "gestion", route: "/gestion/regularisations-gm", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },
  { key: "gestion.regularisations_mois", label: "Régularisations Mensuelles", category: "gestion", route: "/gestion/regularisations-mois", hasRead: true, hasWrite: true, hasMenu: true, parentMenu: "menu.gestion" },

  { key: "import.pointage", label: "Import Pointage", category: "import", route: "/imports/pointage-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.grand_materiel", label: "Import Grand Matériel", category: "import", route: "/imports/gm-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.marque", label: "Import Marque", category: "import", route: "/imports/marque-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.type_marque", label: "Import Type Marque", category: "import", route: "/imports/type-marque-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.sous_famille", label: "Import Sous-Famille", category: "import", route: "/imports/sous-famille-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.famille", label: "Import Famille", category: "import", route: "/imports/famille-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.categorie_gm", label: "Import Catégorie GM", category: "import", route: "/imports/categorie-gm-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.situation_affectation", label: "Import Situation-Affectation", category: "import", route: "/imports/situation-affectation-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.site", label: "Import Site", category: "import", route: "/imports/site-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
  { key: "import.regularisation", label: "Import Régularisation", category: "import", route: "/imports/regularisation-gm-csv", hasRead: false, hasWrite: true, hasMenu: true, parentMenu: "menu.imports" },
];

export const CATEGORY_LABELS: Record<PermissionCategory, string> = {
  menu: "Menus",
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

export const PERMISSION_DEPENDENCIES: Record<string, string[]> = {
  "analyse.dashboard": ["gestion.filiales.read", "gestion.familles_materiel.read"],
  "analyse.mgt_dashboard": ["gestion.filiales.read", "gestion.familles_materiel.read"],
  "import.grand_materiel": ["gestion.filiales.read", "gestion.sous_familles_materiel.read", "gestion.types_marque.read"],
  "import.pointage": ["gestion.filiales.read", "gestion.affectations.read", "gestion.pointages.read"],
  "import.type_marque": ["gestion.marques_materiel.read"],
  "import.sous_famille": ["gestion.familles_materiel.read"],
  "import.famille": ["gestion.categories_gm.read"],
  "import.categorie_gm": [],
  "import.situation_affectation": ["gestion.filiales.read", "gestion.grand_materiel.read", "gestion.sites.read", "gestion.types_affectation.read", "gestion.types_situation.read", "gestion.types_etat_materiel.read", "gestion.affectations.read", "gestion.situations.read"],
  "import.site": ["gestion.filiales.read", "gestion.divisions.read"],
  "import.regularisation": ["gestion.filiales.read", "gestion.sites.read"],
};

export function getPermissionsByCategory(category: PermissionCategory): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => p.category === category);
}

export function getPermissionsByParentMenu(parentMenu: string): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => p.parentMenu === parentMenu);
}

export function getTopLevelMenuPermissions(): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => p.category === "menu" && !p.parentMenu);
}

export function getPermissionByRoute(route: string): PermissionDefinition | undefined {
  return PERMISSIONS.find((p) => p.route === route);
}

export function getPermissionsByRoutes(routes: string[]): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => routes.includes(p.route));
}

export function getPermissionByKey(key: string): PermissionDefinition | undefined {
  return PERMISSIONS.find((p) => p.key === key);
}

export function getAllDependencies(permissionKey: string): string[] {
  const direct = PERMISSION_DEPENDENCIES[permissionKey] || [];
  const all = new Set<string>();
  const stack = [...direct];
  while (stack.length > 0) {
    const dep = stack.pop()!;
    if (all.has(dep)) continue;
    all.add(dep);
    const depBase = dep.replace(/\.read$/, "").replace(/\.write$/, "");
    const subDeps = PERMISSION_DEPENDENCIES[depBase] || [];
    for (const sub of subDeps) {
      if (!all.has(sub)) stack.push(sub);
    }
  }
  return Array.from(all);
}

export function getDependentPermissions(permissionKey: string): string[] {
  const baseKey = permissionKey.replace(/\.read$/, "").replace(/\.write$/, "");
  const dependents: string[] = [];
  for (const [perm, deps] of Object.entries(PERMISSION_DEPENDENCIES)) {
    if (deps.some((d) => d === permissionKey || d.startsWith(baseKey + "."))) {
      dependents.push(perm);
    }
  }
  return dependents;
}
