import type { ImportResult } from "../../types/importCsv";

interface Props {
    result: ImportResult;
}

export default function ImportSuccess({
    result,
}: Props) {
    return (
        <div className="rounded-xl border border-green-300 bg-green-50 p-5">
            <h2 className="mb-3 text-lg font-semibold text-green-700 dark:text-green-400">
                Import terminé
            </h2>

            <p className="text-green-700 dark:text-green-400">
                {result.message ??
                    `${result.imported_rows} ligne(s) importée(s) avec succès.`}
            </p>

            {result.import_batch_id && (
                <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
                    Lot d'import : {result.import_batch_id}
                </p>
            )}
        </div>
    );
}
