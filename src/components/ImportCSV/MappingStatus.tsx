import { AlertTriangle } from "lucide-react";

type ExpectedField = {
    value: string;
    label: string;
    required: boolean;
}

interface Props {
    missingRequired: ExpectedField[];
    ignoredColumns: number;
}

export default function MappingStatus({
    missingRequired,
    ignoredColumns,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-amber-50 px-4 py-3 text-sm">
                Colonnes ignorées :
                <span className="ml-2 font-bold">
                    {ignoredColumns}
                </span>
            </div>

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
                            .map((field) => field.label)
                            .join(", ")}
                    </div>
                </div>
            )}
        </div>
    );
}