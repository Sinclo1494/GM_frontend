import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { TypeSituation } from "../types/models";

const fields = [
    { name: "code_type_situation", label: "Code Situation", type: "text" as const, required: true },
    { name: "libelle_type_situation", label: "Libellé", type: "text" as const, required: true },
    { name: "code_type_affectation", label: "Type Affectation", type: "select" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<TypeSituation>[] = [
    { key: "code_type_situation", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_type_situation", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key:"code_type_affectation", label: "Code Type Affectation", width: "min-w-[150px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function TypeSituationPage() {
    const { options: typeAffectationOptions } = useEntityOptions<any>("type-affectation", "code_type_affectation", "libelle_type_affectation");

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_type_affectation" ? { ...f, options: typeAffectationOptions } : f,
    );

    return (
        <CrudPage<TypeSituation>
            title="Types de Situation"
            endpoint="type-situation"
            fields={fieldsWithOptions}
            columns={columns}
        />
    );
}

