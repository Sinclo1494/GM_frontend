import React, { useState, useEffect, useCallback } from 'react'
import { getMgtMensuel } from '../../api/dataServices'
import { useEntityOptions } from '../Crud/useEntityOptions'
import SearchableSelect from '../common/SearchableSelect'
import { components } from '../../theme/components'

const PERIODE_OPTION_STYLE = { color: "#166534" } as React.CSSProperties;
const PERIODE_SELECT_STYLE = { color: "#166534", backgroundColor: "#dcfce7" } as React.CSSProperties;

interface Row {
  code_materiel: string
  designation: string
  famille: string
  marque: string
  type: string
  performance: string
  age: string
  hService: number
  hChomage: number
  hPanne: number
  tauxService: number
  tauxChomage: number
  tauxPanne: number
  dateImmobilisation: string
}

interface FamillePage {
  results: Row[]
  count: number
  total_pages: number
  page: number
  page_size: number
  loading: boolean
  totals: Record<string, any>
}

const DEFAULT_PAGE_SIZE = 10
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

const MgtDashboardMonthlyTable: React.FC<Props> = ({
  index, activeTab,
  filiale, setFiliale, site, setSite, famille, setFamille, month, setMonth, year, setYear, filialeOpts,
}) => {
  const siteOpts = useEntityOptions<any>('site', 'code_site', 'libelle_site', filiale !== 'toutes' ? { code_filiale: filiale } : {}, FAMILLE_PAGE_SIZE)
  const { options: familleOptions } = useEntityOptions<any>('famille-materiel', 'code_famille', 'libelle_famille', {}, FAMILLE_PAGE_SIZE)
  const [familyData, setFamilyData] = useState<Record<string, FamillePage>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loaded, setLoaded] = useState(false)
  const [loadedFilterVersion, setLoadedFilterVersion] = useState(-1)
  const [filterVersion, setFilterVersion] = useState(0)

  const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  const familleLabel = (code: string) => {
    const o = familleOptions.find((x: any) => x.value === code)
    return o ? o.label : code
  }

  useEffect(() => {
    setFilterVersion(v => v + 1)
  }, [filiale, site, famille, month, year])

  const loadFamille = useCallback(async (fam: string, pageNum: number, pageSize: number) => {
    setFamilyData(prev => ({ ...prev, [fam]: { ...prev[fam], loading: true } }))
    try {
      const data = await getMgtMensuel({
        famille: fam,
        site: site || undefined,
        filiale: filiale || undefined,
        mmaa: `${year}${String(month).padStart(2,'0')}`,
        page: pageNum,
        page_size: pageSize,
      })
      const results = (data.results || []).map((r: any) => ({
        code_materiel: r.code_materiel,
        designation: r.designation,
        famille: r.famille,
        marque: r.marque || '',
        type: r.type || '',
        performance: r.performance || '',
        age: r.age || '',
        hService: r.heures_service || 0,
        hChomage: r.heures_chomage || 0,
        hPanne: r.heures_panne || 0,
        tauxService: r.pourcentage_service ?? 0,
        tauxChomage: r.pourcentage_chomage ?? 0,
        tauxPanne: r.pourcentage_panne ?? 0,
        dateImmobilisation: r.date_immobilisation,
      }))
      setFamilyData(prev => ({
        ...prev,
        [fam]: {
          results,
          count: data.count || 0,
          total_pages: data.total_pages || 1,
          page: data.page || pageNum,
          page_size: data.page_size || pageSize,
          totals: data.totals || {},
          loading: false,
        },
      }))
    } catch {
      setFamilyData(prev => ({ ...prev, [fam]: { ...prev[fam], loading: false } }))
    }
  }, [filiale, site, month, year])

  useEffect(() => {
    if (activeTab !== index) return
    if (loaded && loadedFilterVersion === filterVersion) return
    const visible = famille === 'toutes' ? familleOptions.map((o: any) => o.value) : [famille]
    if (visible.length === 0) return
    const pageNum = 1
    const ps = DEFAULT_PAGE_SIZE
    visible.forEach(fam => {
      setFamilyData(prev => ({ ...prev, [fam]: { results: [], count: 0, total_pages: 1, page: 1, page_size: ps, loading: true } }))
    })
    ;(async () => {
      await Promise.all(visible.map(fam => loadFamille(fam, pageNum, ps)))
      setLoaded(true)
      setLoadedFilterVersion(filterVersion)
    })()
  }, [activeTab, index, filterVersion, loaded, loadedFilterVersion, famille, familleOptions, loadFamille])

  const changePage = (fam: string, pageNum: number) => {
    const ps = familyData[fam]?.page_size || DEFAULT_PAGE_SIZE
    setFamilyData(prev => ({ ...prev, [fam]: { ...prev[fam], page: pageNum, loading: true } }))
    loadFamille(fam, pageNum, ps)
  }

  const changePageSize = (fam: string, newSize: number) => {
    setFamilyData(prev => ({ ...prev, [fam]: { ...prev[fam], page_size: newSize, page: 1, loading: true } }))
    loadFamille(fam, 1, newSize)
  }

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

  const visible = (famille === 'toutes' ? familleOptions.map((o: any) => o.value) : [famille]).filter(fam => {
    const fd = familyData[fam]
    return fd ? (fd.loading || (fd.count || 0) > 0) : false
  })

  return (
    <div className="p-6 bg-white rounded shadow">
      {filterBar}
      <div>
        {visible.map(fam => {
          const fd = familyData[fam]
          if (!fd) return null
          const items = fd.results
          const total = fd.count
          const pages = fd.total_pages
          const p = fd.page
          const ps = fd.page_size
          const paginationItems: (number | '...')[] = []
          if (pages > 7) {
            paginationItems.push(1)
            const start = Math.max(2, p - 1)
            const end = Math.min(pages - 1, p + 1)
            if (start > 2) paginationItems.push('...')
            for (let i = start; i <= end; i++) paginationItems.push(i)
            if (end < pages - 1) paginationItems.push('...')
            paginationItems.push(pages)
          } else {
            for (let i = 1; i <= pages; i++) paginationItems.push(i)
          }
          return (
            <div key={fam} className="mb-6 border rounded">
              <div className="flex items-center justify-between bg-gray-200 p-2 cursor-pointer" onClick={() => setExpanded(e => ({ ...e, [fam]: !(e[fam] !== false) }))}>
                <span className="font-bold">{familleLabel(fam)} ({total})</span>
                <select className="border p-1" onClick={(e) => e.stopPropagation()} value={ps} onChange={e => { e.stopPropagation(); changePageSize(fam, Number(e.target.value)) }}>
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={0}>tout</option>
                </select>
              </div>
              {fd.loading ? (
                <div className="p-4 text-center text-gray-500">Chargement...</div>
              ) : expanded[fam] !== false && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          {[
                            'Famille','Désignation','Code','Marque','Type','Performance / Capacité','Âge (ans)',
                            'H. Service','% Service','H. Chômage','% Chômage','H. Panne','% Panne',
                            'Chômage','Date Entrée (Répr.)','Date Prév. Sortie','Coût Réparation (DZD)','Coût Entretien (Lub./Filtre..)','En Attente Diag.','Proposer à la Réforme',
                            'Coût Total Engagé (DZD)',
                            'Implantation (Rouïba/Blida/M\'Sila)','Date Entrée','Devis / date traitement','Date de sortie prévu','Coût ALREM (DZD)'
                          ].map(h => <th key={h} className="border p-2 text-sm">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="border p-2">{r.famille}</td>
                            <td className="border p-2">{r.designation}</td>
                            <td className="border p-2">{r.code_materiel}</td>
                            <td className="border p-2">{r.marque}</td>
                            <td className="border p-2">{r.type}</td>
                            <td className="border p-2">{r.performance}</td>
                            <td className="border p-2">{r.age}</td>
                            <td className="border p-2">{r.hService}</td>
                            <td className="border p-2">{r.tauxService}%</td>
                            <td className="border p-2">{r.hChomage}</td>
                            <td className="border p-2">{r.tauxChomage}%</td>
                            <td className="border p-2">{r.hPanne}</td>
                            <td className="border p-2">{r.tauxPanne}%</td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2">0</td>
                          </tr>
                        ))}
                      </tbody>
                      {items.length > 0 && (
                        <tfoot>
                          <tr className="bg-gray-100 font-bold">
                            <td className="border p-2" colSpan={2}>Total ({fd.count})</td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2">{Number(fd.totals.heures_service || 0)}</td>
                            <td className="border p-2">{Math.round(Number(fd.totals.pourcentage_service || 0))}%</td>
                            <td className="border p-2">{Number(fd.totals.heures_chomage || 0)}</td>
                            <td className="border p-2">{Math.round(Number(fd.totals.pourcentage_chomage || 0))}%</td>
                            <td className="border p-2">{Number(fd.totals.heures_panne || 0)}</td>
                            <td className="border p-2">{Math.round(Number(fd.totals.pourcentage_panne || 0))}%</td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                            <td className="border p-2"></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                    {pages > 1 && (
                      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button onClick={() => changePage(fam, Math.max(1, p - 1))} disabled={p === 1} className={components.button.primary}>Précédent</button>
                        <div className="flex items-center gap-2">
                          {paginationItems.map((item, idx) => item === '...' ? <span key={'e-' + fam + idx} className="px-2 text-gray-400">...</span> : <button key={fam + '-' + item} onClick={() => changePage(fam, item as number)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${p === item ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-slate-300 hover:border-blue-600'}`}>{item}</button>)}
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Aller à</span>
                            <input type="number" min={1} max={pages} defaultValue={String(p)} onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt((e.target as HTMLInputElement).value, 10); if (!isNaN(v) && v >= 1 && v <= pages) changePage(fam, v) } }} className="w-16 px-2 py-1 text-sm border border-slate-300 rounded bg-white text-gray-900" />
                          </div>
                        </div>
                        <button onClick={() => changePage(fam, Math.min(pages, p + 1))} disabled={p === pages} className={components.button.primary}>Suivant</button>
                      </div>
                    )}
                    </div>
                  )
                }
              </div>
            )})}
      </div>
    </div>
  )
}

export default MgtDashboardMonthlyTable
