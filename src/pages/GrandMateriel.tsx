import React from 'react'
import TabGrandMateriel from '../components/TabGrandMateriel'

const GrandMateriel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Grand Matériel</h1>
          <p className="text-sm text-gray-500">Liste et gestion des grands matériels</p>
        </header>

        <main className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="search"
                placeholder="Rechercher..."
                className="px-3 py-2 border rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Rechercher</button>
            </div>
            <div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Ajouter</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {/* TabGrandMateriel component should render the table/list */}
            <TabGrandMateriel />
          </div>
        </main>
      </div>
    </div>
  )
}

export default GrandMateriel
