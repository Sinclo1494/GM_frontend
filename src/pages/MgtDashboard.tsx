import React, { useState, useEffect } from 'react'
import { components } from "../theme/components";
import { getFiliales } from '../api/dataServices'
import MgtDashboardTable from '../components/MgtDashboard/MgtDashboardTable'
import MgtDashboardMonthlyTable from '../components/MgtDashboard/MgtDashboardMonthlyTable'
import MgtDashboardDecadaireRecap from '../components/MgtDashboard/MgtDashboardDecadaireRecap'
import MgtDashboardMensuelRecap from '../components/MgtDashboard/MgtDashboardMensuelRecap'
import { getDefaultTwoMonthsAgoRange, loadWithTimestamp, saveWithTimestamp } from '../utils/dateUtils'

const TABS = ['Suivi Décadaire Chantier', 'Suivi Mensuel Chantier', 'Récap Décadaire', 'Récap Mensuel']

const STORAGE_KEY = 'mgt_dashboard_filters'

const loadFilters = () => {
  return loadWithTimestamp<{
    filiale?: string;
    site?: string;
    famille?: string;
    decade?: string;
    month?: string;
    year?: string;
  }>(STORAGE_KEY);
}

/** Default month: the ending month of the 2-months-ago billing period (N-2). */
const getDefaultMgtMonth = (): string => {
  const range = getDefaultTwoMonthsAgoRange();
  // range.dateFin is the end date (20th of N-2 month)
  return String(new Date(range.dateFin).getMonth() + 1);
};

const getDefaultMgtYear = (): string => {
  const range = getDefaultTwoMonthsAgoRange();
  return String(new Date(range.dateFin).getFullYear());
};

const defaultMonth = getDefaultMgtMonth();
const defaultYear = getDefaultMgtYear();

const MgtDashboard: React.FC = () => {
  const saved = loadFilters()
  const [filters, setFilters] = useState({
    filiale: saved?.filiale ?? 'toutes',
    site: saved?.site ?? '',
    famille: saved?.famille ?? 'toutes',
    decade: saved?.decade ?? '',
    month: saved?.month ?? defaultMonth,
    year: saved?.year ?? defaultYear,
  })
  const [filialeOpts, setFilialeOpts] = useState<{ value: string; label: string }[]>([])
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    saveWithTimestamp(STORAGE_KEY, filters);
  }, [filters])

  useEffect(() => {
    getFiliales().then(opts => setFilialeOpts([{ value: 'toutes', label: 'Toutes' }, ...opts]))
  }, [])

  const setFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const tabProps = {
    filiale: filters.filiale,
    setFiliale: (v: string) => setFilter('filiale', v),
    site: filters.site,
    setSite: (v: string) => setFilter('site', v),
    famille: filters.famille,
    setFamille: (v: string) => setFilter('famille', v),
    decade: filters.decade,
    setDecade: (v: string) => setFilter('decade', v),
    month: filters.month,
    setMonth: (v: string) => setFilter('month', v),
    year: filters.year,
    setYear: (v: string) => setFilter('year', v),
    filialeOpts,
  }

  return (
    <div className="p-6">
      <div className="mx-auto w-full">
        <header className="mb-6">
          <h1 className={components.pageTitle}>Mgt Dashboard</h1>
        </header>
        <div className="flex gap-2 mb-4 border-b">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)} className={`px-4 py-2 rounded-t transition-colors duration-300 ${activeTab === i ? 'bg-blue-600 text-white font-bold' : 'bg-gray-200 text-gray-900'}`}>{t}</button>
          ))}
        </div>
        <main>
          <div className={`tab-panel ${activeTab === 0 ? '' : 'hidden'}`}>
            <MgtDashboardTable index={0} activeTab={activeTab} {...tabProps} />
          </div>
          <div className={`tab-panel ${activeTab === 1 ? '' : 'hidden'}`}>
            <MgtDashboardMonthlyTable index={1} activeTab={activeTab} {...tabProps} />
          </div>
          <div className={`tab-panel ${activeTab === 2 ? '' : 'hidden'}`}>
            <MgtDashboardDecadaireRecap index={2} activeTab={activeTab} {...tabProps} />
          </div>
          <div className={`tab-panel ${activeTab === 3 ? '' : 'hidden'}`}>
            <MgtDashboardMensuelRecap index={3} activeTab={activeTab} {...tabProps} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MgtDashboard
