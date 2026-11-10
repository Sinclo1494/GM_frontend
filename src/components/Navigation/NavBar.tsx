import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { usePermissions } from "../../auth/PermissionContext";
import { ChevronDown, LogOut, Settings, Sun, Moon, User, Bell } from "lucide-react";
import NotificationBell from "./NotificationBell";
import logo from "../../assets/img/logo.png";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [recapitulatifsOpen, setRecapitulatifsOpen] = useState(false);
  const [importsOpen, setImportsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [gestionOpen, setGestionOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { hasMenuPermission, loading } = usePermissions();
  const navigate = useNavigate();

  const closeAllDropdowns = () => {
    setUserMenuOpen(false);
    setRecapitulatifsOpen(false);
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
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Grand Matériel" className="h-16 w-auto my-2" />
          <span className="text-lg font-bold text-blue-400">Grand Matériel</span>
        </Link>
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </nav>
    );
  }

  const canSeeDashboard = hasMenuPermission("menu.dashboard");

  const canSeeRecapitulatifs = hasMenuPermission("menu.recapitulatifs");
  const canSeeGestion = hasMenuPermission("menu.gestion");
  const canSeeImports = hasMenuPermission("menu.imports");
  const canSeeAdmin = hasMenuPermission("menu.administration");

  const displayName = user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username : "User";

  return (
    <nav ref={navRef} className="w-full bg-slate-900 text-white px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img src={logo} alt="Grand Matériel" className="h-16 w-auto my-2" />
        <span className="text-lg font-bold text-blue-400">Grand Matériel</span>
      </Link>

      <ul className="flex items-center gap-6 text-sm">
        {canSeeDashboard && (
          <li>
            <Link to="/" className="hover:text-gray-300 transition-colors" onClick={closeAllDropdowns}>
              Dashboard
            </Link>
          </li>
        )}

        {canSeeRecapitulatifs && (
          <li className="relative">
            <button
              onClick={() => {
                setRecapitulatifsOpen(!recapitulatifsOpen);
                setImportsOpen(false);
                setGestionOpen(false);
                setAdminOpen(false);
                setSettingsOpen(false);
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Récapitulatifs
              <ChevronDown
                className={`h-4 w-4 transition-transform ${recapitulatifsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {recapitulatifsOpen && (
              <div className={dropdownClass}>
                {hasMenuPermission("analyse.journal_materiel") && (
                  <Link
                    to="/reports/journal-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Journal Matériel
                  </Link>
                )}
                {hasMenuPermission("analyse.quantitative") && (
                  <Link
                    to="/reports/analyse-quantitative"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Analyse Quantitative
                  </Link>
                )}
                {hasMenuPermission("analyse.exploitation") && (
                  <Link
                    to="/reports/analyse-exploitation"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Anlyse d'Exploitation
                  </Link>
                )}
              </div>
            )}
          </li>
        )}

        {canSeeGestion && (
          <li className="relative">
            <button
              onClick={() => {
                setGestionOpen(!gestionOpen);
                setImportsOpen(false);
                setRecapitulatifsOpen(false);
                setAdminOpen(false);
                setSettingsOpen(false);
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Gestion
              <ChevronDown
                className={`h-4 w-4 transition-transform ${gestionOpen ? "rotate-180" : ""}`}
              />
            </button>

            {gestionOpen && (
              <div className={`${dropdownClass} w-56`}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Opérations</div>
                {hasMenuPermission("gestion.grand_materiel") && (
                  <Link
                    to="/gestion/grand-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Grand Matériel
                  </Link>
                )}
                {hasMenuPermission("gestion.sites") && (
                  <Link
                    to="/gestion/sites"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Sites
                  </Link>
                )}
                {hasMenuPermission("gestion.affectations") && (
                  <Link
                    to="/gestion/affectations"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Affectations
                  </Link>
                )}
                {hasMenuPermission("gestion.situations") && (
                  <Link
                    to="/gestion/situations"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Situations
                  </Link>
                )}
                {hasMenuPermission("gestion.pointages") && (
                  <Link
                    to="/gestion/pointages"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Pointages
                  </Link>
                )}
                {hasMenuPermission("gestion.regularisations_gm") && (
                  <Link
                    to="/gestion/regularisations-gm"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Régularisations GM
                  </Link>
                )}
              </div>
            )}
          </li>
        )}

        {canSeeImports && (
          <li className="relative">
            <button
              onClick={() => {
                setImportsOpen(!importsOpen);
                setRecapitulatifsOpen(false);
                setGestionOpen(false);
                setAdminOpen(false);
                setSettingsOpen(false);
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Import. CSV
              <ChevronDown
                className={`h-4 w-4 transition-transform ${importsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {importsOpen && (
              <div className={dropdownClass}>
                {hasMenuPermission("import.grand_materiel") && (
                  <Link
                    to="/imports/gm-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Grand Matériel
                  </Link>
                )}
                {hasMenuPermission("import.pointage") && (
                  <Link
                    to="/imports/pointage-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Pointage
                  </Link>
                )}
                {hasMenuPermission("import.marque") && (
                  <Link
                    to="/imports/marque-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Marque Materiel
                  </Link>
                )}
                {hasMenuPermission("import.type_marque") && (
                  <Link
                    to="/imports/type-marque-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Type Marque Materiel
                  </Link>
                )}
                {hasMenuPermission("import.sous_famille") && (
                  <Link
                    to="/imports/sous-famille-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Sous Familles Materiel
                  </Link>
                )}
                {hasMenuPermission("import.famille") && (
                  <Link
                    to="/imports/famille-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Familles Matériel
                  </Link>
                )}
                {hasMenuPermission("import.categorie_gm") && (
                  <Link
                    to="/imports/categorie-gm-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Catégories GM
                  </Link>
                )}
                {hasMenuPermission("import.situation_affectation") && (
                  <Link
                    to="/imports/situation-affectation-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Situations-Affectations
                  </Link>
                )}
                {hasMenuPermission("import.site") && (
                  <Link
                    to="/imports/site-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Sites
                  </Link>
                )}
                {hasMenuPermission("import.regularisation") && (
                  <Link
                    to="/imports/regularisation-gm-csv"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Régularisation GM
                  </Link>
                )}
              </div>
            )}
          </li>
        )}

        {canSeeAdmin && (
          <li className="relative">
            <button
              onClick={() => {
                setAdminOpen(!adminOpen);
                setImportsOpen(false);
                setRecapitulatifsOpen(false);
                setGestionOpen(false);
                setSettingsOpen(false);
              }}
              className="flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              Administration
              <ChevronDown
                className={`h-4 w-4 transition-transform ${adminOpen ? "rotate-180" : ""}`}
              />
            </button>

            {adminOpen && (
              <div className={`${dropdownClass} w-64`}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Administration</div>
                {hasMenuPermission("administration.journalisation") && (
                  <Link
                    to="/admin/journalisation"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Journalisation
                  </Link>
                )}
                {hasMenuPermission("administration.users") && (
                  <Link
                    to="/admin/users"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Utilisateurs
                  </Link>
                )}
                {(hasMenuPermission("administration.external_apps") || hasMenuPermission("administration.users")) && (
                  <Link
                    to="/admin/external-apps"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    External Apps
                  </Link>
                )}
                {hasMenuPermission("administration.users") && (
                  <Link
                    to="/admin/pending-imports"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Imports en attente
                  </Link>
                )}
                <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Référentiels</div>
                {hasMenuPermission("gestion.entreprises") && (
                  <Link
                    to="/gestion/entreprises"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Entreprises
                  </Link>
                )}
                {hasMenuPermission("gestion.filiales") && (
                  <Link
                    to="/gestion/filiales"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Filiales
                  </Link>
                )}
                {hasMenuPermission("gestion.types_affectation") && (
                  <Link
                    to="/gestion/types-affectation"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Types Affectation
                  </Link>
                )}
                {hasMenuPermission("gestion.types_situation") && (
                  <Link
                    to="/gestion/types-situation"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Types Situation
                  </Link>
                )}
                {hasMenuPermission("gestion.types_etat_materiel") && (
                  <Link
                    to="/gestion/types-etat-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Types État Matériel
                  </Link>
                )}
                <div className="border-t border-slate-100 dark:border-dark-border my-1" />
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Matériel</div>
                {hasMenuPermission("gestion.categories_gm") && (
                  <Link
                    to="/gestion/categories-gm"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Catégories GM
                  </Link>
                )}
                {hasMenuPermission("gestion.familles_materiel") && (
                  <Link
                    to="/gestion/familles-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Familles Matériel
                  </Link>
                )}
                {hasMenuPermission("gestion.sous_familles_materiel") && (
                  <Link
                    to="/gestion/sous-familles-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Sous-Familles Matériel
                  </Link>
                )}
                {hasMenuPermission("gestion.marques_materiel") && (
                  <Link
                    to="/gestion/marques-materiel"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Marques Matériel
                  </Link>
                )}
                {hasMenuPermission("gestion.types_marque") && (
                  <Link
                    to="/gestion/types-marque"
                    onClick={closeAllDropdowns}
                    className={dropdownItemClass}
                  >
                    Types de Marque
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
              setSettingsOpen(!settingsOpen);
              setImportsOpen(false);
              setRecapitulatifsOpen(false);
              setGestionOpen(false);
              setAdminOpen(false);
              setUserMenuOpen(false);
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
                  closeAllDropdowns();
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
                  closeAllDropdowns();
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

        <NotificationBell />

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
                onClick={closeAllDropdowns}
                className={dropdownItemClass}
              >
                <User className="h-4 w-4" />
                Profil
              </Link>

              <Link
                to="/notifications"
                onClick={closeAllDropdowns}
                className={dropdownItemClass}
              >
                <Bell className="h-4 w-4" />
                Notifications
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
