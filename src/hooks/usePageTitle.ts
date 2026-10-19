import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/reports/dashboard-v2": "Dashboard V2",
  "/reports/journal-materiel": "Journal Matériel",
  "/reports/analyse-quantitative": "Analyse Quantitative",
  "/reports/analyse-exploitation": "Analyse Exploitation",
  "/admin/journalisation": "Journalisation",
  "/admin/users": "Utilisateurs",
  "/admin/pending-imports": "Imports en attente",
  "/profile": "Profil",
  "/notifications": "Notifications",
  "/imports/pointage-csv": "Import Pointage",
  "/imports/gm-csv": "Import Grand Matériel",
  "/imports/marque-csv": "Import Marque",
  "/imports/type-marque-csv": "Import Type Marque",
  "/imports/sous-famille-csv": "Import Sous-Famille",
  "/imports/famille-csv": "Import Famille",
  "/imports/categorie-gm-csv": "Import Catégorie GM",
  "/imports/situation-affectation-csv": "Import Situation-Affectation",
  "/imports/site-csv": "Import Site",
  "/imports/regularisation-gm-csv": "Import Régularisation GM",
  "/gestion/entreprises": "Entreprises",
  "/gestion/filiales": "Filiales",
  "/gestion/divisions": "Divisions",
  "/gestion/familles-structures": "Familles Structures",
  "/gestion/categories-gm": "Catégories GM",
  "/gestion/familles-materiel": "Familles Matériel",
  "/gestion/sous-familles-materiel": "Sous-Familles Matériel",
  "/gestion/marques-materiel": "Marques Matériel",
  "/gestion/types-marque": "Types de Marque",
  "/gestion/types-affectation": "Types d'Affectation",
  "/gestion/types-situation": "Types de Situation",
  "/gestion/types-etat-materiel": "Types d'État Matériel",
  "/gestion/sites": "Sites",
  "/gestion/grand-materiel": "Grand Matériel",
  "/gestion/affectations": "Affectations",
  "/gestion/situations": "Situations",
  "/gestion/pointages": "Pointages",
  "/gestion/regularisations-gm": "Régularisations GM",
  "/gestion/regularisations-mois": "Régularisations Mensuelles",
};

const DEFAULT_TITLE = "Grand Matériel";

function resolveTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Try to match by prefix for nested routes
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(route)) return title;
  }
  return DEFAULT_TITLE;
}

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const title = resolveTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);
}