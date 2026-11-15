import React from 'react'
import { components } from "../theme/components";
import TempJournalMaterielTable from '../components/TempJournalMateriel/TempJournalMaterielTable'

const TempJournalMateriel: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mx-auto w-full">
        <header className="mb-6">
          <h1 className={components.pageTitle}>Temp Journal Matériel</h1>
          <p className={components.pageDescription}>
            Consultation des équipements enregistrés.
          </p>
        </header>

        <main>
          <TempJournalMaterielTable />
        </main>
      </div>
    </div>
  )
}

export default TempJournalMateriel
