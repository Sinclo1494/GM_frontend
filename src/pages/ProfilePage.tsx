import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { usePermissions } from "../auth/PermissionContext";
import { components } from "../theme/components";
import { getUserPreferences, updateUserPreferences, changePassword } from "../api/userService";
import { PERMISSIONS } from "../auth/permissions";
import type { UserPreferences } from "../types/user";
import { Save, Lock } from "lucide-react";
import SearchableSelect from "../components/common/SearchableSelect";

export default function ProfilePage() {
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<UserPreferences>({
    default_landing_page: "",
    remember_last_visited_page: false,
    last_visited_page: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    getUserPreferences()
      .then((data) => setPreferences(data))
      .catch(() => setError("Impossible de charger les préférences."))
      .finally(() => setLoading(false));
  }, []);

  const accessiblePages = PERMISSIONS.filter((p) => hasPermission(p.key));

  const handleSavePreferences = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: Partial<UserPreferences> = {
        default_landing_page: preferences.default_landing_page,
        remember_last_visited_page: preferences.remember_last_visited_page,
      };
      const data = await updateUserPreferences(payload);
      setPreferences(data);
      setSuccess("Préférences enregistrées.");
    } catch {
      setError("Erreur lors de l'enregistrement des préférences.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tous les champs sont obligatoires.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 1) {
      setPasswordError("Le nouveau mot de passe est trop court.");
      return;
    }

    setChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Mot de passe modifié. Vous allez être déconnecté...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { current_password?: string[]; detail?: string } } };
      const data = axiosError.response?.data;
      if (data?.current_password) {
        setPasswordError(data.current_password[0] || "Mot de passe actuel incorrect.");
      } else if (data?.detail) {
        setPasswordError(data.detail);
      } else {
        setPasswordError("Erreur lors du changement de mot de passe.");
      }
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <h1 className={components.pageTitle}>Profil</h1>
      <p className={components.pageDescription}>Gérez vos préférences de navigation et votre mot de passe.</p>

      {error && (
        <p className="text-md text-red-700 px-3 py-2 rounded-md bg-red-50 border border-red-200 dark:border-red-800">
          {error}
        </p>
      )}
      {success && (
        <p className="text-md text-green-700 px-3 py-2 rounded-md bg-green-50 border border-green-200 dark:border-green-800">
          {success}
        </p>
      )}

      <div className={components.card}>
        <div className={components.cardHeader}>
          <h2 className={components.sectionTitle}>Préférences de navigation</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className={components.label}>Page d'accueil par défaut</label>
            <SearchableSelect
              value={preferences.default_landing_page}
              onChange={(val) =>
                setPreferences({ ...preferences, default_landing_page: val })
              }
              options={accessiblePages.map((p) => ({ value: p.route, label: p.label }))}
              placeholder="— Par défaut —"
            />
            <p className="text-xs text-gray-500 mt-1 dark:text-dark-text-secondary">
              Seules les pages auxquelles vous avez accès sont affichées.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className={components.label}>Reprendre ma dernière page visitée</label>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                Après connexion, revenir automatiquement à la dernière page consultée.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPreferences({ ...preferences, remember_last_visited_page: !preferences.remember_last_visited_page })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.remember_last_visited_page ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.remember_last_visited_page ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={saving}
              className={`${components.button.primary} flex items-center gap-2`}
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      </div>

      <div className={components.card}>
        <div className={components.cardHeader}>
          <h2 className={components.sectionTitle}>Sécurité</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className={components.label}>Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={components.input}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={components.label}>Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={components.input}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={components.label}>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={components.input}
                autoComplete="new-password"
              />
            </div>

            {passwordError && (
              <p className="text-md text-red-700 px-3 py-2 rounded-md bg-red-50 border border-red-200 dark:border-red-800">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="text-md text-green-700 px-3 py-2 rounded-md bg-green-50 border border-green-200 dark:border-green-800">
                {passwordSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={changing}
              className={`${components.button.danger} flex items-center gap-2`}
            >
              {changing ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
