// components/MappingRow.tsx

interface Props {
    columnIndex: number;
    samples: string[];
    value?: string;
    usedFields: string[];
    expectedFields: string[];
    onChange(field: string): void;
}

export default function MappingRow({
    columnIndex,
    samples,
    value,
    usedFields,
    expectedFields,
    onChange,
}: Props) {
    return (
        <tr className="border-b hover:bg-slate-50">
            <td className="px-4 py-4 font-medium">
                Column {columnIndex + 1}
            </td>

            <td className="px-4 py-4">
                <div className="space-y-1 text-sm text-gray-600">
                    {samples.map((s, i) => (
                        <div key={i}>{s || "-"}</div>
                    ))}
                </div>
            </td>

            <td className="px-4 py-4">
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring"
                >
                    <option value="">Ignore</option>

                    {expectedFields.map((field) => (
                        <option
                            key={field}
                            value={field}
                            disabled={
                                usedFields.includes(field) &&
                                value !== field
                            }
                        >
                            {field}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    );
}