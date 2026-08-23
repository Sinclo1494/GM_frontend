import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { ChevronDown, LogOut, Settings, Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [importsOpen, setImportsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [gestionOpen, setGestionOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  return (
    <nav ref={navRef} className="w-full bg-slate-900 text-white px-6 h-16 flex items-center justify-between">
      {/* LEFT - Brand */}
      <Link to="/" className="text-lg font-bold">
        Grand Matériel
      </Link>

      {/* CENTER - Links */}
      <ul className="flex items-center gap-6 text-sm">
        <li>
          <Link
            to="/"
            className="hover:text-gray-300 transition-colors"
          >
            Home
          </Link>
        </li>

        {/* CSV Import Dropdown */}
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
              <Link
                to="/imports/gm-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Grand Matériel
              </Link>
              <Link
                to="/imports/pointage-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Pointage
              </Link>
              <Link
                to="/imports/marque-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Marque Materiel
              </Link>
              <Link
                to="/imports/type-marque-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Type Marque Materiel
              </Link>
              <Link
                to="/imports/sous-famille-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Sous Familles Materiel
              </Link>
              <Link
                to="/imports/situation-affectation-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Situations-Affectations
              </Link>
              <Link
                to="/imports/site-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Sites
              </Link>
              <Link
                to="/imports/regularisation-gm-csv"
                onClick={() => setImportsOpen(false)}
                className={dropdownItemClass}
              >
                Régularisation GM
              </Link>
            </div>
          )}
        </li>

        {/* Reports Dropdown */}
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
              <Link
                to="/reports/journal-materiel"
                onClick={() => setReportsOpen(false)}
                className={dropdownItemClass}
              >
                Journal Matériel
              </Link>

              <Link
                to="/reports/analyse-quantitative"
                onClick={() => setReportsOpen(false)}
                className={dropdownItemClass}
              >
                Analyse Quantitative
              </Link>
              <Link
                to="/reports/analyse-exploitation"
                onClick={() => setReportsOpen(false)}
                className={dropdownItemClass}
              >
                Analyse Exploitation
              </Link>
            </div>
          )}
        </li>

        {/* Gestion Dropdown */}
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
            <div className={dropdownClass + " w-64"}>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Référentiels</div>
              <Link to="/gestion/entreprises" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Entreprises</Link>
              <Link to="/gestion/filiales" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Filiales</Link>
              <Link to="/gestion/divisions" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Divisions</Link>
              <Link to="/gestion/familles-structures" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Structures</Link>
              <div className="border-t border-slate-100 dark:border-dark-border my-1" />
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Matériel</div>
              <Link to="/gestion/categories-gm" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Catégories GM</Link>
              <Link to="/gestion/familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Matériel</Link>
              <Link to="/gestion/sous-familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Sous-Familles Matériel</Link>
              <Link to="/gestion/marques-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Marques Matériel</Link>
              <Link to="/gestion/types-marque" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types de Marque</Link>
              <Link to="/gestion/grand-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Grand Matériel</Link>
              <div className="border-t border-slate-100 dark:border-dark-border my-1" />
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase">Opérations</div>
              <Link to="/gestion/types-affectation" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types Affectation</Link>
              <Link to="/gestion/types-situation" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types Situation</Link>
              <Link to="/gestion/types-etat-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types État Matériel</Link>
              <Link to="/gestion/sites" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Sites</Link>
              <Link to="/gestion/affectations" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Affectations</Link>
              <Link to="/gestion/situations" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Situations</Link>
              <Link to="/gestion/pointages" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Pointages</Link>
              <Link to="/gestion/regularisations-gm" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Régularisations GM</Link>
              <Link to="/gestion/regularisations-mois" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Régularisations Mensuelles</Link>
            </div>
          )}
        </li>

        {/* Administration Dropdown */}
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
              <Link
                to="/admin/journalisation"
                onClick={() => setAdminOpen(false)}
                className={dropdownItemClass}
              >
                Journalisation
              </Link>
            </div>
          )}
        </li>
      </ul>

      {/* RIGHT - User Menu + Settings */}
      <div className="flex items-center gap-3">
        {/* Settings Dropdown */}
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

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span className="h-2 w-2 bg-green-400 rounded-full"></span>
            <span>User</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {userMenuOpen && (
            <div className={dropdownClass}>
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-dark-text-secondary border-b border-slate-100 dark:border-dark-border">
                Signed in
              </div>

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
