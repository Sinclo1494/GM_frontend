import React, { useState, useMemo } from "react";
import type { AnalyseQuantitativeType } from "../../types/analyseQuantitative";
import { components } from "../../theme/components";
import PaginationControls from "../../components/common/PaginationControls";

interface Props {
  rows: AnalyseQuantitativeType[];
  loading: boolean;
}

export default function AnalyseQuantitativeTable({
  rows,
  loading,
}: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const prevRowsLengthRef = React.useRef(rows.length);
  React.useEffect(() => {
    if (prevRowsLengthRef.current !== rows.length) {
      prevRowsLengthRef.current = rows.length;
      setPage(1);
    }
  }, [rows.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="dark:text-dark-text-secondary">Loading...</p>
      </div>
    );
  }

  return (
    <>
    <div className={components.table.wrapper}>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th rowSpan={2} className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary">
              Sous Famille
            </th>
            <th rowSpan={2} className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary">
              Libellé
            </th>
            <th rowSpan={2} className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary">
              Nb
            </th>
            <th rowSpan={2} className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary">
              Âge Moyen
            </th>

            <th colSpan={3} className="border dark:border-dark-border px-3 py-2 bg-green-700 text-white dark:bg-green-800 text-center">
              Exploitation
            </th>

            <th colSpan={3} className="border dark:border-dark-border px-3 py-2 bg-yellow-700 text-white dark:bg-yellow-800 text-center">
              Immobilisé
            </th>

            <th colSpan={2} className="border dark:border-dark-border px-3 py-2 bg-gray-700 text-white dark:bg-gray-800 text-center">
              Réparation Externe
            </th>
          </tr>

          <tr className="dark:bg-dark-bg-tertiary">
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">En service</th>
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">En chômage</th>
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">En panne</th>

            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">En chômage</th>
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">En réparation</th>
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">Autre</th>

            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">ALREM</th>
            <th className="border dark:border-dark-border px-2 py-2 text-center text-slate-700 dark:text-dark-text-primary">Autre</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={12}
                className="border dark:border-dark-border py-6 text-center dark:text-dark-text-secondary"
              >
                Aucun résultat
              </td>
            </tr>
          ) : (
            paginatedRows.map((row) => (
              <tr
                key={row.code_sous_famille}
                className="dark:bg-dark-card dark:hover:bg-dark-bg-secondary transition-colors"
              >
                <td className="border dark:border-dark-border px-3 py-2 font-medium text-gray-800 dark:text-dark-text-primary">
                  {row.code_sous_famille}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-gray-800 dark:text-dark-text-primary">
                  {row.libelle_sous_famille.trim()}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.nbr}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.age_moyen.toFixed(1)}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.exploitation.en_service}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.exploitation.en_chomage}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.exploitation.en_panne}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.immobilise.en_chomage}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.immobilise.en_reparation}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.immobilise.autre}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.reparation.ALREM}
                </td>

                <td className="border dark:border-dark-border px-3 py-2 text-center text-gray-800 dark:text-dark-text-primary">
                  {row.reparation.autre}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <PaginationControls
      currentPage={page}
      totalPages={Math.max(1, Math.ceil(rows.length / pageSize))}
      totalItems={rows.length}
      itemsPerPage={pageSize}
      onPageChange={setPage}
      onItemsPerPageChange={setPageSize}
      loading={loading}
      showItemCount={true}
    />
    </>
  );
}
