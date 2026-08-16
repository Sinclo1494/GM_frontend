import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { ChevronDown, LogOut } from "lucide-react";

const Navbar = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [importsOpen, setImportsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [gestionOpen, setGestionOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dropdownClass =
    "absolute left-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-200 overflow-hidden z-50";

  const dropdownItemClass =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors";

  return (
    <nav className="w-full bg-slate-900 text-white px-6 h-16 flex items-center justify-between">
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
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Référentiels</div>
              <Link to="/gestion/entreprises" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Entreprises</Link>
              <Link to="/gestion/filiales" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Filiales</Link>
              <Link to="/gestion/divisions" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Divisions</Link>
              <Link to="/gestion/familles-structures" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Structures</Link>
              <div className="border-t border-slate-100 my-1" />
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Matériel</div>
              <Link to="/gestion/categories-gm" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Catégories GM</Link>
              <Link to="/gestion/familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Familles Matériel</Link>
              <Link to="/gestion/sous-familles-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Sous-Familles Matériel</Link>
              <Link to="/gestion/marques-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Marques Matériel</Link>
              <Link to="/gestion/types-marque" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Types de Marque</Link>
              <Link to="/gestion/grand-materiel" onClick={() => setGestionOpen(false)} className={dropdownItemClass}>Grand Matériel</Link>
              <div className="border-t border-slate-100 my-1" />
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Opérations</div>
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

      {/* RIGHT - User Menu */}
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
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-slate-100">
              Signed in
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
