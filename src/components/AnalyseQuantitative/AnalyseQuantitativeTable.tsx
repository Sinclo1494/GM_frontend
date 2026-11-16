import { useMemo } from "react";
import type { AnalyseQuantitativeType } from "../../types/analyseQuantitative";
import { components } from "../../theme/components";

interface Props {
  rows: AnalyseQuantitativeType[];
  loading: boolean;
}

type Tone =
  | "neutral"
  | "emerald"
  | "teal"
  | "green"
  | "amber"
  | "orange"
  | "yellow"
  | "violet"
  | "fuchsia";

const toneStyles: Record<Tone, { base: string; subHead: string; hover: string }> = {
  neutral: {
    base: "bg-slate-500/[0.05] dark:bg-slate-400/[0.07]",
    subHead:
      "bg-slate-100/80 dark:bg-slate-700/30 text-slate-700 dark:text-dark-text-primary",
    hover: "hover:bg-slate-500/[0.12] dark:hover:bg-slate-400/[0.14]",
  },
  emerald: {
    base: "bg-emerald-500/[0.10] dark:bg-emerald-400/[0.12]",
    subHead:
      "bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100",
    hover: "hover:bg-emerald-500/[0.17] dark:hover:bg-emerald-400/[0.19]",
  },
  teal: {
    base: "bg-teal-500/[0.10] dark:bg-teal-400/[0.12]",
    subHead:
      "bg-teal-100/80 dark:bg-teal-900/40 text-teal-900 dark:text-teal-100",
    hover: "hover:bg-teal-500/[0.17] dark:hover:bg-teal-400/[0.19]",
  },
  green: {
    base: "bg-green-500/[0.10] dark:bg-green-400/[0.12]",
    subHead:
      "bg-green-100/80 dark:bg-green-900/40 text-green-900 dark:text-green-100",
    hover: "hover:bg-green-500/[0.17] dark:hover:bg-green-400/[0.19]",
  },
  amber: {
    base: "bg-amber-500/[0.10] dark:bg-amber-400/[0.12]",
    subHead:
      "bg-amber-100/80 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100",
    hover: "hover:bg-amber-500/[0.17] dark:hover:bg-amber-400/[0.19]",
  },
  orange: {
    base: "bg-orange-500/[0.10] dark:bg-orange-400/[0.12]",
    subHead:
      "bg-orange-100/80 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100",
    hover: "hover:bg-orange-500/[0.17] dark:hover:bg-orange-400/[0.19]",
  },
  yellow: {
    base: "bg-yellow-500/[0.10] dark:bg-yellow-400/[0.12]",
    subHead:
      "bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100",
    hover: "hover:bg-yellow-500/[0.17] dark:hover:bg-yellow-400/[0.19]",
  },
  violet: {
    base: "bg-violet-500/[0.10] dark:bg-violet-400/[0.12]",
    subHead:
      "bg-violet-100/80 dark:bg-violet-900/40 text-violet-900 dark:text-violet-100",
    hover: "hover:bg-violet-500/[0.17] dark:hover:bg-violet-400/[0.19]",
  },
  fuchsia: {
    base: "bg-fuchsia-500/[0.10] dark:bg-fuchsia-400/[0.12]",
    subHead:
      "bg-fuchsia-100/80 dark:bg-fuchsia-900/40 text-fuchsia-900 dark:text-fuchsia-100",
    hover: "hover:bg-fuchsia-500/[0.17] dark:hover:bg-fuchsia-400/[0.19]",
  },
};

const columnTones: Tone[] = [
  "neutral", // Sous Famille
  "neutral", // Libellé
  "neutral", // Nb
  "neutral", // Âge Moyen
  "emerald", // Exploitation - En service
  "teal", // Exploitation - En chômage
  "green", // Exploitation - En panne
  "amber", // Immobilisé - En chômage
  "orange", // Immobilisé - En réparation
  "yellow", // Immobilisé - Autre
  "violet", // Réparation - ALREM
  "fuchsia", // Réparation - Autre
];

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

  const subHeaders = [
    "En service",
    "En chômage",
    "En panne",
    "En chômage",
    "En réparation",
    "Autre",
    "ALREM",
    "Autre",
  ];

  const cell = (tone: Tone, extra = "") =>
    `border dark:border-dark-border px-3 py-2 text-gray-800 dark:text-dark-text-primary transition-colors duration-150 ${toneStyles[tone].base} ${toneStyles[tone].hover} ${extra}`;

  const head2 = (tone: Tone) =>
    `border dark:border-dark-border px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide transition-colors ${toneStyles[tone].subHead}`;

  return (
    <>
      <div className={components.table.wrapper}>
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary bg-slate-50/80 dark:bg-slate-800/40"
              >
                Sous Famille
              </th>
              <th
                rowSpan={2}
                className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary bg-slate-50/80 dark:bg-slate-800/40"
              >
                Libellé
              </th>
              <th
                rowSpan={2}
                className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary bg-slate-50/80 dark:bg-slate-800/40"
              >
                Nb
              </th>
              <th
                rowSpan={2}
                className="border dark:border-dark-border px-3 py-2 text-left text-slate-700 dark:text-dark-text-primary bg-slate-50/80 dark:bg-slate-800/40"
              >
                Âge Moyen
              </th>

              <th
                colSpan={3}
                className="border dark:border-dark-border px-3 py-2 bg-emerald-700 dark:bg-emerald-800 text-white text-center"
              >
                Exploitation
              </th>

              <th
                colSpan={3}
                className="border dark:border-dark-border px-3 py-2 bg-amber-600 dark:bg-amber-800 text-white text-center"
              >
                Immobilisé
              </th>

              <th
                colSpan={2}
                className="border dark:border-dark-border px-3 py-2 bg-violet-700 dark:bg-violet-900 text-white text-center"
              >
                Réparation Externe
              </th>
            </tr>

            <tr className="dark:bg-dark-bg-tertiary">
              {subHeaders.map((label, idx) => (
                <th key={`${label}-${idx}`} className={head2(columnTones[idx + 4])}>
                  {label}
                </th>
              ))}
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
              rows.map((row) => {
                const values = [
                  row.nbr,
                  row.age_moyen.toFixed(1),
                  row.exploitation.en_service,
                  row.exploitation.en_chomage,
                  row.exploitation.en_panne,
                  row.immobilise.en_chomage,
                  row.immobilise.en_reparation,
                  row.immobilise.autre,
                  row.reparation.ALREM,
                  row.reparation.autre,
                ];
                return (
                  <tr
                    key={row.code_sous_famille}
                    className="group/row transition-colors"
                  >
                    <td className={cell("neutral", "font-medium")}>
                      {row.code_sous_famille}
                    </td>
                    <td className={cell("neutral")}>
                      {row.libelle_sous_famille.trim()}
                    </td>
                    {values.map((value, idx) => (
                      <td
                        key={idx}
                        className={cell(
                          columnTones[idx + 2],
                          "text-center tabular-nums"
                        )}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="font-semibold">
                <td
                  colSpan={2}
                  className="border dark:border-dark-border px-3 py-2 text-left text-slate-800 dark:text-dark-text-primary bg-slate-100/90 dark:bg-slate-800/60"
                >
                  Total
                </td>
                {[
                  totals.nbr,
                  totals.age_moyen.toFixed(1),
                  totals.exploitation.en_service,
                  totals.exploitation.en_chomage,
                  totals.exploitation.en_panne,
                  totals.immobilise.en_chomage,
                  totals.immobilise.en_reparation,
                  totals.immobilise.autre,
                  totals.reparation.ALREM,
                  totals.reparation.autre,
                ].map((value, idx) => (
                  <td
                    key={idx}
                    className={`${cell(columnTones[idx + 2], "text-center tabular-nums font-semibold text-slate-800 dark:text-dark-text-primary")} bg-opacity-80`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  );
}
