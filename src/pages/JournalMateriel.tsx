import React from 'react'
import JournalMaterielTable from '../components/JournalMateriel/JournalMaterielTable'

const JournalMateriel: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Journal Matériel</h1>
          <p className="text-sm text-gray-500 mt-1">
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
