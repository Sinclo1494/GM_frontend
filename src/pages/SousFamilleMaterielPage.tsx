import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { SousFamilleMateriel } from "../types/models";

const fields = [
    { name: "code_sous_famille", label: "Code Sous-Famille", type: "text" as const, required: true },
    { name: "libelle_sous_famille", label: "Libellé", type: "text" as const, required: true },
    { name: "code_famille_materiel", label: "Famille Matériel", type: "select" as const, required: true },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<SousFamilleMateriel>[] = [
    { key: "code_sous_famille", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_sous_famille", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "code_famille_materiel", label: "Famille", width: "min-w-[150px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function SousFamilleMaterielPage() {
    const { options: familleOptions } = useEntityOptions<any>("famille-materiel", "code_famille", "libelle_famille");

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_famille_materiel" ? { ...f, options: familleOptions } : f,
    );

    return (
        <CrudPage<SousFamilleMateriel>
            title="Sous-Familles Matériel"
            endpoint="sous-famille-materiel"
            fields={fieldsWithOptions}
            columns={columns}
        />
    );
}

