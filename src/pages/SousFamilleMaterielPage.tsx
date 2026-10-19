import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { SousFamilleMateriel } from "../types/models";

const fields = [
    { name: "code_sous_famille", label: "Code Sous-Famille", type: "text" as const, required: true },
    { name: "libelle_sous_famille", label: "Libellé", type: "text" as const, required: true },
    { name: "code_famille_materiel", label: "Famille Matériel", type: "select" as const, required: true },
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

export default function SousFamilleMaterielPage() {
    const { options: familleOptions } = useEntityOptions<any>("famille-materiel", "code_famille", "libelle_famille");
    const { options: sousFamilleOptions } = useEntityOptions<any>("sous-famille-materiel", "code_sous_famille", "libelle_sous_famille");

    const familleFilterOptions = toCodeLibelle(familleOptions);
    const sousFamilleFilterOptions = toCodeLibelle(sousFamilleOptions);

    const columns: ColumnDef<SousFamilleMateriel>[] = [
        { key: "code_sous_famille", label: "Sous-Famille", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_sous_famille", options: sousFamilleFilterOptions }, render: (_val, row) => CODE_LIBELLE(row.code_sous_famille, row.libelle_sous_famille) },
        { key: "code_famille_materiel", label: "Famille", width: "min-w-[220px]", sortable: true, filter: { type: "select", param: "code_famille_materiel", options: familleFilterOptions }, render: (_val, row) => <span>{row.code_famille_materiel ?? "—"}</span> },
        { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "BloquÃ©" }] }, render: (val: unknown) => (
            <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
                {val ? "BloquÃ©" : "Actif"}
            </span>
        )},
    ];

    const fieldsWithOptions = fields.map((f) =>
        f.name === "code_famille_materiel" ? { ...f, options: familleFilterOptions } : f,
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
