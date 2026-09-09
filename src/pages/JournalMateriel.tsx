import React from 'react'
import { components } from "../theme/components";
import JournalMaterielTable from '../components/JournalMateriel/JournalMaterielTable'

const JournalMateriel: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className={components.pageTitle}>Journal Matériel</h1>
          <p className={components.pageDescription}>
            Consultation des équipements enregistrés.
          </p>
        </header>

        <main>
          <JournalMaterielTable />
        </main>
      </div>
    </div>
  )
}

export default JournalMateriel
