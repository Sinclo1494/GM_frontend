import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { usePermissions } from "../../auth/PermissionContext";
import { ChevronDown, LogOut, Settings, Sun, Moon, User } from "lucide-react";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [importsOpen, setImportsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [gestionOpen, setGestionOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasPermission, loading } = usePermissions();
  const navigate = useNavigate();

  const closeAllDropdowns = () => {
    setUserMenuOpen(false);
    setReportsOpen(false);
    setImportsOpen(false);
    setAdminOpen(false);
    setGestionOpen(false);
    setSettingsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (navRef.current && !navRef.current.contains(target)) {
        closeAllDropdowns();
        return;
      }
      if (!target.closest("button") && !target.closest(".dropdown-menu")) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dropdownClass =
    "absolute left-0 mt-2 w-56 rounded-lg bg-white dark:bg-dark-card shadow-lg border border-slate-200 dark:border-dark-border overflow-hidden z-50 dark:bg-dark-card dark:border-dark-border dropdown-menu";

  const dropdownItemClass =
    "block px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-slate-50 dark:bg-dark-bg-secondary transition-colors dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary";

  if (loading) {
    return (
      <nav className="w-full bg-slate-900 text-white px-6 h-16 flex items-center justify-between">
        <div className="text-lg font-bold text-blue-400">Grand Matériel</div>
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </nav>
    );
  }

  const canSeeDashboard = hasPermission("analyse.dashboard");
  const canSeeJournalisation = hasPermission("administration.journalisation");
  const canSeeUsers = hasPermission("administration.users");
  const canSeeJournalMateriel = hasPermission("analyse.journal_materiel");
  const canSeeQuantitative = hasPermission("analyse.quantitative");
  const canSeeExploitation = hasPermission("analyse.exploitation");

  const canSeeAnyImport = [
    "import.pointage",
    "import.grand_materiel",
    "import.marque",
    "import.type_marque",
    "import.sous_famille",
    "import.famille",
    "import.categorie_gm",
    "import.situation_affectation",
    "import.site",
    "import.regularisation",
  ].some((p) => hasPermission(p));

  const canSeeAnyReport = canSeeJournalMateriel || canSeeQuantitative || canSeeExploitation;

  const canSeeAnyGestion = [
    "gestion.entreprises",
    "gestion.filiales",
    "gestion.divisions",
    "gestion.familles_structures",
    "gestion.categories_gm",
    "gestion.familles_materiel",
    "gestion.sous_familles_materiel",
    "gestion.marques_materiel",
    "gestion.types_marque",
    "gestion.types_affectation",
    "gestion.types_situation",
    "gestion.types_etat_materiel",
    "gestion.sites",
    "gestion.grand_materiel",
    "gestion.affectations",
    "gestion.situations",
    "gestion.pointages",
    "gestion.regularisations_gm",
    "gestion.regularisations_mois",
  ].some((p) => hasPermission(p));

  const canSeeAnyAdmin = canSeeJournalisation || canSeeUsers;

  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username : "User";

  return (
    <nav ref={navRef} className="w-full bg-slate-900 text-white px-6 h-16 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold text-blue-400">
        Grand Matériel
      </Link>

      <ul className="flex items-center gap-6 text-sm">
        {canSeeDashboard && (
          <li>
            <Link to="/" className="hover:text-gray-300 transition-colors">
              Home
            </Link>
          </li>
        )}

        {canSeeAnyImport && (
          <li className="relative">
            <button
              onClick={() => {
                setImportsOpen(!importsOpen)
                setReportsOpen(false)
                setGestionOpen(false)
                setAdminOpen(false)
                setSettingsOpen(false)
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              CSV Import
              <ChevronDown
                className={`h-4 w-4 transition-transform ${importsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {importsOpen && (
              <div className={dropdownClass}>
                {hasPermission("import.grand_materiel") && (
                  <Link to="/imports/gm-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Grand Matériel</Link>
                )}
                {hasPermission("import.pointage") && (
                  <Link to="/imports/pointage-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Pointage</Link>
                )}
                {hasPermission("import.marque") && (
                  <Link to="/imports/marque-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Marque Materiel</Link>
                )}
                {hasPermission("import.type_marque") && (
                  <Link to="/imports/type-marque-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Type Marque Materiel</Link>
                )}
                {hasPermission("import.sous_famille") && (
                  <Link to="/imports/sous-famille-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Sous Familles Materiel</Link>
                )}
                {hasPermission("import.famille") && (
                  <Link to="/imports/famille-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Familles Matériel</Link>
                )}
                {hasPermission("import.categorie_gm") && (
                  <Link to="/imports/categorie-gm-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Catégories GM</Link>
                )}
                {hasPermission("import.situation_affectation") && (
                  <Link to="/imports/situation-affectation-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Situations-Affectations</Link>
                )}
                {hasPermission("import.site") && (
                  <Link to="/imports/site-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Sites</Link>
                )}
                {hasPermission("import.regularisation") && (
                  <Link to="/imports/regularisation-gm-csv" onClick={() => setImportsOpen(false)} className={dropdownItemClass}>Régularisation GM</Link>
                )}
              </div>
            )}
          </li>
        )}

        {canSeeAnyReport && (
          <li className="relative">
            <button
              onClick={() => {
                setReportsOpen(!reportsOpen)
                setImportsOpen(false)
                setGestionOpen(false)
                setAdminOpen(false)
                setSettingsOpen(false)
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Reports
              <ChevronDown
                className={`h-4 w-4 transition-transform ${reportsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {reportsOpen && (
              <div className={dropdownClass}>
                {hasPermission("analyse.journal_materiel") && (
                  <Link to="/reports/journal-materiel" onClick={() => setReportsOpen(false)} className={dropdownItemClass}>
                    Journal Matériel
                  </Link>
                )}
                {hasPermission("analyse.quantitative") && (
                  <Link to="/reports/analyse-quantitative" onClick={() => setReportsOpen(false)} className={dropdownItemClass}>
                    Analyse Quantitative
                  </Link>
                )}
                {hasPermission("analyse.exploitation") && (
                  <Link to="/reports/analyse-exploitation" onClick={() => setReportsOpen(false)} className={dropdownItemClass}>
                    Analyse Exploitation
                  </Link>
                )}
              </div>
            )}
          </li>
        )}

        {canSeeAnyGestion && (
          <li className="relative">
            <button
              onClick={() => {
                setGestionOpen(!gestionOpen)
                setImportsOpen(false)
                setReportsOpen(false)
                setAdminOpen(false)
                setSettingsOpen(false)
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Gestion
              <ChevronDown
                className={`h-4 w-4 transition-transform ${gestionOpen ? "rotate-180" : ""}`}
              />
            </button>

            {gestionOpen && (
              <div className={`${dropdownClass} w-64`}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Référentiels</div>
                {hasPermission("gestion.entreprises") && <Link to="/gestion/entreprises" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Entreprises</Link>}
                {hasPermission("gestion.filiales") && <Link to="/gestion/filiales" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Filiales</Link>}
                {hasPermission("gestion.divisions") && <Link to="/gestion/divisions" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Divisions</Link>}
                {hasPermission("gestion.familles_structures") && <Link to="/gestion/familles-structures" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Structures</Link>}
                <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Matériel</div>
                {hasPermission("gestion.categories_gm") && <Link to="/gestion/categories-gm" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Catégories GM</Link>}
                {hasPermission("gestion.familles_materiel") && <Link to="/gestion/familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Matériel</Link>}
                {hasPermission("gestion.sous_familles_materiel") && <Link to="/gestion/sous-familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Sous-Familles Matériel</Link>}
                {hasPermission("gestion.marques_materiel") && <Link to="/gestion/marques-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Marques Matériel</Link>}
                {hasPermission("gestion.types_marque") && <Link to="/gestion/types-marque" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types de Marque</Link>}
                {hasPermission("gestion.grand_materiel") && <Link to="/gestion/grand-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Grand Matériel</Link>}
                <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Opérations</div>
                {hasPermission("gestion.types_affectation") && <Link to="/gestion/types-affectation" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types Affectation</Link>}
                {hasPermission("gestion.types_situation") && <Link to="/gestion/types-situation" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types Situation</Link>}
                {hasPermission("gestion.types_etat_materiel") && <Link to="/gestion/types-etat-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types État Matériel</Link>}
                {hasPermission("gestion.sites") && <Link to="/gestion/sites" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Sites</Link>}
                {hasPermission("gestion.affectations") && <Link to="/gestion/affectations" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Affectations</Link>}
                {hasPermission("gestion.situations") && <Link to="/gestion/situations" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Situations</Link>}
                {hasPermission("gestion.pointages") && <Link to="/gestion/pointages" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Pointages</Link>}
                {hasPermission("gestion.regularisations_gm") && <Link to="/gestion/regularisations-gm" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Régularisations GM</Link>}
                {hasPermission("gestion.regularisations_mois") && <Link to="/gestion/regularisations-mois" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Régularisations Mensuelles</Link>}
              </div>
            )}
          </li>
        )}

        {canSeeAnyAdmin && (
          <li className="relative">
            <button
              onClick={() => {
                setAdminOpen(!adminOpen)
                setImportsOpen(false)
                setReportsOpen(false)
                setGestionOpen(false)
                setSettingsOpen(false)
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Administration
              <ChevronDown
                className={`h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`}
              />
            </button>

            {adminOpen && (
              <div className={dropdownClass}>
                {hasPermission("administration.journalisation") && (
                  <Link
                    to="/admin/journalisation"
                    onClick={() => setAdminOpen(false)}
                    className={dropdownItemClass}
                  >
                    Journalisation
                  </Link>
                )}
                {hasPermission("administration.users") && (
                  <Link
                    to="/admin/users"
                    onClick={() => setAdminOpen(false)}
                    className={dropdownItemClass}
                  >
                    Utilisateurs
                  </Link>
                )}
              </div>
            )}
          </li>
        )}
      </ul>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setSettingsOpen(!settingsOpen)
              setImportsOpen(false)
              setReportsOpen(false)
              setGestionOpen(false)
              setAdminOpen(false)
              setUserMenuOpen(false)
            }}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-800 transition-colors"
            title="Paramètres"
          >
            <Settings className="h-5 w-5" />
          </button>

          {settingsOpen && (
            <div className={dropdownClass}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase dark:text-dark-text-secondary">
                Thème
              </div>
              <button
                onClick={() => {
                  if (theme !== "light") toggleTheme();
                  setSettingsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  theme === "light"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-slate-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </button>
              <button
                onClick={() => {
                  if (theme !== "dark") toggleTheme();
                  setSettingsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-slate-50 dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="h-2 w-2 bg-green-400 rounded-full"></span>
            <span>{displayName}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userMenuOpen && (
            <div className={dropdownClass}>
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-text-secondary border-b border-slate-100 dark:border-dark-border">
                {displayName}
              </div>

              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className={dropdownItemClass}
              >
                <User className="h-4 w-4" />
                Profil
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
