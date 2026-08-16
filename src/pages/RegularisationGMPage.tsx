import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { RegularisationGM } from "../types/models";

const fields = [
    { name: "code_site", label: "Site", type: "select" as const, required: true },
    { name: "mmaa", label: "Mois/Année", type: "text" as const, required: true },
    { name: "montant_regularisation", label: "Montant", type: "number" as const, required: true },
    { name: "observation", label: "Observation", type: "textarea" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<RegularisationGM>[] = [
    { key: "code_site", label: "Site", width: "min-w-[140px]", sortable: true },
    { key: "mmaa", label: "Mois/Année", width: "min-w-[120px]", sortable: true },
    { key: "montant_regularisation", label: "Montant", width: "min-w-[130px]", sortable: true },
    { key: "observation", label: "Observation", width: "min-w-[200px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
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
            fields={enrichedFields}
            columns={columns}
        />
    );
}

