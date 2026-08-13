import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { JournalEntry } from "../../types/journal";
import {
  formatActionLabel,
  formatModuleLabel,
} from "../../types/journal";
import { components } from "../../theme/components";

interface Props {
  open: boolean;
  onClose: () => void;
  journal: JournalEntry | null;
}

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

type Dict = Record<string, unknown>;

const toDict = (value: unknown): Dict | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Dict;
  }
  return null;
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="grid grid-cols-2 gap-2 py-1.5">
    <dt className="text-xs font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-800 wrap-break-word">{value || "—"}</dd>
  </div>
);

const ValueDiffTable: React.FC<{
  oldValue: unknown;
  newValue: unknown;
}> = ({ oldValue, newValue }) => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const oldDict = toDict(oldValue);
  const newDict = toDict(newValue);

  if (!oldDict && !newDict) {
    return (
      <p className="text-sm text-gray-500">
        Aucune valeur d&eacute;tect&eacute;e.
      </p>
    );
  }

  const keys = Array.from(
    new Set([...(oldDict ? Object.keys(oldDict) : []), ...(newDict ? Object.keys(newDict) : [])]),
  ).sort();

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className={components.table.header}>
            <tr>
              <th className="border border-slate-200 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Champ
              </th>
              <th className="border border-slate-200 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Ancienne valeur
              </th>
              <th className="border border-slate-200 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Nouvelle valeur
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => {
              const had = oldDict ? key in oldDict : false;
              const hnew = newDict ? key in newDict : false;
              const oldV = had ? oldDict![key] : undefined;
              const newV = hnew ? newDict![key] : undefined;
              const changed = renderValue(oldV) !== renderValue(newV);

              let rowClass = "bg-white";
              if (!had && hnew) {
                rowClass = "bg-green-50";
              } else if (had && !hnew) {
                rowClass = "bg-red-50";
              } else if (changed) {
                rowClass = "bg-amber-50";
              }

              return (
                <tr key={key} className={rowClass}>
                  <td className="border border-slate-200 px-3 py-1.5 font-medium text-gray-800">
                    {key}
                  </td>
                  <td
                    className="border border-slate-200 px-3 py-1.5 text-gray-600"
                    title={had ? renderValue(oldV) : undefined}
                  >
                    <span className="block max-w-55 truncate">
                      {had ? renderValue(oldV) : "—"}
                    </span>
                  </td>
                  <td
                    className="border border-slate-200 px-3 py-1.5 text-gray-600"
                    title={hnew ? renderValue(newV) : undefined}
                  >
                    <span className="block max-w-55 truncate">
                      {hnew ? renderValue(newV) : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showOld}
            onChange={(e) => setShowOld(e.target.checked)}
          />
          Ancien JSON
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showNew}
            onChange={(e) => setShowNew(e.target.checked)}
          />
          Nouveau JSON
        </label>
      </div>

      {showOld && (
        <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-green-300">
          {JSON.stringify(oldValue, null, 2)}
        </pre>
      )}
      {showNew && (
        <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-green-300">
          {JSON.stringify(newValue, null, 2)}
        </pre>
      )}
    </div>
  );
};

const JournalDetailDialog: React.FC<Props> = ({ open, onClose, journal }) => {
  useEffect(() => {
    if (!open) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [open, onClose]);

  if (!open || !journal) return null;

  const hasChanges =
    journal.ancienne_valeur !== null || journal.nouvelle_valeur !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className={components.modal }>
        <div
          className=" max-h-[90vh] w-full overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Détails de l'entrée de journal
              </h2>
              <p className="text-xs text-gray-500">ID #{journal.id}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-1 divide-y divide-gray-200">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700">
                Informations générales
              </h3>
              <dl>
                <InfoRow
                  label="Date / Heure"
                  value={formatDateTime(journal.date_action)}
                />
                <InfoRow
                  label="Utilisateur"
                  value={
                    journal.user?.username ? (
                      <span>
                        {journal.user.username} (ID #{journal.user.id})
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <InfoRow label="Module" value={formatModuleLabel(journal.module)} />
                <InfoRow label="Action" value={formatActionLabel(journal.action)} />
                <InfoRow label="Type d'objet" value={journal.objet_type} />
                <InfoRow label="ID Objet" value={journal.objet_id} />
                <InfoRow label="Filiale" value={journal.code_filiale} />
                <InfoRow label="Site" value={journal.code_site} />
                <InfoRow label="Description" value={journal.description} />
                <InfoRow label="Adresse IP" value={journal.ip_address} />
                <InfoRow label="Créé le" value={formatDateTime(journal.created_at)} />
              </dl>
            </div>

            {hasChanges && (
              <div className="pt-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Modifications
                </h3>
                <ValueDiffTable
                  oldValue={journal.ancienne_valeur}
                  newValue={journal.nouvelle_valeur}
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className={components.button.secondary}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetailDialog;
