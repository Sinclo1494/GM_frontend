import type { ImportResult } from "../../types/importCsv";

interface Props {
    result: ImportResult;
}

export default function ImportSuccess({
    result,
}: Props) {
    return (
        <div className="rounded-xl border border-green-300 bg-green-50 p-5">
            <h2 className="mb-3 text-lg font-semibold text-green-700">
                Import terminé
            </h2>

            <p className="text-green-700">
                {result.message ??
                    `${result.imported_rows} ligne(s) importée(s) avec succès.`}
            </p>
        </div>
    );
}
