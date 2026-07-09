interface Props {
  totalRows: number;
  validRows: number;
  errors: number;
}

export default function ValidationSummary({
  totalRows,
  validRows,
  errors,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">
        Résultat de la vérification
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-gray-500 text-sm">
            Lignes analysées
          </p>

          <p className="text-2xl font-bold">
            {totalRows}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-gray-500 text-sm">
            Lignes valides
          </p>

          <p className="text-2xl font-bold text-green-600">
            {validRows}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-gray-500 text-sm">
            Erreurs
          </p>

          <p className="text-2xl font-bold text-red-600">
            {errors}
          </p>
        </div>
      </div>
    </div>
  );
}