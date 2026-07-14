import { FileSpreadsheet } from "lucide-react";
import { EXPECTED_FIELDS } from "../../constants/expectedFields";
import type { PreviewColumn } from "../../types/importCsv";

interface Props {
    column: PreviewColumn;
    selectedField: string;
    usedFields: string[];
    onChange: (
        columnIndex: number,
        fieldName: string
    ) => void;
}

export default function MappingRow({
    column,
    selectedField,
    usedFields,
    onChange,
}: Props) {
    return (
        <tr className="border-t hover:bg-slate-50">
            <td className="px-4 py-4 font-medium">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet size={18} />
                    Col. {column.index + 1}
                </div>
            </td>

            <td className="px-4 py-4">
                <div className="space-y-1 text-sm">
                    {column.samples.map((sample, index) => (
                        <div key={index}>
                            {sample || "-"}
                        </div>
                    ))}
                </div>
            </td>

            <td className="px-4 py-4">
                <select
                    value={selectedField}
                    onChange={(event) =>
                        onChange(
                            column.index,
                            event.target.value
                        )
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
                                selectedField !== field.value
                            }
                        >
                            {field.label}
                            {field.required && " *"}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    );
}