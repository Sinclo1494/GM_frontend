import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { Filiale } from "../types/models";

const fields = [
    { name: "code_filiale", label: "Code Filiale", type: "text" as const, required: true },
    { name: "libelle_filiale", label: "Libellé", type: "text" as const, required: true },
    { name: "code_entreprise", label: "Entreprise", type: "select" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<Filiale>[] = [
    { key: "code_filiale", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_filiale", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "code_entreprise", label: "Entreprise", width: "min-w-[150px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function FilialePage() {
    const { options: entrepriseOptions } = useEntityOptions<any>("entreprise", "code_entreprise", "raison_sociale");

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_entreprise" ? { ...f, options: entrepriseOptions } : f,
    );

    return (
        <CrudPage<Filiale>
            title="Filiales"
            endpoint="filiale"
            fields={fieldsWithOptions}
            columns={columns}
        />
    );
}

