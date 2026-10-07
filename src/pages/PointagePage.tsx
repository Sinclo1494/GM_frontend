import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import { usePermissions } from "../auth/PermissionContext";
import type { Pointage } from "../types/models";

const fields = [
    { name: "affectation_id", label: "Affectation", type: "select" as const, required: true },
    { name: "mmaa", label: "Mois/Année", type: "text" as const, required: true, placeholder: "AAAA-MM-JJ" },
    { name: "taux_location", label: "Taux Location", type: "number" as const },
    { name: "heures_service", label: "Heures Service", type: "number" as const, required: true },
    { name: "heures_chomage", label: "Heures Chômage", type: "number" as const, required: true },
    { name: "heures_panne", label: "Heures Panne", type: "number" as const, required: true },
    { name: "potentiel", label: "Potentiel", type: "number" as const, required: true },
    { name: "montant_service", label: "Montant Service", type: "number" as const },
    { name: "montant_chomage", label: "Montant Chômage", type: "number" as const },
    { name: "montant_panne", label: "Montant Panne", type: "number" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
    { name: "user_id", label: "Utilisateur", type: "select" as const },
    { name: "date_modification", label: "Date Modification", type: "datetime-local" as const, required: true },
    { name: "created_at", label: "Créé le", type: "readonly" as const, readOnly: true },
    { name: "updated_at", label: "Mis à jour le", type: "readonly" as const, readOnly: true },
];

const columns: ColumnDef<Pointage>[] = [
    { key: "code_affectation", label: "Affectation", width: "min-w-[140px]", sortable: true, filter: { param: "code_affectation" } },
    { key: "code_materiel", label: "Matériel", width: "min-w-[130px]", sortable: true, filter: { param: "code_materiel" } },
    { key: "code_site", label: "Site", width: "min-w-[110px]", sortable: true, filter: { param: "code_site" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "code_filiale", label: "Filiale", width: "min-w-[110px]", sortable: true, filter: { param: "code_filiale" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "mmaa", label: "Mois/Année", width: "min-w-[120px]", sortable: true, filter: { param: "mmaa", placeholder: "MM/AAAA" } },
    { key: "taux_location", label: "Taux Location", width: "min-w-[130px]", sortable: true, filter: { param: "taux_location" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "heures_service", label: "H. Service", width: "min-w-[120px]", sortable: true, filter: { param: "heures_service" } },
    { key: "heures_chomage", label: "H. Chômage", width: "min-w-[120px]", sortable: true, filter: { param: "heures_chomage" } },
    { key: "heures_panne", label: "H. Panne", width: "min-w-[120px]", sortable: true, filter: { param: "heures_panne" } },
    { key: "potentiel", label: "Potentiel", width: "min-w-[100px]", sortable: true, filter: { param: "potentiel" } },
    { key: "montant_service", label: "Mt. Service", width: "min-w-[130px]", sortable: true, filter: { param: "montant_service" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "montant_chomage", label: "Mt. Chômage", width: "min-w-[130px]", sortable: true, filter: { param: "montant_chomage" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "montant_panne", label: "Mt. Panne", width: "min-w-[130px]", sortable: true, filter: { param: "montant_panne" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "user", label: "Utilisateur", width: "min-w-[140px]", sortable: true, filter: { param: "user" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "date_modification", label: "Modifié le", width: "min-w-[160px]", sortable: true, filter: { param: "date_modification", placeholder: "JJ/MM/AAAA" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "created_at", label: "Créé le", width: "min-w-[160px]", sortable: true, filter: { param: "created_at", placeholder: "JJ/MM/AAAA" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "updated_at", label: "Mis à jour le", width: "min-w-[160px]", sortable: true, filter: { param: "updated_at", placeholder: "JJ/MM/AAAA" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "Bloqué" }] }, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

type AffectationOption = { id: number; code_affectation: string };
type UserOption = { id: number; username: string };

export default function PointagePage() {
    const { options: affectationOptions } = useEntityOptions<AffectationOption>("affectation-materiel", "id", "code_affectation");
    const { options: userOptions } = useEntityOptions<UserOption>("users", "id", "username");
    const { user } = usePermissions();

    const enrichedFields = fields.map((f) => {
        if (f.name === "affectation_id") return { ...f, options: affectationOptions };
        if (f.name === "user_id") return { ...f, options: userOptions };
        return f;
    });

    return (
        <CrudPage<Pointage>
            title="Pointages"
            endpoint="pointage"
            fields={enrichedFields}
            columns={columns}
            initialFormValues={() => ({
                date_modification: new Date().toISOString().slice(0, 16),
                user_id: user ? String(user.id) : "",
            })}
        />
    );
}