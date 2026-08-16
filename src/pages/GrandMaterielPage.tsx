import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { GrandMateriel } from "../types/models";

const fields = [
    { name: "code_materiel", label: "Code Matériel", type: "text" as const, required: true },
    { name: "designation", label: "Désignation", type: "text" as const, required: true },
    { name: "num_serie", label: "N° Série", type: "text" as const },
    { name: "immatriculation", label: "Immatriculation", type: "text" as const },
    { name: "date_acquisition", label: "Date Acquisition", type: "date" as const },
    { name: "valeur_acquisition", label: "Valeur Acquisition", type: "number" as const, required: true },
    { name: "valeur_remplacement", label: "Valeur Remplacement", type: "number" as const },
    { name: "taux_amortissement", label: "Taux Amortissement", type: "number" as const },
    { name: "puissance_materiel", label: "Puissance", type: "text" as const },
    { name: "code_sous_famille_materiel", label: "Sous-Famille", type: "select" as const, required: true },
    { name: "code_type_marque", label: "Type Marque", type: "select" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<GrandMateriel>[] = [
    { key: "code_materiel", label: "Code", width: "min-w-[140px]", sortable: true },
    { key: "designation", label: "Désignation", width: "min-w-[180px]", sortable: true },
    { key: "num_serie", label: "N° Série", width: "min-w-[140px]", sortable: true },
    { key: "immatriculation", label: "Immatriculation", width: "min-w-[140px]", sortable: true },
    { key: "code_sous_famille_materiel", label: "Sous-Famille", width: "min-w-[160px]", sortable: true },
    { key: "code_type_marque", label: "Type Marque", width: "min-w-[150px]", sortable: true },
    { key: "valeur_acquisition", label: "Valeur Acq.", width: "min-w-[130px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function GrandMaterielPage() {
    const { options: sousFamilleOptions } = useEntityOptions<any>("sous-famille-materiel", "code_sous_famille", "libelle_sous_famille");
    const { options: typeMarqueOptions } = useEntityOptions<any>("type-marque", "code_type_marque", "libelle_type_marque");

    const enrichedFields = fields.map((f) => {
        if (f.name === "code_sous_famille_materiel") return { ...f, options: sousFamilleOptions };
        if (f.name === "code_type_marque") return { ...f, options: typeMarqueOptions };
        return f;
    });

    return (
        <CrudPage<GrandMateriel>
            title="Grand Matériel"
            endpoint="grand-materiel"
            fields={enrichedFields}
            columns={columns}
        />
    );
}

