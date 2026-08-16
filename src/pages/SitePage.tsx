import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { Site } from "../types/models";

const fields = [
    { name: "code_site", label: "Code Site", type: "text" as const, required: true },
    { name: "libelle_site", label: "Libellé", type: "text" as const, required: true },
    { name: "code_region", label: "Région", type: "text" as const, required: true },
    { name: "code_agence", label: "Agence", type: "text" as const, required: true },
    { name: "type_site", label: "Type Site", type: "text" as const, required: true },
    { name: "numero_ss_employeur", label: "N° SS Employeur", type: "text" as const, required: true },
    { name: "code_commune_site", label: "Commune", type: "text" as const, required: true },
    { name: "jour_cloture_mouv_RH_paie", label: "Jour Clôture RH/Paie", type: "number" as const },
    { name: "date_ouverture_site", label: "Date Ouverture", type: "date" as const },
    { name: "date_cloture_site", label: "Date Clôture", type: "date" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<Site>[] = [
    { key: "code_site", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_site", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "code_region", label: "Région", width: "min-w-[130px]", sortable: true },
    { key: "type_site", label: "Type", width: "min-w-[130px]", sortable: true },
    { key: "code_agence", label: "Agence", width: "min-w-[130px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function SitePage() {
    return (
        <CrudPage<Site>
            title="Sites"
            endpoint="site"
            fields={fields}
            columns={columns}
        />
    );
}

