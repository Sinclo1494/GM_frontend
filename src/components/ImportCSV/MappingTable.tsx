import MappingRow from "./MappingRow";
import type { PreviewColumn } from "../../types/importCsv";

interface Props {
    preview: PreviewColumn[];
    mapping: Record<number, string>;
    onMappingChange: (
        columnIndex: number,
        fieldName: string
    ) => void;
}

export default function MappingTable({
    preview,
    mapping,
    onMappingChange,
}: Props) {
    const usedFields = Object.values(mapping);

    return (
        <div className="overflow-hidden rounded-xl border">
            <table className="w-full">
                <thead className="sticky top-0 bg-slate-100">
                    <tr>
                        <th className="w-28 px-4 py-3 text-left">
                            Colonne
                        </th>
                        <th className="px-4 py-3 text-left">
                            Aperçu
                        </th>
                        <th className="w-80 px-4 py-3 text-left">
                            Champ attendu
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {preview.map((column) => (
                        <MappingRow
                            key={column.index}
                            column={column}
                            selectedField={
                                mapping[column.index] || ""
                            }
                            usedFields={usedFields}
                            onChange={onMappingChange}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}