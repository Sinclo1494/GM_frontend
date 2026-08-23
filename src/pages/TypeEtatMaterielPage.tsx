import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { TypeEtatMateriel } from "../types/models";

const fields = [
    { name: "code_type_etat_materiel", label: "Code État", type: "text" as const, required: true },
    { name: "libelle_type_etat_materiel", label: "Libellé", type: "text" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<TypeEtatMateriel>[] = [
    { key: "code_type_etat_materiel", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_type_etat_materiel", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function TypeEtatMaterielPage() {
    return (
        <CrudPage<TypeEtatMateriel>
            title="Types d'État Matériel"
            endpoint="type-etat-materiel"
            fields={fields}
            columns={columns}
        />
    );
}

