import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { TypeMarque } from "../types/models";

const fields = [
    { name: "code_type_marque", label: "Code Type Marque", type: "text" as const, required: true },
    { name: "libelle_type_marque", label: "Libellé", type: "text" as const, required: true },
    { name: "code_marque", label: "Marque", type: "select" as const, required: false },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const },
];

const CODE_LIBELLE = (code: string | null | undefined, libelle: string | null | undefined) => {
    const c = (code ?? "").toString().trim();
    const l = (libelle ?? "").toString().trim();
    if (!c && !l) return <span>—</span>;
    return <span>{c}${l ? ` - ${l}` : ""}</span>;
};

const toCodeLibelle = (opts: { value: string; label: string }[]) =>
    opts.map((o) => ({ value: o.value, label: `${o.value} - ${o.label}` }));

export default function TypeMarquePage() {
    const { options: typeMarqueOptions } = useEntityOptions<any>("type-marque", "code_type_marque", "libelle_type_marque");
    const { options: marqueOptions } = useEntityOptions<any>("marque-materiel", "code_marque", "libelle_marque");

    const typeMarqueFilterOptions = toCodeLibelle(typeMarqueOptions);
    const marqueFilterOptions = toCodeLibelle(marqueOptions);

    const columns: ColumnDef<TypeMarque>[] = [
        { key: "code_type_marque", label: "Type Marque", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_type_marque", options: typeMarqueFilterOptions }, render: (_val, row) => CODE_LIBELLE(row.code_type_marque, row.libelle_type_marque) },
        { key: "code_marque", label: "Marque", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_marque", options: marqueFilterOptions }, render: (_val, row) => <span>{row.code_marque ?? "—"}</span> },
        { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
            <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
                {val ? "BloquÃ©" : "Actif"}
            </span>
        )},
    ];

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_marque" ? { ...f, options: marqueFilterOptions } : f,
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
