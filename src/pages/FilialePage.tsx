import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { Filiale } from "../types/models";

const fields = [
    { name: "code_filiale", label: "Code Filiale", type: "text" as const, required: true },
    { name: "libelle_filiale", label: "Libellé", type: "text" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<Filiale>[] = [
    { key: "code_filiale", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_filiale", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function FilialePage() {
    return (
        <CrudPage<Filiale>
            title="Filiales"
            endpoint="filiale"
            fields={fields}
            columns={columns}
        />
    );
}

