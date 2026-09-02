import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/useAuth";
import { components } from "../theme/components";
import { getUserPreferences, getCurrentUser } from "../api/userService";

const EXCLUDED_LOGIN_PATHS = new Set(["/login", "/profile"]);

async function getPostLoginRedirect(): Promise<string> {
  try {
    const [prefs, current] = await Promise.all([getUserPreferences(), getCurrentUser()]);
    const userPerms = new Set(current.permissions || []);
    const isSuperuser = current.is_superuser;

    const canAccess = (_route: string, permissionKey?: string) => {
      if (isSuperuser) return true;
      if (!permissionKey) return true;
      if (userPerms.has(permissionKey)) return true;
      return userPerms.has(`${permissionKey}.read`) || userPerms.has(`${permissionKey}.write`);
    };

    if (prefs.default_landing_page) {
      const perm = routePermission(prefs.default_landing_page);
      if (canAccess(prefs.default_landing_page, perm)) {
        return prefs.default_landing_page;
      }
    }
    if (prefs.remember_last_visited_page) {
      const last = localStorage.getItem("last_visited_page");
      if (last && !EXCLUDED_LOGIN_PATHS.has(last)) {
        const perm = routePermission(last);
        if (canAccess(last, perm)) {
          return last;
        }
        localStorage.removeItem("last_visited_page");
      }
    }
  } catch {
    // ignore preference load errors and fall back to default
  }
  return "/";
}

function routePermission(route: string): string | undefined {
  const map: Record<string, string> = {
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
    "/imports/situation-affectation-csv": "import.situation_affectation",
    "/imports/site-csv": "import.site",
    "/imports/regularisation-gm-csv": "import.regularisation",
  };
  return map[route];
}

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);



    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setShowPassword(false);

        try {
            const data = await loginUser(username, password);

            await login(data.access, data.refresh);
            const redirect = await getPostLoginRedirect();
            navigate(redirect);
        } catch {
            setError("Invalid username or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen  flex items-center justify-center px-4 ">
            
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className={`${components.loginCard} space-y-5`}
                >
                    {/* Logo / Title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-200">
                            GM Groupe
                        </h1>

                        <p className="text-white mt-2">
                            Sign in to continue
                        </p>
                    </div>

                    {/* Username */}
                    <div>
                        <label className={components.label}>
                            Username
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={components.input}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className={components.label}>
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={components.input + " pr-10"}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                            >
                                {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                }
                            </button>
                        </div>
                    </div>
                            {error && (
                                <p className="text-md text-red-700 px-3 py-2 rounded-md bg-red-50 border border-red-200 dark:border-red-800">
                                    {error}
                                </p>
                            )}

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${components.loginButton} w-full flex items-center justify-center gap-2`}
                    >
                        {loading && (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {
                            loading ? "Signing in ..." : "Login"
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
