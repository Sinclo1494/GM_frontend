import { useMemo } from "react";
import type { AnalyseQuantitativeType } from "../../types/analyseQuantitative";
import { components } from "../../theme/components";

interface Props {
  rows: AnalyseQuantitativeType[];
  loading: boolean;
}

export default function AnalyseQuantitativeTable({
  rows,
  loading,
}: Props) {
  const totals = useMemo(() => {
    const sum = (pick: (row: AnalyseQuantitativeType) => number) =>
      rows.reduce((acc, row) => acc + (pick(row) || 0), 0);

    const nbr = sum((row) => row.nbr);
    const ageTotal = rows.reduce(
      (acc, row) => acc + (row.age_moyen || 0) * (row.nbr || 0),
      0
    );

    return {
      nbr,
      age_moyen: nbr > 0 ? ageTotal / nbr : 0,
      exploitation: {
        en_service: sum((row) => row.exploitation.en_service),
        en_chomage: sum((row) => row.exploitation.en_chomage),
        en_panne: sum((row) => row.exploitation.en_panne),
      },
      immobilise: {
        en_chomage: sum((row) => row.immobilise.en_chomage),
        en_reparation: sum((row) => row.immobilise.en_reparation),
        autre: sum((row) => row.immobilise.autre),
      },
      reparation: {
        ALREM: sum((row) => row.reparation.ALREM),
        autre: sum((row) => row.reparation.autre),
      },
    };
  }, [rows]);

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
            rows.map((row) => (
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

        {rows.length > 0 && (
          <tfoot>
            <tr className="bg-slate-100 dark:bg-dark-bg-tertiary font-semibold">
              <td
                colSpan={2}
                className="border dark:border-dark-border px-3 py-2 text-left text-slate-800 dark:text-dark-text-primary"
              >
                Total
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.nbr}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.age_moyen.toFixed(1)}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.exploitation.en_service}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.exploitation.en_chomage}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.exploitation.en_panne}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.immobilise.en_chomage}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.immobilise.en_reparation}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.immobilise.autre}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.reparation.ALREM}
              </td>

              <td className="border dark:border-dark-border px-3 py-2 text-center text-slate-800 dark:text-dark-text-primary">
                {totals.reparation.autre}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
    </>
  );
}
