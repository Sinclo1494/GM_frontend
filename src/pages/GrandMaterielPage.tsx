import CrudPage, { type ColumnDef } from "../components/Crud/CrudPage";
import { useEntityOptions } from "../components/Crud/useEntityOptions";
import type { GrandMateriel } from "../types/models";

const fields = [
    { name: "code_materiel", label: "Code Matériel", type: "text" as const, required: true, section: "Matériel" },
    { name: "code_filiale_g", label: "Filiale", type: "select" as const, required: true, section: "Matériel" },
    { name: "designation", label: "Désignation", type: "text" as const, required: true, section: "Matériel" },
    { name: "num_serie", label: "N° Série", type: "text" as const, section: "Matériel" },
    { name: "immatriculation", label: "Immatriculation", type: "text" as const, section: "Matériel" },
    { name: "date_acquisition", label: "Date Acquisition", type: "date" as const, section: "Matériel" },
    { name: "valeur_acquisition", label: "Valeur Acquisition", type: "number" as const, required: true, section: "Matériel" },
    { name: "valeur_remplacement", label: "Valeur Remplacement", type: "number" as const, section: "Matériel" },
    { name: "taux_amortissement", label: "Taux Amortissement", type: "number" as const, section: "Matériel" },
    { name: "puissance_materiel", label: "Puissance", type: "text" as const, section: "Matériel" },
    { name: "code_sous_famille_materiel", label: "Sous-Famille", type: "select" as const, required: true, section: "Matériel" },
    { name: "code_type_marque", label: "Type Marque", type: "select" as const, section: "Matériel" },
    { name: "est_bloque", label: "Bloqué", type: "checkbox" as const, section: "Matériel" },

    { name: "code_site", label: "Site", type: "select" as const, required: true, section: "Affectation" },
    { name: "date_affectation", label: "Date Affectation", type: "datetime-local" as const, required: true, section: "Affectation" },
    { name: "date_debut_affectation", label: "Date Début d'Affectation", type: "datetime-local" as const, section: "Affectation" },
    { name: "date_fin_affectation", label: "Date Fin d'Affectation", type: "datetime-local" as const, section: "Affectation" },
    { name: "prenable", label: "Prenable", type: "checkbox" as const, section: "Affectation" },

    { name: "code_type_etat_materiel", label: "État Matériel", type: "select" as const, required: true, section: "Situation" },
    { name: "type_situation_id", label: "Type Situation", type: "select" as const, required: true, section: "Situation" },
    { name: "date_situation", label: "Date Situation", type: "datetime-local" as const, required: true, section: "Situation" },
    { name: "situation_est_bloque", label: "Situation Bloquée", type: "checkbox" as const, section: "Situation" },
];

const DASH = (val: unknown) => <>{val ?? "—"}</>;

const columns: ColumnDef<GrandMateriel>[] = [
    { key: "id", label: "ID", width: "min-w-[80px]", sortable: false, render: DASH },
    { key: "code_materiel", label: "Code", width: "min-w-[140px]", sortable: true, filter: { param: "code_materiel" } },
    { key: "designation", label: "Désignation", width: "min-w-[180px]", sortable: true, filter: { param: "designation" }, render: DASH },
    { key: "code_filiale_g", label: "Code Filiale", width: "min-w-[130px]", sortable: true, filter: { param: "code_filiale" }, render: DASH },
    { key: "libelle_filiale", label: "Filiale", width: "min-w-[150px]", sortable: true, filter: { param: "libelle_filiale" }, render: DASH },
    { key: "libelle_categorie", label: "Catégorie", width: "min-w-[150px]", sortable: true, filter: { param: "libelle_categorie" }, render: DASH },
    { key: "libelle_famille", label: "Famille", width: "min-w-[150px]", sortable: true, filter: { param: "libelle_famille" }, render: DASH },
    { key: "code_sous_famille_materiel", label: "Code Sous-Famille", width: "min-w-[170px]", sortable: true, sortParam: "code_sous_famille", filter: { param: "code_sous_famille" }, render: DASH },
    { key: "libelle_sous_famille", label: "Sous-Famille", width: "min-w-[160px]", sortable: true, filter: { param: "libelle_sous_famille" }, render: DASH },
    { key: "code_type_marque", label: "Code Type Marque", width: "min-w-[170px]", sortable: true, filter: { param: "code_type_marque" }, render: DASH },
    { key: "libelle_type_marque", label: "Type Marque", width: "min-w-[150px]", sortable: true, filter: { param: "libelle_type_marque" }, render: DASH },
    { key: "libelle_marque", label: "Marque", width: "min-w-[140px]", sortable: true, filter: { param: "libelle_marque" }, render: DASH },
    { key: "num_serie", label: "N° Série", width: "min-w-[140px]", sortable: true, filter: { param: "num_serie" }, render: DASH },
    { key: "immatriculation", label: "Immatriculation", width: "min-w-[140px]", sortable: true, filter: { param: "immatriculation" }, render: DASH },
    { key: "date_acquisition", label: "Date Acquisition", width: "min-w-[170px]", sortable: true, filter: { param: "date_acquisition", placeholder: "JJ/MM/AAAA" }, render: DASH },
    { key: "valeur_acquisition", label: "Valeur Acq.", width: "min-w-[130px]", sortable: true, filter: { param: "valeur_acquisition" }, render: DASH },
    { key: "valeur_remplacement", label: "Valeur Rempl.", width: "min-w-[140px]", sortable: true, filter: { param: "valeur_remplacement" }, render: DASH },
    { key: "taux_amortissement", label: "Taux Amort.", width: "min-w-[130px]", sortable: true, filter: { param: "taux_amortissement" }, render: DASH },
    { key: "puissance_materiel", label: "Puissance", width: "min-w-[120px]", sortable: true, filter: { param: "puissance_materiel" }, render: DASH },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, filter: { type: "select", param: "est_bloque", options: [{ value: "false", label: "Actif" }, { value: "true", label: "Bloqué" }] }, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
    { key: "user_id", label: "Créé par", width: "min-w-[100px]", sortable: false, render: DASH },
    { key: "date_modification", label: "Modifié le", width: "min-w-[160px]", sortable: false, filter: { param: "date_modification", placeholder: "JJ/MM/AAAA" }, render: DASH },
    { key: "created_at", label: "Créé le", width: "min-w-[160px]", sortable: false, filter: { param: "created_at", placeholder: "JJ/MM/AAAA" }, render: DASH },
    { key: "updated_at", label: "Mis à jour le", width: "min-w-[160px]", sortable: false, filter: { param: "updated_at", placeholder: "JJ/MM/AAAA" }, render: DASH },
];

export default function GrandMaterielPage() {
    const { options: filialeOptions } = useEntityOptions<any>("filiale", "code_filiale", "libelle_filiale");
    const { options: sousFamilleOptions } = useEntityOptions<any>("sous-famille-materiel", "code_sous_famille", "libelle_sous_famille");
    const { options: typeMarqueOptions } = useEntityOptions<any>("type-marque", "code_type_marque", "libelle_type_marque");
    const { options: siteOptions } = useEntityOptions<any>("site", "code_site", "libelle_site");
    const { options: etatOptions } = useEntityOptions<any>("type-etat-materiel", "code_type_etat_materiel", "libelle_type_etat_materiel");
    const { options: typeSituationOptions } = useEntityOptions<any>("type-situation", "id", "libelle_type_situation");

    const enrichedFields = fields.map((f) => {
        if (f.name === "code_filiale_g") return { ...f, options: filialeOptions };
        if (f.name === "code_sous_famille_materiel") return { ...f, options: sousFamilleOptions };
        if (f.name === "code_type_marque") return { ...f, options: typeMarqueOptions };
        if (f.name === "code_site") return { ...f, options: siteOptions };
        if (f.name === "code_type_etat_materiel") return { ...f, options: etatOptions };
        if (f.name === "type_situation_id") return { ...f, options: typeSituationOptions };
        return f;
    });

    return (
        <CrudPage<GrandMateriel>
            title="Grand Matériel"
            endpoint="grand-materiel"
            fields={enrichedFields}
            columns={columns}
            initialFormValues={() => ({
                date_affectation: new Date().toISOString().slice(0, 16),
                date_situation: new Date().toISOString().slice(0, 16),
                code_type_etat_materiel: "NEUF",
                prenable: false,
                situation_est_bloque: false,
            })}
            beforeSubmit={(values, mode) => {
                if (mode === "edit") {
                    const { code_site, date_affectation, date_debut_affectation, date_fin_affectation, prenable, code_type_etat_materiel, type_situation_id, date_situation, situation_est_bloque, ...rest } = values as Record<string, unknown>;
                    return rest;
                }
                const payload = { ...values };
                const now = new Date().toISOString().slice(0, 16);
                if (!payload.date_affectation) payload.date_affectation = now;
                if (!payload.date_situation) payload.date_situation = now;
                if (!payload.code_type_etat_materiel) payload.code_type_etat_materiel = "NEUF";
                return payload;
            }}
        />
    );
}
