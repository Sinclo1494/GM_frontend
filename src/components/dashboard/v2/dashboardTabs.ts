import type { DashboardV2FilterKey } from "./FilterBar";

export type DashboardTabId =
  | "apercu"
  | "situation"
  | "disponibilite"
  | "maintenance"
  | "rendement"
  | "finances"
  | "parc";

export const TAB_FILTERS: Record<DashboardTabId, DashboardV2FilterKey[]> = {
  apercu: ["code_filiale", "code_famille", "periode", "trimestre", "annee"],
  situation: ["code_filiale", "code_famille", "periode", "annee"],
  disponibilite: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  maintenance: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  rendement: ["code_filiale", "code_famille", "periode", "annee", "niveau"],
  finances: ["code_filiale", "code_famille", "periode", "trimestre", "annee", "niveau"],
  parc: ["code_filiale", "code_famille", "periode", "annee"],
};
