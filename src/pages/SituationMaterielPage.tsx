import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { SituationMateriel } from "../types/models";

const fields = [
    { name: "affectation_id", label: "Affectation", type: "select" as const, required: true },
    { name: "type_situation_id", label: "Type Situation", type: "select" as const, required: true },
    { name: "code_type_etat_materiel", label: "État Matériel", type: "select" as const, required: true },
    { name: "date_situation", label: "Date Situation", type: "datetime-local" as const, required: true },
    { name: "date_modification", label: "Date Modification", type: "datetime-local" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<SituationMateriel>[] = [
    { key: "id_situation", label: "ID", width: "min-w-[120px]", sortable: true, filter: { param: "id_situation" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "code_affectation", label: "Affectation", width: "min-w-[140px]", sortable: true, filter: { param: "code_affectation" } },
    { key: "filiale", label: "Filiale", width: "min-w-[100px]", sortable: true, filter: { param: "code_filiale" } },
    { key: "code_type_affectation", label: "Type Affectation", width: "min-w-[150px]", sortable: true, filter: { param: "type_affectation_libelle", placeholder: "Code / Libellé" } },
    { key: "code_type_situation", label: "Type Situation", width: "min-w-[150px]", sortable: true, filter: { param: "type_situation_libelle", placeholder: "Code / Libellé" } },
    { key: "etat_materiel", label: "État", width: "min-w-[150px]", sortable: true, filter: { param: "etat_materiel_libelle", placeholder: "Code / Libellé" } },
    { key: "date_situation", label: "Date", width: "min-w-[160px]", sortable: true, filter: { param: "date_situation", placeholder: "JJ/MM/AAAA" } },
    { key: "date_modification", label: "Modifié le", width: "min-w-[160px]", sortable: true, filter: { param: "date_modification", placeholder: "JJ/MM/AAAA" }, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "Bloqué" }] }, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function SituationMaterielPage() {
    const { options: affectationOptions } = useEntityOptions<any>("affectation-materiel", "id", "code_affectation");
    const { options: typeSituationOptions } = useEntityOptions<any>("type-situation", "id", "libelle_type_situation");
    const { options: etatOptions } = useEntityOptions<any>("type-etat-materiel", "code_type_etat_materiel", "libelle_type_etat_materiel");

    const enrichedFields = fields.map((f) => {
        if (f.name === "affectation_id") return { ...f, options: affectationOptions };
        if (f.name === "type_situation_id") return { ...f, options: typeSituationOptions };
        if (f.name === "code_type_etat_materiel") return { ...f, options: etatOptions };
        return f;
    });

    return (
        <CrudPage<SituationMateriel>
            title="Situations Matériel"
            endpoint="situation-materiel"
            fields={enrichedFields}
            columns={columns}
        />
    );
}

