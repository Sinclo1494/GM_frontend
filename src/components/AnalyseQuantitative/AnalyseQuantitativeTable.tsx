import type { AnalyseQuantitativeType } from "../types/analyseQuantitative";

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
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th rowSpan={2} className="border px-3 py-2">
              Sous Famille
            </th>
            <th rowSpan={2} className="border px-3 py-2">
              Libellé
            </th>
            <th rowSpan={2} className="border px-3 py-2">
              Nb
            </th>
            <th rowSpan={2} className="border px-3 py-2">
              Âge Moyen
            </th>

            <th colSpan={3} className="border px-3 py-2 bg-green-700">
              Exploitation
            </th>

            <th colSpan={3} className="border px-3 py-2 bg-yellow-700">
              Immobilisé
            </th>

            <th colSpan={2} className="border px-3 py-2 bg-blue-700">
              Réparation Externe
            </th>
          </tr>

          <tr className="bg-gray-200">
            <th className="border px-2 py-2">En service</th>
            <th className="border px-2 py-2">En chômage</th>
            <th className="border px-2 py-2">En panne</th>

            <th className="border px-2 py-2">En chômage</th>
            <th className="border px-2 py-2">En réparation</th>
            <th className="border px-2 py-2">Autre</th>

            <th className="border px-2 py-2">ALREM</th>
            <th className="border px-2 py-2">Autre</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={12}
                className="border py-6 text-center text-gray-500"
              >
                Aucun résultat
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.code_sous_famille}
                className="bg-white hover:bg-gray-200 transition-colors"
              >
                <td className="border px-3 py-2 font-medium">
                  {row.code_sous_famille}
                </td>

                <td className="border px-3 py-2">
                  {row.libelle_sous_famille.trim()}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.nbr}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.age_moyen.toFixed(1)}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.exploitation.en_service}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.exploitation.en_chomage}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.exploitation.en_panne}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.immobilise.en_chomage}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.immobilise.en_reparation}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.immobilise.autre}
                </td>

                <td className="border px-3 py-2 text-center">
                  {row.reparation.ALREM}
                </td>

                <td className="border px-3 py-2 text-center">
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