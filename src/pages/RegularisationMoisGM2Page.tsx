import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { RegularisationMoisGM2 } from "../types/models";

const fields = [
    { name: "code_regularisation", label: "Code Régularisation", type: "text" as const, required: true },
    { name: "montant_regularisation", label: "Montant", type: "number" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<RegularisationMoisGM2>[] = [
    { key: "code_regularisation", label: "Code", width: "min-w-[180px]", sortable: true, filter: { param: "code_regularisation" } },
    { key: "montant_regularisation", label: "Montant", width: "min-w-[150px]", sortable: true, filter: { param: "montant_regularisation" } },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "BloquÃ©" : "Actif"}
        </span>
    )},
];

export default function RegularisationMoisGM2Page() {
    return (
        <CrudPage<RegularisationMoisGM2>
            title="Régularisations Mensuelles"
            endpoint="regularisation-mois-gm2"
            fields={fields}
            columns={columns}
        />
    );
}

