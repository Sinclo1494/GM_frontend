export interface JournalUser {
  id: number;
  username: string;
}

export interface JournalEntry {
  id: number;
  date_action: string;
  user: JournalUser | null;
  action: string;
  module: string;
  objet_type: string;
  objet_id: string;
  description: string;
  ancienne_valeur: Record<string, unknown> | unknown[] | null;
  nouvelle_valeur: Record<string, unknown> | unknown[] | null;
  ip_address: string | null;
  code_filiale: string | null;
  code_site: string | null;
  created_at: string;
}

export interface JournalFilterParams {
  date_debut?: string;
  date_fin?: string;
  user?: string;
  module?: string;
  action?: string;
  objet_id?: string;
  code_filiale?: string;
  code_site?: string;
  search?: string;
}

export interface JournalFilters {
  date_debut: string;
  date_fin: string;
  user: string;
  module: string;
  action: string;
  objet_id: string;
  code_filiale: string;
  code_site: string;
  search: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  IMPORT: "Import",
  VALIDATE: "Validation",
  CANCEL: "Annulation",
};

export const MODULE_LABELS: Record<string, string> = {
  MATERIEL: "Matériel",
  AFFECTATION: "Affectation",
  SITUATION: "Situation",
  POINTAGE: "Pointage",
  REGULARISATION: "Régularisation",
  IMPORT: "Import",
  UTILISATEUR: "Utilisateur",
  ADMINISTRATION: "Administration",
  MARQUE: "Marque",
  TYPE_MARQUE: "Type de Marque",
  SOUS_FAMILLE: "Sous-Famille",
  SITE: "Site",
  SITUATION_AFFECTATION: "Situation Affectation",
};

export const ACTION_OPTIONS: FilterOption[] = [
  { value: "CREATE", label: "Création" },
  { value: "UPDATE", label: "Modification" },
  { value: "DELETE", label: "Suppression" },
  { value: "IMPORT", label: "Import" },
  { value: "VALIDATE", label: "Validation" },
  { value: "CANCEL", label: "Annulation" },
];

export const MODULE_OPTIONS: FilterOption[] = [
  { value: "MATERIEL", label: "Matériel" },
  { value: "AFFECTATION", label: "Affectation" },
  { value: "SITUATION", label: "Situation" },
  { value: "POINTAGE", label: "Pointage" },
  { value: "REGULARISATION", label: "Régularisation" },
  { value: "IMPORT", label: "Import" },
  { value: "UTILISATEUR", label: "Utilisateur" },
  { value: "ADMINISTRATION", label: "Administration" },
  { value: "MARQUE", label: "Marque" },
  { value: "TYPE_MARQUE", label: "Type de Marque" },
  { value: "SOUS_FAMILLE", label: "Sous-Famille" },
  { value: "SITE", label: "Site" },
  { value: "SITUATION_AFFECTATION", label: "Situation Affectation" },
];

export const formatActionLabel = (action: string): string =>
  ACTION_LABELS[action] ?? action;

export const formatModuleLabel = (module: string): string =>
  MODULE_LABELS[module] ?? module;

export const ACTION_BADGE_CLASS: Record<string, string> = {
  CREATE: "bg-blue-100 text-blue-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  IMPORT: "bg-purple-100 text-purple-800",
  VALIDATE: "bg-teal-100 text-teal-800",
  CANCEL: "bg-gray-200 text-gray-700",
};

export const getActionBadgeClass = (action: string): string =>
  ACTION_BADGE_CLASS[action] ?? "bg-gray-100 text-gray-700";

export type JournalSortField =
  | "date_action"
  | "user"
  | "module"
  | "action"
  | "objet_id"
  | "code_filiale"
  | "code_site";

export type SortOrder = "asc" | "desc";
