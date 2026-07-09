import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Circle,
    ArrowRight,
    ArrowLeft,
    FileSpreadsheet,
    AlertTriangle,
} from "lucide-react";

import UploadZone from "../components/ImportCSV/UploadZone";
import FileInformation from "../components/ImportCSV/FileInformation";
import {
    validatePointage,
    importPointage,
} from "../api/importServices";
import { EXPECTED_FIELDS } from "../constants/expectedFields";
import { type FilialeOption, getFiliales } from "../api/dataServices";



export default function ImportCsvPage() {

    const [step, setStep] = useState(1);

    const [file, setFile] = useState<File | null>(null);

    const [filiales, setFiliales] = useState<FilialeOption[]>([]);
    const [selectedFiliale, setSelectedFiliale] = useState<string>("");

    const [preview, setPreview] = useState<any[]>([]);

    const STORAGE_KEY = "pointage-column-mapping";
    const [mapping, setMapping] = useState<Record<number, string>>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    });

    const [loading, setLoading] = useState(false);

    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);

    const [result, setResult] = useState<any>();

    async function readPreview(file: File) {

        const text = await file.text();

        const rows = text
            .split(/\r?\n/)
            .filter(Boolean)
            .map((r) => r.split(";"));

        const max = Math.max(...rows.map((r) => r.length));

        const columns = [];

        for (let i = 0; i < max; i++) {

            columns.push({
                index: i,
                samples: rows.slice(0, 4).map((r) => r[i] || ""),
            });

        }

        setPreview(columns);

    }

    const usedFields = Object.values(mapping);

    const missingRequired = EXPECTED_FIELDS.filter(
        (f) =>
            f.required &&
            !Object.values(mapping).includes(f.value)
    );

    const ignoredColumns = preview.filter(
        (c) => !mapping[c.index]
    ).length;

    const runValidation = async () => {

        if (!file) return;

        setLoading(true);

        try {

            const response = await validatePointage(file, mapping, selectedFiliale);

            setResult(response);
            setImportResult(null);

            return response;

        } finally {

            setLoading(false);

        }

    };
    useEffect(() => {
        getFiliales().then(setFiliales).catch(console.error);
    }, []);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(mapping)
        );
    }, [mapping]);

    return (

        <div className="mx-auto max-w-7xl p-8">

            <div className="rounded-2xl border bg-white shadow">

                <div className="border-b p-6">

                    <h1 className="text-3xl font-bold">
                        Import des données
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Importez un fichier CSV puis associez
                        les colonnes avant la validation.
                    </p>

                </div>

                {/* Stepper */}

                <div className="flex justify-between border-b bg-slate-50 px-8 py-5">

                    {[
                        "Fichier",
                        "Correspondance",
                        "Validation",
                        "Import",
                    ].map((label, index) => (

                        <div
                            key={label}
                            className="flex items-center gap-3"
                        >

                            {step > index + 1 ? (
                                <CheckCircle2
                                    className="text-green-600"
                                    size={22}
                                />
                            ) : step === index + 1 ? (
                                <CheckCircle2
                                    className="text-blue-600"
                                    size={22}
                                />
                            ) : (
                                <Circle
                                    className="text-gray-300"
                                    size={22}
                                />
                            )}

                            <span
                                className={`font-medium ${step === index + 1
                                    ? "text-blue-700"
                                    : "text-gray-500"
                                    }`}
                            >
                                {label}
                            </span>

                        </div>

                    ))}

                </div>

                <div className="p-8">

                    {/* STEP 1 */}

                    {step === 1 && (
                        <>
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Accepted format */}
                                <div className="rounded-xl border bg-slate-50 p-6">
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Format accepté
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Votre fichier doit respecter les critères suivants.
                                    </p>

                                    <div className="mt-5 grid gap-3">
                                        {[
                                            "Format CSV",
                                            "Encodage UTF-8",
                                            "Séparateur ';'",
                                            "Sans ligne d'en-tête",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 py-2"
                                            >
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                    <CheckCircle2
                                                        size={18}
                                                        className="text-green-600 shrink-0"
                                                    />
                                                </div>

                                                <span className="text-sm font-medium text-slate-700">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Filiale */}
                                <div className="rounded-xl border bg-slate-50 p-6">
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Paramètres d'import
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Sélectionnez la filiale correspondant au fichier à importer.
                                    </p>

                                    <div className="mt-6">
                                        <label
                                            htmlFor="filiale"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Filiale
                                        </label>

                                        <select
                                            id="filiale"
                                            name="filiale"
                                            className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            onChange={(e) =>
                                                setSelectedFiliale(e.target.value)
                                            }
                                        >
                                            <option value="">
                                                Sélectionnez une filiale...
                                            </option>

                                            {filiales.map((filiale) => (
                                                <option
                                                    key={filiale.value}
                                                    value={filiale.value}
                                                >
                                                    {filiale.value} - {filiale.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {!file ? (
                                <div className="mt-6">
                                    <UploadZone
                                        onFileSelected={async (f) => {
                                            setFile(f);
                                            await readPreview(f);
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    <FileInformation file={file} />

                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setFile(null);
                                                setPreview([]);
                                            }}
                                            className="rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
                                        >
                                            Supprimer le fichier
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Continue */}

                            {file && selectedFiliale && (
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setResult(null);
                                            setImportResult(null);
                                            setStep(2);
                                        }}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                                    >
                                        Continuer
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 2 */}

                    {step === 2 && (

                        <>

                            <div className="mb-6 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-semibold">
                                        Correspondance des colonnes
                                    </h2>

                                    <p className="text-gray-500 mt-1">
                                        Associez chaque colonne du fichier
                                        à un champ métier.
                                    </p>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem(STORAGE_KEY);
                                            setMapping({});
                                        }}
                                        className="rounded border px-4 py-2"
                                    >
                                        Réinitialiser la correspondance
                                    </button>

                                </div>

                                <div className="rounded-lg border bg-amber-50 px-4 py-2 text-sm">

                                    Colonnes ignorées :
                                    <span className="ml-2 font-bold">
                                        {ignoredColumns}
                                    </span>

                                </div>

                            </div>

                            <div className="overflow-hidden rounded-xl border">

                                <table className="w-full">

                                    <thead className="sticky top-0 bg-slate-100">

                                        <tr>

                                            <th className="w-28 px-4 py-3 text-left">
                                                Colonne
                                            </th>

                                            <th className="px-4 py-3 text-left">
                                                Aperçu
                                            </th>

                                            <th className="w-80 px-4 py-3 text-left">
                                                Champ attendu
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {preview.map((column) => (

                                            <tr
                                                key={column.index}
                                                className="border-t hover:bg-slate-50"
                                            >

                                                <td className="px-4 py-4 font-medium">

                                                    <div className="flex items-center gap-2">

                                                        <FileSpreadsheet size={18} />

                                                        Col. {column.index + 1}

                                                    </div>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <div className="space-y-1 text-sm">

                                                        {column.samples.map((s: string, i: number) => (

                                                            <div key={i}>
                                                                {s || "-"}
                                                            </div>

                                                        ))}

                                                    </div>

                                                </td>

                                                <td className="px-4 py-4">

                                                    <select
                                                        value={mapping[column.index] || ""}
                                                        onChange={(e) =>
                                                            setMapping({
                                                                ...mapping,
                                                                [column.index]:
                                                                    e.target.value,
                                                            })
                                                        }
                                                        className="w-full rounded-lg border px-3 py-2"
                                                    >

                                                        <option value="">
                                                            Ignorer
                                                        </option>

                                                        {EXPECTED_FIELDS.map((field) => (

                                                            <option
                                                                key={field.value}
                                                                value={field.value}
                                                                disabled={
                                                                    usedFields.includes(field.value) &&
                                                                    mapping[column.index] !== field.value
                                                                }
                                                            >

                                                                {field.label}

                                                                {field.required &&
                                                                    " *"}

                                                            </option>

                                                        ))}

                                                    </select>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                            <div className="mt-5">

                                {missingRequired.length === 0 ? (

                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

                                        ✓ Tous les champs obligatoires sont associés.

                                    </div>

                                ) : (

                                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">

                                        <div className="flex items-center gap-2">

                                            <AlertTriangle size={18} />

                                            <span className="font-medium">
                                                Champs obligatoires manquants
                                            </span>

                                        </div>

                                        <div className="mt-2 text-sm">

                                            {missingRequired
                                                .map((x) => x.label)
                                                .join(", ")}

                                        </div>

                                    </div>

                                )}

                            </div>

                            <div className="mt-8 flex justify-between">

                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 rounded-lg border px-5 py-2 hover:bg-gray-50"
                                >
                                    <ArrowLeft size={18} />

                                    Retour

                                </button>

                                <button
                                    disabled={missingRequired.length > 0}
                                    onClick={async () => {
                                        await runValidation();
                                        setStep(3);
                                    }}
                                    className="rounded-lg bg-blue-600 px-6 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    Valider
                                </button>

                            </div>

                        </>

                    )}

                    {/* STEP 3 */}

                    {/* STEP 3 */}

                    {step === 3 && (

                        <div className="space-y-8">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="text-2xl font-semibold">
                                        Validation du fichier
                                    </h2>

                                    <p className="mt-1 text-gray-500">
                                        Vous pouvez relancer la validation autant de fois que nécessaire.
                                    </p>
                                </div>

                                <button
                                    onClick={runValidation}
                                    className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
                                    disabled={loading}
                                >

                                    {loading
                                        ? "Validation..."
                                        : result
                                            ? "Relancer la validation"
                                            : "Lancer la validation"}

                                </button>

                            </div>

                            {/* Validation Result */}

                            {result && (

                                <div className="space-y-6">

                                    {/* Summary */}

                                    <div className="grid grid-cols-4 gap-4">

                                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="mt-2 text-3xl font-bold">
                                                {result.summary.total_rows}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                                            <p className="text-sm text-green-700">
                                                Lignes valides
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-green-700">
                                                {result.summary.valid_rows}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                                            <p className="text-sm text-red-700">
                                                Erreurs
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-red-700">
                                                {result.summary.errors}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                                            <p className="text-sm text-yellow-700">
                                                Avertissements
                                            </p>
                                            <p className="mt-2 text-3xl font-bold text-yellow-700">
                                                {result.summary.warnings}
                                            </p>
                                        </div>

                                    </div>

                                    {/* Temporary JSON */}

                                    <div className="space-y-8">

                                        {/* ERRORS */}

                                        <div className="rounded-xl border overflow-hidden">

                                            <div className="flex items-center justify-between border-b bg-red-50 px-5 py-4">

                                                <h3 className="text-lg font-semibold text-red-700">
                                                    Erreurs ({result.errors.length})
                                                </h3>

                                                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                                                    Bloquantes
                                                </span>

                                            </div>

                                            {result.errors.length === 0 ? (

                                                <div className="p-10 text-center text-green-600">

                                                    ✓ Aucune erreur.

                                                </div>

                                            ) : (

                                                <div className="max-h-[500px] overflow-auto">

                                                    <table className="w-full">

                                                        <thead className="sticky top-0 bg-slate-100">

                                                            <tr>

                                                                <th className="w-24 px-4 py-3 text-left">
                                                                    Ligne
                                                                </th>

                                                                <th className="w-64 px-4 py-3 text-left">
                                                                    Champ
                                                                </th>

                                                                <th className="px-4 py-3 text-left">
                                                                    Valeur
                                                                </th>

                                                                <th className="w-[420px] px-4 py-3 text-left">
                                                                    Message
                                                                </th>

                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {result.errors.map((error: any, index: number) => (

                                                                <tr
                                                                    key={index}
                                                                    className="border-t even:bg-slate-50 hover:bg-red-50"
                                                                >

                                                                    <td className="px-4 py-3 font-medium">

                                                                        {error.line ?? "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3">

                                                                        {error.field ?? "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3 font-mono text-sm">

                                                                        {error.value || "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3 text-red-700">

                                                                        {error.message}

                                                                    </td>

                                                                </tr>

                                                            ))}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            )}

                                        </div>

                                        {/* WARNINGS */}

                                        {result.warnings.length > 0 && (

                                            <div className="rounded-xl border overflow-hidden">

                                                <div className="flex items-center justify-between border-b bg-yellow-50 px-5 py-4">

                                                    <h3 className="text-lg font-semibold text-yellow-700">

                                                        Avertissements ({result.warnings.length})

                                                    </h3>

                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">

                                                        Non bloquants

                                                    </span>

                                                </div>

                                                <div className="max-h-[350px] overflow-auto">

                                                    <table className="w-full">

                                                        <thead className="sticky top-0 bg-slate-100">

                                                            <tr>

                                                                <th className="w-24 px-4 py-3 text-left">

                                                                    Ligne

                                                                </th>

                                                                <th className="w-64 px-4 py-3 text-left">

                                                                    Champ

                                                                </th>

                                                                <th className="px-4 py-3 text-left">

                                                                    Valeur

                                                                </th>

                                                                <th className="w-[420px] px-4 py-3 text-left">

                                                                    Message

                                                                </th>

                                                            </tr>

                                                        </thead>

                                                        <tbody>

                                                            {result.warnings.map((warning: any, index: number) => (

                                                                <tr
                                                                    key={index}
                                                                    className="border-t even:bg-slate-50 hover:bg-yellow-50"
                                                                >

                                                                    <td className="px-4 py-3">

                                                                        {warning.line ?? "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3">

                                                                        {warning.field ?? "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3 font-mono text-sm">

                                                                        {warning.value || "-"}

                                                                    </td>

                                                                    <td className="px-4 py-3 text-yellow-700">

                                                                        {warning.message}

                                                                    </td>

                                                                </tr>

                                                            ))}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

                            {/* Footer buttons */}

                            <div className="flex justify-between border-t pt-6">

                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 rounded-lg border px-5 py-3 hover:bg-gray-50"
                                >

                                    <ArrowLeft size={18} />

                                    Retour

                                </button>

                                {result?.success &&
                                    result.summary.errors === 0 &&
                                    !importResult && (

                                        <button
                                            onClick={async () => {

                                                if (!file) return;

                                                setImporting(true);

                                                try {

                                                    const response = await importPointage(
                                                        file,
                                                        mapping,
                                                        selectedFiliale
                                                    );

                                                    setImportResult(response);

                                                } finally {

                                                    setImporting(false);

                                                }

                                            }}
                                            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                                        >

                                            {importing
                                                ? "Importation..."
                                                : "Importer les données"}

                                        </button>

                                    )}

                            </div>

                            {importResult && (

                                <div className="rounded-xl border border-green-300 bg-green-50 p-5">

                                    <h2 className="mb-3 text-lg font-semibold text-green-700">
                                        Import terminé
                                    </h2>

                                    <pre className="overflow-auto text-sm">
                                        {JSON.stringify(importResult, null, 2)}
                                    </pre>

                                </div>

                            )}

                        </div>

                    )}
                </div>

            </div>

        </div>

    );

}