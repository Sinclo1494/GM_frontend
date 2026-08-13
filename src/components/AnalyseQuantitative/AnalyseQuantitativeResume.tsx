import type { AnalyseQuantitativeResumeType } from "../../types/analyseQuantitative";
import { components } from "../../theme/components";

interface Props {
  data: AnalyseQuantitativeResumeType;
}

const StatCard = ({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) => (
  <div className={components.card}>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="mt-2 text-3xl font-bold text-blue-600">{value}</p>
  </div>
);

const Section = ({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number }[];
}) => (
  <div className={components.card}>
    <h2 className="text-lg font-semibold mb-4 text-gray-800">{title}</h2>

    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between border-b border-slate-100 pb-2 last:border-none"
        >
          <span className="text-gray-600">{item.label}</span>

          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyseQuantitativeResume({
  data,
}: Props) {
  return (
    <div className="space-y-8 mb-8">

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Nombre total"
          value={data.nombre_totale}
        />

        <StatCard
          title="Âge moyen"
          value={`${data.age_moyen} ans`}
        />
      </div>

      {/* Categories */}
      <div className="grid gap-6 lg:grid-cols-3">

        <Section
          title="Exploitation"
          items={[
            {
              label: "En service",
              value: data.exploitation.en_service,
            },
            {
              label: "En chômage",
              value: data.exploitation.en_chomage,
            },
            {
              label: "En panne",
              value: data.exploitation.en_panne,
            },
          ]}
        />

        <Section
          title="Immobilisés"
          items={[
            {
              label: "En chômage",
              value: data.immobilises.en_chomage,
            },
            {
              label: "En réparation",
              value: data.immobilises.en_reparation,
            },
            {
              label: "Autre",
              value: data.immobilises.autre,
            },
          ]}
        />

        <Section
          title="Réparation externe"
          items={[
            {
              label: "ALREM",
              value: data.reparation_externe.ALREM,
            },
            {
              label: "Autre",
              value: data.reparation_externe.autre,
            },
          ]}
        />
      </div>
    </div>
  );
}
