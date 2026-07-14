import { useMemo, useState } from "react";
import type { ValidationIssue } from "../../types/importCsv";

interface Props {
    issues: ValidationIssue[];
    severity: "error" | "warning";
}

export default function ValidationIssueTable({
    issues,
    severity,
}: Props) {
    const [messageFilter, setMessageFilter] = useState("");

    const isError = severity === "error";

    const filteredIssues = useMemo(() => {
        const filter = messageFilter.trim().toLowerCase();

        if (!filter) {
            return issues;
        }

        return issues.filter((issue) =>
            issue.message.toLowerCase().includes(filter)
        );
    }, [issues, messageFilter]);

    const uniqueMessages = useMemo(
        () => [...new Set(issues.map((issue) => issue.message))],
        [issues]
    );

    return (
        <div className="overflow-hidden rounded-xl border">
            <div
                className={`flex items-center justify-between border-b px-5 py-4 ${
                    isError ? "bg-red-50" : "bg-yellow-50"
                }`}
            >
                <div>
                    <h3
                        className={`text-lg font-semibold ${
                            isError
                                ? "text-red-700"
                                : "text-yellow-700"
                        }`}
                    >
                        {isError ? "Erreurs" : "Avertissements"} (
                        {filteredIssues.length}/{issues.length})
                    </h3>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                        isError
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                    {isError ? "Bloquantes" : "Non bloquants"}
                </span>
            </div>

            {issues.length > 0 && (
                <div className="border-b bg-white p-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Filtrer par message
                    </label>

                    <select
                        value={messageFilter}
                        onChange={(event) =>
                            setMessageFilter(event.target.value)
                        }
                        className="w-full max-w-xl rounded-lg border px-3 py-2 text-sm"
                    >
                        <option value="">
                            Tous les messages
                        </option>

                        {uniqueMessages.map((message) => (
                            <option key={message} value={message}>
                                {message}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {issues.length === 0 ? (
                <div className="p-10 text-center text-green-600">
                    ✓ Aucun problème.
                </div>
            ) : filteredIssues.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                    Aucun résultat pour ce filtre.
                </div>
            ) : (
                <div className="max-h-125 overflow-auto">
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
                                <th className="w-105 px-4 py-3 text-left">
                                    Message
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredIssues.map((issue, index) => (
                                <tr
                                    key={index}
                                    className={`border-t even:bg-slate-50 ${
                                        isError
                                            ? "hover:bg-red-50"
                                            : "hover:bg-yellow-50"
                                    }`}
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {issue.line ?? "-"}
                                    </td>

                                    <td className="px-4 py-3">
                                        {issue.field ?? "-"}
                                    </td>

                                    <td className="px-4 py-3 font-mono text-sm">
                                        {String(issue.value ?? "-")}
                                    </td>

                                    <td
                                        className={`px-4 py-3 ${
                                            isError
                                                ? "text-red-700"
                                                : "text-yellow-700"
                                        }`}
                                    >
                                        {issue.message}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}