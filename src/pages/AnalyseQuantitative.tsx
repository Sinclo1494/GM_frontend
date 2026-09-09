import { useEffect, useState } from "react";
import { getAQTP, getAQTPR, getFiliales } from "../api/dataServices";
import AnalyseQuantitativeResume from "../components/AnalyseQuantitative/AnalyseQuantitativeResume";
import AnalyseQuantitativeTable from "../components/AnalyseQuantitative/AnalyseQuantitativeTable";
import type {
  AnalyseQuantitativeResumeType,
  AnalyseQuantitativeType,
} from "../types/analyseQuantitative";
import { exportAnalyseQuantitative } from "../utils/exportPDF";
import { components } from "../theme/components";


export default function AnalyseQuantitative() {
  const [filiales, setFiliales] = useState<{ value: string; label: string }[]>([]);

  const handleExport = () => {
    if (!resume || rowsTable.length === 0) return;

    exportAnalyseQuantitative(resume, categories, {
      filiale: codeFiliale,
      dateDebut,
      dateFin
    });
  };

  const [resume, setResume] =
    useState<AnalyseQuantitativeResumeType>();
  const [rowsTable, setRowsTable] = useState<
    AnalyseQuantitativeType[]
  >([]);

  const [loadingResume, setLoadingResume] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  const [codeFiliale, setCodeFiliale] = useState("P");
  const [dateDebut, setDateDebut] = useState("2025-09-01");
  const [dateFin, setDateFin] = useState("2025-09-30");

  const handleCalculate = async () => {
    try {
      setLoadingResume(true);
      setLoadingTable(true);

      const params = {
        code_filiale: codeFiliale,
        date_debut: dateDebut,
        date_fin: dateFin,
      };

      const [resumeData, tableData] = await Promise.all([
        getAQTPR(params),
        getAQTP(params),
      ]);

      setResume(resumeData);
      setRowsTable(tableData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResume(false);
      setLoadingTable(false);
    }
  };

  const groupedByCategory = rowsTable.reduce((acc, row) => {
    if (!acc[row.code_categorie]) {
      acc[row.code_categorie] = {
        code_categorie: row.code_categorie,
        title: row.libelle_categorie,
        rows: [],
      };
    }

    acc[row.code_categorie].rows.push(row);

    return acc;
  }, {} as Record<
    string,
    {
      code_categorie: string;
      title: string;
      rows: AnalyseQuantitativeType[];
    }
  >);

  const categories = Object.values(groupedByCategory);
  useEffect(() => {
    getFiliales().then(setFiliales).catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className={components.pageTitle}>Analyse Quantitative</h1>
          <p className={components.pageDescription}>
            Analyse quantitative du parc matériel par catégorie.
          </p>
        </header>

        {/* Filters */}
        <div className={components.card + " mb-6"}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className={components.label}>Filiale</label>
              <select
                value={codeFiliale}
                onChange={(e) => setCodeFiliale(e.target.value)}
                className={components.select}
              >
                {filiales.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.value} - {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={components.label}>Date début</label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className={components.input}
              />
            </div>

            <div>
              <label className={components.label}>Date fin</label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className={components.input}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCalculate}
                disabled={loadingResume || loadingTable}
                className={components.button.primary}
              >
                {loadingResume || loadingTable
                  ? "Calculating..."
                  : "Calculate"}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={
                  !resume ||
                  rowsTable.length === 0 ||
                  loadingResume ||
                  loadingTable
                }
                className={components.button.success}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {resume && <AnalyseQuantitativeResume data={resume} />}

        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([codeCategorie, category]) => (
            <div key={codeCategorie}>
              <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-dark-text-primary">
                {codeCategorie}: {category.title}
              </h2>

              <AnalyseQuantitativeTable
                rows={category.rows}
                loading={loadingTable}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
