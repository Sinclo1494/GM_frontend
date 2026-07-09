import React from 'react'
import JournalMaterielTable from '../components/JournalMateriel/JournalMaterielTable'

const JournalMateriel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className=" mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Journal Matériel Matériel</h1>
        </header>

        <main className="bg-white shadow rounded-lg p-4">
          <div className="overflow-x-auto">
            {/* JournalMaterielTable component should render the table/list */}
            <JournalMaterielTable />
          </div>
        </main>
      </div>
    </div>
  )
}

export default JournalMateriel
