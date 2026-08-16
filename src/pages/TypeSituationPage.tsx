import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { TypeSituation } from "../types/models";

const fields = [
    { name: "code_type_situation", label: "Code Situation", type: "text" as const, required: true },
    { name: "libelle_type_situation", label: "Libellé", type: "text" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<TypeSituation>[] = [
    { key: "code_type_situation", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_type_situation", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function TypeSituationPage() {
    return (
        <CrudPage<TypeSituation>
            title="Types de Situation"
            endpoint="type-situation"
            fields={fields}
            columns={columns}
        />
    );
}

