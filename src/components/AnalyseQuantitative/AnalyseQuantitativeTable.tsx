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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className={components.table.wrapper}>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-slate-200 px-3 py-2 text-left">
              Sous Famille
            </th>
            <th rowSpan={2} className="border border-slate-200 px-3 py-2 text-left">
              Libellé
            </th>
            <th rowSpan={2} className="border border-slate-200 px-3 py-2 text-left">
              Nb
            </th>
            <th rowSpan={2} className="border border-slate-200 px-3 py-2 text-left">
              Âge Moyen
            </th>

            <th colSpan={3} className="border border-slate-200 px-3 py-2 bg-green-700 text-white text-center">
              Exploitation
            </th>

            <th colSpan={3} className="border border-slate-200 px-3 py-2 bg-yellow-700 text-white text-center">
              Immobilisé
            </th>

            <th colSpan={2} className="border border-slate-200 px-3 py-2 bg-blue-700 text-white text-center">
              Réparation Externe
            </th>
          </tr>

          <tr className="bg-slate-100">
            <th className="border border-slate-200 px-2 py-2 text-center">En service</th>
            <th className="border border-slate-200 px-2 py-2 text-center">En chômage</th>
            <th className="border border-slate-200 px-2 py-2 text-center">En panne</th>

            <th className="border border-slate-200 px-2 py-2 text-center">En chômage</th>
            <th className="border border-slate-200 px-2 py-2 text-center">En réparation</th>
            <th className="border border-slate-200 px-2 py-2 text-center">Autre</th>

            <th className="border border-slate-200 px-2 py-2 text-center">ALREM</th>
            <th className="border border-slate-200 px-2 py-2 text-center">Autre</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={12}
                className="border border-slate-200 py-6 text-center text-gray-500"
              >
                Aucun résultat
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.code_sous_famille}
                className="bg-white hover:bg-slate-50 transition-colors"
              >
                <td className="border border-slate-200 px-3 py-2 font-medium">
                  {row.code_sous_famille}
                </td>

                <td className="border border-slate-200 px-3 py-2">
                  {row.libelle_sous_famille.trim()}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.nbr}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.age_moyen.toFixed(1)}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.exploitation.en_service}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.exploitation.en_chomage}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.exploitation.en_panne}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.immobilise.en_chomage}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.immobilise.en_reparation}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.immobilise.autre}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.reparation.ALREM}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-center">
                  {row.reparation.autre}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
