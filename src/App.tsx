import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navigation/NavBar'
import { ThemeProvider } from './context/ThemeContext'
import { usePermissions } from './auth/PermissionContext'
import { useEffect } from 'react'

const EXCLUDED_PATHS = new Set(["/login", "/profile"]);

function AppContent() {
  const { loading } = usePermissions();
  const location = useLocation();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const path = location.pathname;
    if (EXCLUDED_PATHS.has(path)) return;

    const permMap: Record<string, string> = {
      "/": "analyse.dashboard",
      "/Dashboard": "analyse.dashboard",
      "/reports/journal-materiel": "analyse.journal_materiel",
      "/reports/analyse-quantitative": "analyse.quantitative",
      "/reports/analyse-exploitation": "analyse.exploitation",
      "/admin/journalisation": "administration.journalisation",
      "/admin/users": "administration.users",
      "/gestion/entreprises": "gestion.entreprises",
      "/gestion/filiales": "gestion.filiales",
      "/gestion/divisions": "gestion.divisions",
      "/gestion/familles-structures": "gestion.familles_structures",
      "/gestion/categories-gm": "gestion.categories_gm",
      "/gestion/familles-materiel": "gestion.familles_materiel",
      "/gestion/sous-familles-materiel": "gestion.sous_familles_materiel",
      "/gestion/marques-materiel": "gestion.marques_materiel",
      "/gestion/types-marque": "gestion.types_marque",
      "/gestion/types-affectation": "gestion.types_affectation",
      "/gestion/types-situation": "gestion.types_situation",
      "/gestion/types-etat-materiel": "gestion.types_etat_materiel",
      "/gestion/sites": "gestion.sites",
      "/gestion/grand-materiel": "gestion.grand_materiel",
      "/gestion/affectations": "gestion.affectations",
      "/gestion/situations": "gestion.situations",
      "/gestion/pointages": "gestion.pointages",
      "/gestion/regularisations-gm": "gestion.regularisations_gm",
      "/gestion/regularisations-mois": "gestion.regularisations_mois",
      "/imports/pointage-csv": "import.pointage",
      "/imports/gm-csv": "import.grand_materiel",
      "/imports/marque-csv": "import.marque",
      "/imports/type-marque-csv": "import.type_marque",
      "/imports/sous-famille-csv": "import.sous_famille",
      "/imports/famille-csv": "import.famille",
      "/imports/categorie-gm-csv": "import.categorie_gm",
      "/imports/situation-affectation-csv": "import.situation_affectation",
      "/imports/site-csv": "import.site",
      "/imports/regularisation-gm-csv": "import.regularisation",
    };

    const requiredPerm = permMap[path];
    if (requiredPerm && !hasPermission(requiredPerm)) return;

    localStorage.setItem("last_visited_page", path);
  }, [location, hasPermission]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50/30 dark:bg-dark-bg-primary">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <AppContent />
      </div>
    </ThemeProvider>
  )
}

export default App
