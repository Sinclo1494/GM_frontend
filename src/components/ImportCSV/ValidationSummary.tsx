import type { ValidationSummaryData } from "../../types/importCsv";

interface Props {
    summary: ValidationSummaryData;
}

export default function ValidationSummary({ summary }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
                label="Total"
                value={summary.total_rows}
            />

            <SummaryCard
                label="Lignes valides"
                value={summary.valid_rows}
                className="border-green-200 bg-green-50 text-green-700"
            />

            <SummaryCard
                label="Erreurs"
                value={summary.errors}
                className="border-red-200 bg-red-50 text-red-700"
            />

            <SummaryCard
                label="Avertissements"
                value={summary.warnings}
                className="border-yellow-200 bg-yellow-50 text-yellow-700"
            />
        </div>
    );
}

interface SummaryCardProps {
    label: string;
    value: number;
    className?: string;
}

function SummaryCard({
    label,
    value,
    className = "",
}: SummaryCardProps) {
    return (
        <div
            className={`rounded-xl border bg-white p-5 shadow-sm ${className}`}
        >
            <p className="text-sm">{label}</p>

            <p className="mt-2 text-3xl font-bold">
                {value}
            </p>
        </div>
    );
}