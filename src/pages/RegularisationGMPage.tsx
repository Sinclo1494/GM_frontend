import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { RegularisationGM } from "../types/models";

const fields = [
    { name: "code_site", label: "Site", type: "select" as const, required: true },
    { name: "mmaa", label: "Mois/Année", type: "text" as const, required: true },
    { name: "montant_regularisation", label: "Montant", type: "number" as const, required: true },
    { name: "observation", label: "Observation", type: "textarea" as const },
    { name: "date_modification", label: "Date Modification", type: "datetime-local" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<RegularisationGM>[] = [
    { key: "code_site", label: "Site", width: "min-w-[140px]", sortable: true, filter: { param: "code_site" } },
    { key: "mmaa", label: "Mois/Année", width: "min-w-[120px]", sortable: true, filter: { param: "mmaa" } },
    { key: "montant_regularisation", label: "Montant", width: "min-w-[130px]", sortable: true, filter: { param: "montant_regularisation" } },
    { key: "observation", label: "Observation", width: "min-w-[200px]", sortable: true, filter: { param: "observation" } },
    { key: "date_modification", label: "Modifié le", width: "min-w-[160px]", sortable: true, filter: { param: "date_modification", placeholder: "JJ/MM/AAAA" }, render: (val: unknown) => <>{val ?? "â€”"}</> },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "Bloqué" }] }, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function RegularisationGMPage() {
    const { options: siteOptions } = useEntityOptions<any>("site", "code_site", "libelle_site");

    const enrichedFields = fields.map((f) =>
        f.name === "code_site" ? { ...f, options: siteOptions } : f,
    );

    return (
        <CrudPage<RegularisationGM>
            title="Régularisations GM"
            endpoint="regularisation-gm"
            writePermission="gestion.regularisations_gm.write"
            fields={enrichedFields}
            columns={columns}
        />
    );
}

