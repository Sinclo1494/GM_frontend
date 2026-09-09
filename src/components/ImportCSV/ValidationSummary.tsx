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
                className="dark:border-green-800 bg-green-50 text-green-700 dark:text-green-400"
            />

            <SummaryCard
                label="Erreurs"
                value={summary.errors}
                className="dark:border-red-800 bg-red-50 text-red-700"
            />

            <SummaryCard
                label="Avertissements"
                value={summary.warnings}
                className="dark:border-yellow-800 bg-yellow-50 text-yellow-700 dark:text-yellow-400"
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
            className={`rounded-xl border dark:bg-dark-card p-5 shadow-sm ${className}`}
        >
            <p className="text-sm dark:text-dark-text-secondary">{label}</p>

            <p className="mt-2 text-3xl font-bold dark:text-dark-text-primary">
                {value}
            </p>
        </div>
    );
}
