interface ErrorItem {
  line: number;
  field: string;
  value: string;
  message: string;
}

interface Props {
  errors: ErrorItem[];
}

export default function ErrorTable({
  errors,
}: Props) {
  if (!errors.length) return null;

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Ligne</th>
            <th className="px-4 py-3 text-left">Champ</th>
            <th className="px-4 py-3 text-left">Valeur</th>
            <th className="px-4 py-3 text-left">Erreur</th>
          </tr>
        </thead>

        <tbody>
          {errors.map((error, index) => (
            <tr
              key={index}
              className="border-t"
            >
              <td className="px-4 py-3">
                {error.line}
              </td>

              <td className="px-4 py-3">
                {error.field}
              </td>

              <td className="px-4 py-3 font-mono">
                {error.value}
              </td>

              <td className="px-4 py-3 text-red-600">
                {error.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}