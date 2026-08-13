import type { FilialeOption } from "../../api/dataServices";
import { components } from "../../theme/components";

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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-semibold text-slate-800">
                Paramètres d'import
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Sélectionnez la filiale correspondant au fichier à importer.
            </p>

            <div className="mt-6">
                <label
                    htmlFor="filiale"
                    className={components.label}
                >
                    Filiale
                </label>

                <select
                    id="filiale"
                    value={selectedFiliale}
                    onChange={(event) =>
                        onFilialeChange(event.target.value)
                    }
                    className={components.select}
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
