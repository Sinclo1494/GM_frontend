import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { Entreprise } from "../types/models";

const fields = [
    { name: "code_entreprise", label: "Code Entreprise", type: "text" as const, required: true },
    { name: "raison_sociale", label: "Raison Sociale", type: "text" as const, required: true },
    { name: "numero_registre_commerce", label: "N° Registre Commerce", type: "text" as const, required: true },
    { name: "numero_compte_bancaire", label: "N° Compte Bancaire", type: "text" as const, required: true },
    { name: "capital_social", label: "Capital Social", type: "number" as const, required: true },
    { name: "date_registre_commerce", label: "Date Registre Commerce", type: "date" as const, required: true },
    { name: "type_dossier", label: "Type Dossier", type: "text" as const, required: true },
    { name: "entete", label: "Entête", type: "textarea" as const },
    { name: "numero_identification_fiscale", label: "N° Identification Fiscale", type: "text" as const },
    { name: "numero_article_imposition", label: "N° Article Imposition", type: "text" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<Entreprise>[] = [
    { key: "code_entreprise", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "raison_sociale", label: "Raison Sociale", width: "min-w-[200px]", sortable: true },
    { key: "numero_registre_commerce", label: "N° RC", width: "min-w-[150px]", sortable: true },
    { key: "capital_social", label: "Capital Social", width: "min-w-[150px]", sortable: true },
    { key: "type_dossier", label: "Type Dossier", width: "min-w-[130px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function EntreprisePage() {
    return (
        <CrudPage<Entreprise>
            title="Entreprises"
            endpoint="entreprise"
            fields={fields}
            columns={columns}
        />
    );
}

