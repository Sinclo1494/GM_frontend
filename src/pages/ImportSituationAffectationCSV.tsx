import { useEffect, useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

import UploadZone from "../components/ImportCSV/UploadZone";
import FileInformation from "../components/ImportCSV/FileInformation";
import ImportStepper from "../components/ImportCSV/ImportStepper";
import ImportSettings from "../components/ImportCSV/ImportSettings";
import MappingTable from "../components/ImportCSV/MappingTable";
import MappingStatus from "../components/ImportCSV/MappingStatus";
import ValidationProgress from "../components/ImportCSV/ValidationProgress";
import ValidationSummary from "../components/ImportCSV/ValidationSummary";
import ValidationIssueTable from "../components/ImportCSV/ValidationIssueTable";
import ImportSuccess from "../components/ImportCSV/ImportSuccess";
import ImportError from "../components/ImportCSV/ImportError";

import {
    validateSituationAffectation,
    importSituationAffectation,
} from "../api/importServices";

import {
    type FilialeOption,
    getFiliales,
} from "../api/dataServices";

import {
    SITUATION_AFFECTATION_EXPECTED_FIELDS,
} from "../constants/expectedFields";

import type {
    ValidationResult,
    ImportResult,
    PreviewColumn,
} from "../types/importCsv";

import { components } from "../theme/components";

const STORAGE_KEY =
    "situation-affectation-column-mapping";

export default function ImportSituationAffectationCSV() {

    // ---------------------------------------------------------
    // State
    // ---------------------------------------------------------

    const expectedFields =
        SITUATION_AFFECTATION_EXPECTED_FIELDS;

    const [step, setStep] = useState(1);

    const [file, setFile] =
        useState<File | null>(null);

    const [filiales, setFiliales] =
        useState<FilialeOption[]>([]);

    const [selectedFiliale, setSelectedFiliale] =
        useState("");

    const [preview, setPreview] =
        useState<PreviewColumn[]>([]);

    const [mapping, setMapping] =
        useState<Record<number, string>>(() => {

            try {

                const saved =
                    localStorage.getItem(STORAGE_KEY);

                return saved
                    ? JSON.parse(saved)
                    : {};

            } catch {

                return {};

            }

        });

    const [loading, setLoading] =
        useState(false);

    const [importing, setImporting] =
        useState(false);

    const [result, setResult] =
        useState<ValidationResult | null>(null);

    const [importResult, setImportResult] =
        useState<ImportResult | null>(null);
    const [importError, setImportError] =
        useState<string | null>(null);

    // ---------------------------------------------------------
    // Mapping information
    // ---------------------------------------------------------

    const usedFields = Object.values(mapping);

    const missingRequired =
        SITUATION_AFFECTATION_EXPECTED_FIELDS.filter(
            (field) =>
                field.required &&
                !usedFields.includes(field.value)
        );

    const ignoredColumns = preview.filter(
        (column) => !mapping[column.index]
    ).length;

    // ---------------------------------------------------------
    // Invalidate previous validation
    // ---------------------------------------------------------

    const invalidateValidation = () => {

        setResult(null);
        setImportResult(null);
        setImportError(null);

    };

    // ---------------------------------------------------------
    // Read CSV preview
    // ---------------------------------------------------------

    const readPreview = async (
        selectedFile: File
    ) => {

        const text = await selectedFile.text();

        const rows = text
            .split(/\r?\n/)
            .filter(
                (row) => row.trim() !== ""
            )
            .map(
                (row) => row.split(";")
            );

        if (rows.length === 0) {

            setPreview([]);

            return;

        }

        const maxColumns = Math.max(
            ...rows.map(
                (row) => row.length
            )
        );

        const columns: PreviewColumn[] = [];

        for (
            let index = 0;
            index < maxColumns;
            index++
        ) {

            columns.push({

                index,

                samples: rows
                    .slice(0, 4)
                    .map(
                        (row) =>
                            row[index] || ""
                    ),

            });

        }

        setPreview(columns);

    };

    // ---------------------------------------------------------
    // File handlers
    // ---------------------------------------------------------

    const handleFileSelected = async (
        selectedFile: File
    ) => {

        invalidateValidation();

        setFile(selectedFile);

        await readPreview(selectedFile);

    };

    const handleRemoveFile = () => {

        invalidateValidation();

        setFile(null);
        setPreview([]);

    };

    // ---------------------------------------------------------
    // Filiale handler
    // ---------------------------------------------------------

    const handleFilialeChange = (
        value: string
    ) => {

        invalidateValidation();

        setSelectedFiliale(value);

    };

    // ---------------------------------------------------------
    // Mapping handlers
    // ---------------------------------------------------------

    const handleMappingChange = (
        columnIndex: number,
        fieldName: string
    ) => {

        invalidateValidation();

        setMapping((currentMapping) => {

            const newMapping = {
                ...currentMapping,
            };

            if (fieldName) {

                newMapping[columnIndex] =
                    fieldName;

            } else {

                delete newMapping[
                    columnIndex
                ];

            }

            return newMapping;

        });

    };

    const resetMapping = () => {

        invalidateValidation();

        localStorage.removeItem(
            STORAGE_KEY
        );

        setMapping({});

    };

    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------

    const runValidation = async () => {

        if (
            !file ||
            !selectedFiliale ||
            missingRequired.length > 0
        ) {
            return null;
        }

        setLoading(true);

        setResult(null);
        setImportResult(null);

        try {

            const response: ValidationResult =
                await validateSituationAffectation(
                    file,
                    mapping,
                    selectedFiliale
                );

            setResult(response);

            return response;

        } catch (error) {

            console.error(
                "Erreur pendant la validation :",
                error
            );

            return null;

        } finally {

            setLoading(false);

        }
    };
    // ---------------------------------------------------------
    // Import
    // ---------------------------------------------------------

    const runImport = async () => {
        setImportError(null);
        if (
            !result?.success ||
            !result.validation_id
        ) {
            return;
        }

        setImporting(true);

        try {

            const response: ImportResult =
                await importSituationAffectation(
                    result.validation_id
                );

            setImportResult(response);

        } catch (error: any) {

            console.error(
                "Erreur pendant l'import :",
                error
            );

            const message =
                error.response?.data?.message ??
                error.response?.data?.detail ??
                error.message ??
                "Une erreur est survenue pendant l'import.";

            setImportError(message);

        } finally {

            setImporting(false);

        }
    };

    // ---------------------------------------------------------
    // Load filiales
    // ---------------------------------------------------------

    useEffect(() => {

        getFiliales()
            .then(setFiliales)
            .catch(console.error);

    }, []);

    // ---------------------------------------------------------
    // Persist mapping
    // ---------------------------------------------------------

    useEffect(() => {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(mapping)
        );

    }, [mapping]);

    // ---------------------------------------------------------
    // Render
    // ---------------------------------------------------------

    return (

        <div className="p-6">

            <div className="mx-auto max-w-7xl">

                <div className={components.card}>

                    {/* HEADER */}

                    <div className={components.cardHeader}>

                        <h1 className="text-xl font-bold dark:text-dark-text-primary">
                            Situations-Affectations - Import Des Données
                        </h1>

                        <p className={components.pageDescription}>
                            Importez un fichier CSV puis associez
                            les colonnes avant la validation.
                        </p>

                    </div>

                    {/* STEPPER */}

                    <ImportStepper step={step} />

                    <div className="p-6">

                        {/* ================================================= */}
                        {/* STEP 1 - FILE                                    */}
                        {/* ================================================= */}

                        {step === 1 && (

                            <>

                                <div className="grid gap-6 lg:grid-cols-2">

                                    {/* Accepted format */}

                                    <div className="rounded-xl border dark:border-dark-border dark:bg-dark-bg-secondary p-6">

                                        <h2 className="text-lg font-semibold dark:text-dark-text-primary">
                                            Format accepté
                                        </h2>

                                        <p className="mt-1 text-sm dark:text-dark-text-secondary">
                                            Votre fichier doit respecter
                                            les critères suivants.
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

                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">

                                                        <CheckCircle2
                                                            size={18}
                                                            className="shrink-0 text-green-600"
                                                        />

                                                    </div>

                                                    <span className="text-sm font-medium dark:text-dark-text-primary">
                                                        {item}
                                                    </span>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                    {/* Import settings */}

                                    <ImportSettings
                                        filiales={filiales}
                                        selectedFiliale={
                                            selectedFiliale
                                        }
                                        onFilialeChange={
                                            handleFilialeChange
                                        }
                                    />

                                </div>

                                {/* File upload / information */}

                                <div className="mt-6">

                                    {!file ? (

                                        <div className="mt-6">

                                            <UploadZone
                                                onFileSelected={handleFileSelected}
                                            />

                                        </div>

                                    ) : (

                                        <div className="mt-6 space-y-4">

                                            <FileInformation file={file} />

                                            <div className="flex justify-end">

                                                <button
                                                    type="button"
                                                    onClick={handleRemoveFile}
                                                    className={components.button.danger}
                                                >
                                                    Supprimer le fichier
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>

                                {/* Continue */}

                                {file && selectedFiliale && (

                                    <div className="mt-8 flex justify-end">

                                        <button
                                            onClick={() =>
                                                setStep(2)
                                            }
                                            className={components.button.primaryLarge}
                                        >
                                            Continuer

                                            <ArrowRight
                                                size={18}
                                            />

                                        </button>

                                    </div>

                                )}

                            </>

                        )}
                        {/* ================================================= */}
                        {/* STEP 2 - MAPPING                                 */}
                        {/* ================================================= */}

                        {step === 2 && (

                            <>

                                <div className="mb-6">

                                    <h2 className="text-xl font-semibold dark:text-dark-text-primary">
                                        Correspondance des colonnes
                                    </h2>

                                    <p className="mt-1 dark:text-dark-text-secondary">
                                        Associez chaque colonne du fichier
                                        à un champ métier.
                                    </p>

                                    <button
                                        onClick={resetMapping}
                                        className={components.button.secondary}
                                    >
                                        Réinitialiser la correspondance
                                    </button>

                                </div>

                                {/* Mapping */}

                                <MappingTable
                                    preview={preview}
                                    mapping={mapping}
                                    expectedFields={expectedFields}
                                    onMappingChange={
                                        handleMappingChange
                                    }
                                />

                                {/* Mapping status */}

                                <div className="mt-5">

                                    <MappingStatus
                                        missingRequired={
                                            missingRequired
                                        }
                                        ignoredColumns={
                                            ignoredColumns
                                        }
                                    />

                                </div>

                                {/* Navigation */}

                                <div className="mt-8 flex justify-between">

                                    <button
                                        onClick={() =>
                                            setStep(1)
                                        }
                                        className={components.button.secondary}
                                    >
                                        <ArrowLeft size={18} />

                                        Retour

                                    </button>

                                    <button
                                        disabled={
                                            missingRequired.length > 0 ||
                                            loading
                                        }
                                        onClick={async () => {

                                            const validationResult =
                                                await runValidation();

                                            if (validationResult) {

                                                setStep(3);

                                            }

                                        }}
                                        className={components.button.primary}
                                    >
                                        {loading
                                            ? "Validation..."
                                            : "Valider"}
                                    </button>

                                </div>

                            </>

                        )}
                        {/* ================================================= */}
                        {/* STEP 3 - VALIDATION / IMPORT                     */}
                        {/* ================================================= */}

                        {step === 3 && (

                            <div className="space-y-8">

                                {/* Validation header */}

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                                    <div>

                                        <h2 className="text-2xl font-semibold dark:text-dark-text-primary">
                                            Validation du fichier
                                        </h2>

                                        <p className="mt-1 dark:text-dark-text-secondary">
                                            Vous pouvez relancer la validation
                                            autant de fois que nécessaire.
                                        </p>

                                    </div>

                                    <button
                                        onClick={runValidation}
                                        disabled={loading || importing}
                                        className={components.button.successLarge}
                                    >
                                        {loading
                                            ? "Validation..."
                                            : "Relancer la validation"}
                                    </button>

                                </div>

                                {/* Validation progress */}

                                {loading && (

                                    <ValidationProgress
                                        title="Validation en cours"
                                        description="Analyse et vérification des données du fichier..."
                                    />

                                )}

                                {/* Validation result */}

                                {result && (

                                    <div className="space-y-6">

                                        <ValidationSummary
                                            summary={
                                                result.summary
                                            }
                                        />

                                        <ValidationIssueTable
                                            issues={
                                                result.errors
                                            }
                                            severity="error"
                                        />

                                        {result.warnings.length > 0 && (

                                            <ValidationIssueTable
                                                issues={
                                                    result.warnings
                                                }
                                                severity="warning"
                                            />

                                        )}

                                    </div>

                                )}
                                {/* Navigation / Import */}

                                <div className="flex justify-between border-t dark:border-dark-border pt-6">

                                    <button
                                        onClick={() =>
                                            setStep(2)
                                        }
                                        disabled={
                                            loading ||
                                            importing
                                        }
                                        className={components.button.secondary}
                                    >
                                        <ArrowLeft size={18} />

                                        Retour

                                    </button>

                                    {result?.success &&
                                        result.validation_id &&
                                        !importResult && (

                                            <button
                                                onClick={
                                                    runImport
                                                }
                                                disabled={
                                                    importing ||
                                                    loading
                                                }
                                                className={components.button.primaryLarge}
                                            >
                                                {importing
                                                    ? "Importation..."
                                                    : "Importer les données"}
                                            </button>

                                        )}

                                </div>

                                {/* Import progress */}

                                {importing && (

                                    <ValidationProgress
                                        title="Importation en cours"
                                        description="Enregistrement des données validées..."
                                    />

                                )}
                                {/* Import error */}

                                {importError && (

                                    <ImportError
                                        message={importError}
                                    />

                                )}

                                {/* Import success */}

                                {importResult && (

                                    <ImportSuccess
                                        result={
                                            importResult
                                        }
                                    />

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}
