import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { CategorieGM } from "../types/models";

const fields = [
    { name: "code_categorie", label: "Code Catégorie", type: "text" as const, required: true },
    { name: "libelle_categorie", label: "Libellé", type: "text" as const, required: true },
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

export default function CategorieGMPage() {
    const { options: categorieOptions } = useEntityOptions<any>("categorie-gm", "code_categorie", "libelle_categorie");
    const categorieFilterOptions = toCodeLibelle(categorieOptions);

    const columns: ColumnDef<CategorieGM>[] = [
        { key: "code_categorie", label: "Catégorie GM", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_categorie", options: categorieFilterOptions }, render: (_val, row) => CODE_LIBELLE(row.code_categorie, row.libelle_categorie) },
        { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
            <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
                {val ? "BloquÃ©" : "Actif"}
            </span>
        )},
    ];

    return (
        <CrudPage<CategorieGM>
            title="Catégories GM"
            endpoint="categorie-gm"
            writePermission="gestion.categories_gm.write"
            fields={fields}
            columns={columns}
        />
    );
}
