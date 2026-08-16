import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { Pointage } from "../types/models";

const fields = [
    { name: "affectation_id", label: "Affectation", type: "select" as const, required: true },
    { name: "mmaa", label: "Mois/Année", type: "text" as const, required: true },
    { name: "taux_location", label: "Taux Location", type: "number" as const },
    { name: "heures_service", label: "Heures Service", type: "number" as const, required: true },
    { name: "heures_chomage", label: "Heures Chômage", type: "number" as const, required: true },
    { name: "heures_panne", label: "Heures Panne", type: "number" as const, required: true },
    { name: "potentiel", label: "Potentiel", type: "number" as const, required: true },
    { name: "montant_service", label: "Montant Service", type: "number" as const },
    { name: "montant_chomage", label: "Montant Chômage", type: "number" as const },
    { name: "montant_panne", label: "Montant Panne", type: "number" as const },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<Pointage>[] = [
    { key: "code_affectation", label: "Affectation", width: "min-w-[140px]", sortable: true },
    { key: "code_materiel", label: "Matériel", width: "min-w-[130px]", sortable: true },
    { key: "mmaa", label: "Mois/Année", width: "min-w-[120px]", sortable: true },
    { key: "heures_service", label: "H. Service", width: "min-w-[120px]", sortable: true },
    { key: "heures_chomage", label: "H. Chômage", width: "min-w-[120px]", sortable: true },
    { key: "heures_panne", label: "H. Panne", width: "min-w-[120px]", sortable: true },
    { key: "potentiel", label: "Potentiel", width: "min-w-[100px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function PointagePage() {
    const { options: affectationOptions } = useEntityOptions<any>("affectation-materiel", "id", "code_affectation");

    const enrichedFields = fields.map((f) =>
        f.name === "affectation_id" ? { ...f, options: affectationOptions } : f,
    );

    return (
        <CrudPage<Pointage>
            title="Pointages"
            endpoint="pointage"
            fields={enrichedFields}
            columns={columns}
        />
    );
}

