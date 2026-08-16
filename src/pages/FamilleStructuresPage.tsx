import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { FamilleStructures } from "../types/models";

const fields = [
    { name: "code_famille_structure", label: "Code Famille", type: "text" as const, required: true },
    { name: "libelle_famille_structure", label: "Libellé", type: "text" as const, required: true },
    { name: "numero_ordre", label: "Numéro Ordre", type: "text" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<FamilleStructures>[] = [
    { key: "code_famille_structure", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_famille_structure", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "numero_ordre", label: "N° Ordre", width: "min-w-[100px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function FamilleStructuresPage() {
    return (
        <CrudPage<FamilleStructures>
            title="Familles de Structures"
            endpoint="famille-structures"
            fields={fields}
            columns={columns}
        />
    );
}

