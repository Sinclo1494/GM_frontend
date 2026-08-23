import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { AffectationMateriel } from "../types/models";

const fields = [
    { name: "code_affectation", label: "Code Affectation", type: "text" as const, required: true },
    { name: "code_materiel", label: "Matériel", type: "select" as const, required: true },
    { name: "code_filiale_mere", label: "Filiale", type: "select" as const, required: true },
    { name: "code_site", label: "Site", type: "select" as const, required: true },
    { name: "date_affectation", label: "Date Affectation", type: "datetime-local" as const, required: true },
    { name: "date_debut_affectation", label: "Date Début", type: "datetime-local" as const },
    { name: "date_fin_affectation", label: "Date Fin", type: "datetime-local" as const },
    { name: "prenable", label: "Prenable", type: "checkbox" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<AffectationMateriel>[] = [
    { key: "code_affectation", label: "Code", width: "min-w-[140px]", sortable: true },
    { key: "code_materiel", label: "Matériel", width: "min-w-[130px]", sortable: true },
    { key: "code_filiale_mere", label: "Filiale", width: "min-w-[130px]", sortable: true },
    { key: "code_site", label: "Site", width: "min-w-[130px]", sortable: true },
    { key: "date_affectation", label: "Date Affectation", width: "min-w-[170px]", sortable: true },
    { key: "prenable", label: "Prenable", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-gray-100 text-gray-700 dark:text-dark-text-primary px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Oui" : "Non"}
        </span>
    )},
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function AffectationMaterielPage() {
    const { options: materielOptions } = useEntityOptions<any>("grand-materiel", "code_materiel", "designation");
    const { options: filialeOptions } = useEntityOptions<any>("filiale", "code_filiale", "libelle_filiale");
    const { options: siteOptions } = useEntityOptions<any>("site", "code_site", "libelle_site");

    const enrichedFields = fields.map((f) => {
        if (f.name === "code_materiel") return { ...f, options: materielOptions };
        if (f.name === "code_filiale_mere") return { ...f, options: filialeOptions };
        if (f.name === "code_site") return { ...f, options: siteOptions };
        return f;
    });

    return (
        <CrudPage<AffectationMateriel>
            title="Affectations Matériel"
            endpoint="affectation-materiel"
            fields={enrichedFields}
            columns={columns}
        />
    );
}

