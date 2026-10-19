import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { MarqueMateriel } from "../types/models";

const fields = [
    { name: "code_marque", label: "Code Marque", type: "text" as const, required: true },
    { name: "libelle_marque", label: "Libellé", type: "text" as const, required: true },
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

export default function MarqueMaterielPage() {
    const { options: marqueOptions } = useEntityOptions<any>("marque-materiel", "code_marque", "libelle_marque");
    const marqueFilterOptions = toCodeLibelle(marqueOptions);

    const columns: ColumnDef<MarqueMateriel>[] = [
        { key: "code_marque", label: "Marque", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_marque", options: marqueFilterOptions }, render: (_val, row) => CODE_LIBELLE(row.code_marque, row.libelle_marque) },
        { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
            <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
                {val ? "BloquÃ©" : "Actif"}
            </span>
        )},
    ];

    return (
        <CrudPage<MarqueMateriel>
            title="Marques Matériel"
            endpoint="marque-materiel"
            fields={fields}
            columns={columns}
        />
    );
}
