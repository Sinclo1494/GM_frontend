import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { TypeMarque } from "../types/models";

const fields = [
    { name: "code_type_marque", label: "Code Type Marque", type: "text" as const, required: true },
    { name: "libelle_type_marque", label: "Libellé", type: "text" as const, required: true },
    { name: "code_marque", label: "Marque", type: "select" as const, required: false },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const columns: ColumnDef<TypeMarque>[] = [
    { key: "code_type_marque", label: "Code", width: "min-w-[150px]", sortable: true },
    { key: "libelle_type_marque", label: "Libellé", width: "min-w-[200px]", sortable: true },
    { key: "code_marque", label: "Marque", width: "min-w-[150px]", sortable: true, render: (val: unknown) => <>{val ?? "—"}</> },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
];

export default function TypeMarquePage() {
    const { options: marqueOptions } = useEntityOptions<any>("marque-materiel", "code_marque", "libelle_marque");

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_marque" ? { ...f, options: marqueOptions } : f,
    );

    return (
        <CrudPage<TypeMarque>
            title="Types de Marque"
            endpoint="type-marque"
            fields={fieldsWithOptions}
            columns={columns}
        />
    );
}

