import React, { useState, useEffect } from 'react'
import { getMgtMensuelRecap } from '../../api/dataServices'
import { useEntityOptions } from '../Crud/useEntityOptions'
import SearchableSelect from '../common/SearchableSelect'

const PERIODE_OPTION_STYLE = { color: "#166534" } as React.CSSProperties;
const PERIODE_SELECT_STYLE = { color: "#166534", backgroundColor: "#dcfce7" } as React.CSSProperties;

const FAMILLE_PAGE_SIZE = 1000

interface Props {
  index: number
  activeTab: number
  filiale: string
  setFiliale: (v: string) => void
  site: string
  setSite: (v: string) => void
  famille: string
  setFamille: (v: string) => void
  month: string
  setMonth: (v: string) => void
  year: string
  setYear: (v: string) => void
  filialeOpts: { value: string; label: string }[]
}

const MgtDashboardMensuelRecap: React.FC<Props> = ({
  index, activeTab,
  filiale, setFiliale, site, setSite, famille, setFamille, month, setMonth, year, setYear, filialeOpts,
}) => {
  const [recapData, setRecapData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loadedFilterVersion, setLoadedFilterVersion] = useState(-1)
  const [filterVersion, setFilterVersion] = useState(0)

  const siteOpts = useEntityOptions<any>('site', 'code_site', 'libelle_site', filiale !== 'toutes' ? { code_filiale: filiale } : {}, FAMILLE_PAGE_SIZE)
  const { options: familleOptions } = useEntityOptions<any>('famille-materiel', 'code_famille', 'libelle_famille', {}, FAMILLE_PAGE_SIZE)

  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  useEffect(() => {
    setFilterVersion(v => v + 1)
  }, [filiale, site, famille, month, year])

  useEffect(() => {
    if (activeTab !== index) return
    if (loaded && loadedFilterVersion === filterVersion) return
    if (familleOptions.length === 0) return
    setLoading(true)
    ;(async () => {
      try {
        const data = await getMgtMensuelRecap({
          famille: famille === 'toutes' ? undefined : famille,
          site: site || undefined,
          filiale: filiale === 'toutes' ? undefined : filiale,
          mmaa: `${year}${String(month).padStart(2,'0')}`,
        })
        setRecapData(Array.isArray(data) ? data : [])
      } catch {
        setRecapData([])
      } finally {
        setLoading(false)
        setLoaded(true)
        setLoadedFilterVersion(filterVersion)
      }
    })()
  }, [activeTab, index, filterVersion, loaded, loadedFilterVersion, famille, site, filiale, month, year, familleOptions])

  const filterBar = (
    <div className="flex gap-4 mb-4 items-center flex-wrap">
      <select value={filiale} onChange={e => setFiliale(e.target.value)} className="border p-2 rounded">
        {filialeOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="w-64">
        <SearchableSelect options={[{ value: 'toutes', label: 'Toutes les familles' }, ...familleOptions.map((o: any) => ({ value: o.value, label: o.label }))]} value={famille} onChange={setFamille} placeholder="Famille" />
      </div>
      <div className="w-64">
        <SearchableSelect options={[{ value: '', label: 'Tous les chantiers' }, ...siteOpts.options.map((o: any) => ({ value: o.value, label: o.value + ' - ' + o.label }))]} value={site} onChange={setSite} placeholder="Chantier (Site)" />
      </div>
      <select value={month} onChange={e => setMonth(e.target.value)} className="border p-2 rounded" style={PERIODE_SELECT_STYLE}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m} style={PERIODE_OPTION_STYLE}>{monthNames[m - 1]}</option>)}
      </select>
      <select value={year} onChange={e => setYear(e.target.value)} className="border p-2 rounded" style={PERIODE_SELECT_STYLE}>
        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y} style={PERIODE_OPTION_STYLE}>{y}</option>)}
      </select>
    </div>
  )

  if (familleOptions.length === 0) {
    return (
      <div className="p-6 bg-white rounded shadow">
        {filterBar}
        <div>Chargement des familles...</div>
      </div>
    )
  }

  const totalHS = recapData.reduce((s, r) => s + Number(r.heures_service || 0), 0)
  const totalHC = recapData.reduce((s, r) => s + Number(r.heures_chomage || 0), 0)
  const totalHP = recapData.reduce((s, r) => s + Number(r.heures_panne || 0), 0)
  const totalHT = recapData.reduce((s, r) => s + Number(r.heures_service || 0) + Number(r.heures_chomage || 0) + Number(r.heures_panne || 0), 0)

  return (
    <div className="p-6 bg-white rounded shadow">
      {filterBar}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-sm">Famille</th>
              <th className="border p-2 text-sm">H. Service</th>
              <th className="border p-2 text-sm">% Service</th>
              <th className="border p-2 text-sm">H. Chômage</th>
              <th className="border p-2 text-sm">% Chômage</th>
              <th className="border p-2 text-sm">H. Panne</th>
              <th className="border p-2 text-sm">% Panne</th>
              <th className="border p-2 text-sm">Coût Réparation (DZD)</th>
              <th className="border p-2 text-sm">Coût Entretien (Lub./Filtre..)</th>
              <th className="border p-2 text-sm">Coût Total Engagé (DZD)</th>
              <th className="border p-2 text-sm">Coût ALREM (DZD)</th>
            </tr>
          </thead>
          <tbody>
            {recapData.map((r, i) => {
              const hs = Number(r.heures_service || 0)
              const hc = Number(r.heures_chomage || 0)
              const hp = Number(r.heures_panne || 0)
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border p-2">{r.famille_label || r.famille}</td>
                  <td className="border p-2">{hs}</td>
                  <td className="border p-2">{Number(r.pourcentage_service || 0)}%</td>
                  <td className="border p-2">{hc}</td>
                  <td className="border p-2">{Number(r.pourcentage_chomage || 0)}%</td>
                  <td className="border p-2">{hp}</td>
                  <td className="border p-2">{Number(r.pourcentage_panne || 0)}%</td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2">0</td>
                </tr>
              )
            })}
            <tr className="bg-gray-100 font-bold">
              <td className="border p-2">Total</td>
              <td className="border p-2">{totalHS}</td>
              <td className="border p-2">{totalHT > 0 ? Math.round((totalHS / totalHT) * 100) : 0}%</td>
              <td className="border p-2">{totalHC}</td>
              <td className="border p-2">{totalHT > 0 ? Math.round((totalHC / totalHT) * 100) : 0}%</td>
              <td className="border p-2">{totalHP}</td>
              <td className="border p-2">{totalHT > 0 ? Math.round((totalHP / totalHT) * 100) : 0}%</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2">0</td>
            </tr>
          </tbody>
        </table>
      </div>
      {loading && <div className="mt-2 text-gray-500 text-sm">Chargement…</div>}
    </div>
  )
}

export default MgtDashboardMensuelRecap
