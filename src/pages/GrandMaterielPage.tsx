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

const columns: ColumnDef<GrandMateriel>[] = [
    { key: "code_materiel", label: "Code", width: "min-w-[140px]", sortable: true },
    { key: "designation", label: "Désignation", width: "min-w-[180px]", sortable: true },
    { key: "num_serie", label: "N° Série", width: "min-w-[140px]", sortable: true },
    { key: "immatriculation", label: "Immatriculation", width: "min-w-[140px]", sortable: true },
    { key: "code_sous_famille_materiel", label: "Sous-Famille", width: "min-w-[160px]", sortable: true },
    { key: "code_type_marque", label: "Type Marque", width: "min-w-[150px]", sortable: true },
    { key: "valeur_acquisition", label: "Valeur Acq.", width: "min-w-[130px]", sortable: true },
    { key: "est_bloque", label: "Statut", width: "min-w-[100px]", sortable: true, render: (val: unknown) => (
        <span className={val ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-semibold" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold"}>
            {val ? "Bloqué" : "Actif"}
        </span>
    )},
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
