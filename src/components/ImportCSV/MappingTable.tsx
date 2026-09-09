import React, { useState, useMemo } from "react";
import PaginationControls from "../../components/common/PaginationControls";
import MappingRow from "./MappingRow";
import type { PreviewColumn } from "../../types/importCsv";

type ExpectedField = {
    value: string;
    label: string;
    required: boolean;
}

interface Props {
    preview: PreviewColumn[];
    mapping: Record<number, string>;
    expectedFields: ExpectedField[];
    onMappingChange: (
        columnIndex: number,
        fieldName: string
    ) => void;
}

export default function MappingTable({
    preview,
    mapping,
    expectedFields,
    onMappingChange,
}: Props) {
    const usedFields = Object.values(mapping);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const paginatedPreview = useMemo(() => {
        const start = (page - 1) * pageSize;
        return preview.slice(start, start + pageSize);
    }, [preview, page, pageSize]);

    const prevPreviewLengthRef = React.useRef(preview.length);
    React.useEffect(() => {
        if (prevPreviewLengthRef.current !== preview.length) {
            prevPreviewLengthRef.current = preview.length;
            setPage(1);
        }
    }, [preview.length]);

    return (
        <>
            <div className="overflow-hidden rounded-xl border dark:border-dark-border">
                <table className="w-full">
                    <thead className="sticky top-0 dark:bg-dark-bg-tertiary border-b-2 dark:border-dark-border">
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
                        {paginatedPreview.map((column) => (
                            <MappingRow
                                key={column.index}
                                column={column}
                                selectedField={mapping[column.index] || ""}
                                usedFields={usedFields}
                                expectedFields={expectedFields}
                                onChange={onMappingChange}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {preview.length > 0 && (
                <PaginationControls
                    currentPage={page}
                    totalPages={Math.max(1, Math.ceil(preview.length / pageSize))}
                    totalItems={preview.length}
                    itemsPerPage={pageSize}
                    onPageChange={setPage}
                    onItemsPerPageChange={setPageSize}
                    showItemCount={true}
                />
            )}
        </>
    );
}
