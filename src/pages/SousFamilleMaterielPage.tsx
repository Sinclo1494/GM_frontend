import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import type { SousFamilleMateriel } from "../types/models";

const fields = [
    { name: "code_sous_famille", label: "Code Sous-Famille", type: "text" as const, required: true },
    { name: "libelle_sous_famille", label: "Libellé", type: "text" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<SousFamilleMateriel>[] = [
    { key: "code_sous_famille", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_sous_famille", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function SousFamilleMaterielPage() {
    return (
        <CrudPage<SousFamilleMateriel>
            title="Sous-Familles Matériel"
            endpoint="sous-famille-materiel"
            fields={fields}
            columns={columns}
        />
    );
}

