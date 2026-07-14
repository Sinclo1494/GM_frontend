import type { FilialeOption } from "../../api/dataServices";

interface Props {
    filiales: FilialeOption[];
    selectedFiliale: string;
    onFilialeChange: (value: string) => void;
}

export default function ImportSettings({
    filiales,
    selectedFiliale,
    onFilialeChange,
}: Props) {
    return (
        <div className="rounded-xl border bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-800">
                Paramètres d'import
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Sélectionnez la filiale correspondant au fichier à importer.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="filiale"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Filiale
                </label>

                <select
                    id="filiale"
                    value={selectedFiliale}
                    onChange={(event) =>
                        onFilialeChange(event.target.value)
                    }
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                >
                    <option value="">
                        Sélectionnez une filiale...
                    </option>

                    {filiales.map((filiale) => (
                        <option
                            key={filiale.value}
                            value={filiale.value}
                        >
                            {filiale.value} - {filiale.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}