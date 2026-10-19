import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { FamilleMateriel } from "../types/models";

const fields = [
    { name: "code_famille", label: "Code Famille", type: "text" as const, required: true },
    { name: "libelle_famille", label: "Libellé", type: "text" as const, required: true },
    { name: "code_categorie_gm", label: "Catégorie GM", type: "select" as const, required: true },
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

export default function FamilleMaterielPage() {
    const { options: categorieOptions } = useEntityOptions<any>("categorie-gm", "code_categorie", "libelle_categorie");
    const { options: familleOptions } = useEntityOptions<any>("famille-materiel", "code_famille", "libelle_famille");

    const categorieFilterOptions = toCodeLibelle(categorieOptions);
    const familleFilterOptions = toCodeLibelle(familleOptions);

    const columns: ColumnDef<FamilleMateriel>[] = [
        { key: "code_famille", label: "Famille", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_famille", options: familleFilterOptions }, render: (_val, row) => CODE_LIBELLE(row.code_famille, row.libelle_famille) },
        { key: "code_categorie_gm", label: "CatÃ©gorie", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_categorie_gm", options: categorieFilterOptions }, render: (_val, row) => <span>{row.code_categorie_gm ?? "—"}</span> },
        { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
            <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
                {val ? "BloquÃ©" : "Actif"}
            </span>
        )},
    ];

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_categorie_gm" ? { ...f, options: categorieFilterOptions } : f,
    );

    return (
        <CrudPage<FamilleMateriel>
            title="Familles Matériel"
            endpoint="famille-materiel"
            fields={fieldsWithOptions}
            columns={columns}
        />
    );
}
