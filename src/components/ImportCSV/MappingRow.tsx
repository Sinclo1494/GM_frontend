import { FileSpreadsheet } from "lucide-react";
import type { PreviewColumn } from "../../types/importCsv";
import { components } from "../../theme/components";

type ExpectedField = {
    value: string;
    label: string;
    required: boolean;
}
interface Props {
    column: PreviewColumn;
    selectedField: string;
    usedFields: string[];
    expectedFields : ExpectedField[]
    onChange: (
        columnIndex: number,
        fieldName: string
    ) => void;
}

export default function MappingRow({
    column,
    selectedField,
    usedFields,
    expectedFields,
    onChange,
}: Props) {
    return (
        <tr className={components.table.row}>
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
                    className={components.select}
                >
                    <option value="">
                        Ignorer
                    </option>

                    {expectedFields.map((field:ExpectedField) => (
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
