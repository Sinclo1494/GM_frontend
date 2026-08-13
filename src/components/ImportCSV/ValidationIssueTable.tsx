import { useMemo, useState } from "react";
import type { ValidationIssue } from "../../types/importCsv";
import { components } from "../../theme/components";

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
        <div className={components.table.wrapper}>
            <div
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b px-5 py-4 ${
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
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
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
                        className={components.select}
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
                        <thead className={components.table.header + " border-b-2 border-slate-300"}>
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
                                <th className="px-4 py-3 text-left">
                                    Message
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredIssues.map((issue, index) => (
                                <tr
                                    key={index}
                                    className={`border-b even:bg-slate-50 ${
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
