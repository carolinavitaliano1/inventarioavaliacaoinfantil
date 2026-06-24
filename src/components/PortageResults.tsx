import { useState } from 'react'
import { ArrowLeft, ClipboardList, BookOpen, TrendingUp, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS, AREA_COLOR } from '../types'
import type { View } from '../App'
import { ageRangeOrder, AGE_RANGE_LABEL } from '../utils/ageCalc'
import { exportExcel } from '../utils/exportExcel'
import { exportWord } from '../utils/exportWord'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

export default function PortageResults({ hook, setView }: Props) {
  const { current, getItemsByResponse } = hook
  const [tab, setTab] = useState<'overview' | 'nao' | 'as_vezes'>('overview')
  const [exporting, setExporting] = useState<'excel' | 'word' | null>(null)

  if (!current) return null

  const { responses } = current
  const naoItems = getItemsByResponse('nao')
  const avItems = getItemsByResponse('as_vezes')

  const groupByArea = (items: typeof portageItems) => {
    const r: Record<string, typeof portageItems> = {}
    for (const i of items) { if (!r[i.area]) r[i.area] = []; r[i.area].push(i) }
    return r
  }

  // Per-area developmental age (highest faixa etária with ≥75% acertos)
  const devAge = (area: string): string => {
    const areaItems = portageItems.filter(i => i.area === area)
    const ageGroups: Record<number, typeof portageItems> = {}
    for (const item of areaItems) {
      const k = ageRangeOrder(item.age_range)
      if (!ageGroups[k]) ageGroups[k] = []
      ageGroups[k].push(item)
    }
    let best = '—'
    for (const k of Object.keys(ageGroups).map(Number).sort((a, b) => a - b)) {
      const g = ageGroups[k]
      const sim = g.filter(i => responses[i.id] === 'sim').length
      if ((sim / g.length) * 100 >= 75) best = AGE_RANGE_LABEL[k]
    }
    return best
  }

  const ageGroupsForArea = (area: string) => {
    const areaItems = portageItems.filter(i => i.area === area)
    const groups: Record<number, typeof portageItems> = {}
    for (const item of areaItems) {
      const k = ageRangeOrder(item.age_range)
      if (!groups[k]) groups[k] = []
      groups[k].push(item)
    }
    return groups
  }

  const handleExportExcel = () => {
    setExporting('excel')
    try { exportExcel(current) } finally { setExporting(null) }
  }

  const handleExportWord = async () => {
    setExporting('word')
    try { await exportWord(current) } finally { setExporting(null) }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Resultados</p>
          <p className="text-xs text-gray-400">{current.studentInfo.name}</p>
        </div>
        <button onClick={handleExportExcel} disabled={!!exporting}
          className="flex items-center gap-1 text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 transition disabled:opacity-60">
          <FileSpreadsheet className="w-3.5 h-3.5" /> {exporting === 'excel' ? 'Gerando...' : 'Excel'}
        </button>
        <button onClick={handleExportWord} disabled={!!exporting}
          className="flex items-center gap-1 text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition disabled:opacity-60">
          <FileText className="w-3.5 h-3.5" /> {exporting === 'word' ? 'Gerando...' : 'Word'}
        </button>
        <button onClick={() => setView('questionnaire')} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <ClipboardList className="w-3.5 h-3.5" /> Questionário
        </button>
        <button onClick={() => setView('pei')} className="flex items-center gap-1 text-xs bg-purple-600 text-white rounded-lg px-3 py-1.5 hover:bg-purple-700 transition">
          <BookOpen className="w-3.5 h-3.5" /> PEI
        </button>
      </div>

      {/* Student info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div><p className="text-xs text-gray-400">Aluno</p><p className="font-semibold truncate">{current.studentInfo.name}</p></div>
        <div><p className="text-xs text-gray-400">Idade</p><p className="font-semibold">{current.studentInfo.age || '—'}</p></div>
        <div><p className="text-xs text-gray-400">Diagnóstico</p><p className="font-semibold truncate">{current.studentInfo.diagnosis || '—'}</p></div>
        <div><p className="text-xs text-gray-400">Data</p><p className="font-semibold">{current.studentInfo.date}</p></div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{portageItems.filter(i => responses[i.id] === 'sim').length}</p>
          <p className="text-xs text-green-700 font-medium mt-0.5">Sim (Faz)</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{naoItems.length}</p>
          <p className="text-xs text-red-700 font-medium mt-0.5">Alta Prioridade</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{avItems.length}</p>
          <p className="text-xs text-yellow-700 font-medium mt-0.5">Em Desenvolvimento</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {[
          { k: 'overview', label: 'Visão Geral', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { k: 'nao', label: `Alta Prior. (${naoItems.length})`, icon: <AlertCircle className="w-3.5 h-3.5" /> },
          { k: 'as_vezes', label: `Em Desenv. (${avItems.length})`, icon: <ClipboardList className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {AREAS.map(area => {
            const c = AREA_COLOR[area]
            const items = portageItems.filter(i => i.area === area)
            const sim = items.filter(i => responses[i.id] === 'sim').length
            const nao = items.filter(i => responses[i.id] === 'nao').length
            const av = items.filter(i => responses[i.id] === 'as_vezes').length
            const total = items.length
            const groups = ageGroupsForArea(area)
            const da = devAge(area)

            return (
              <div key={area} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className={`px-4 py-2.5 flex items-center justify-between ${c.light}`}>
                  <span className={`text-sm font-semibold ${c.text}`}>{area}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>Idade Desenv.: {da}</span>
                </div>
                <div className="p-4">
                  {/* Barra geral */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{sim + nao + av}/{total} respondidos</span>
                    <span className="text-xs font-medium text-gray-600">{Math.round((sim / total) * 100)}% acertos</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-gray-100 flex mb-4">
                    <div className="bg-green-500 h-full" style={{ width: `${(sim/total)*100}%` }} />
                    <div className="bg-yellow-400 h-full" style={{ width: `${(av/total)*100}%` }} />
                    <div className="bg-red-400 h-full" style={{ width: `${(nao/total)*100}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mb-4">
                    <span><span className="text-green-500 font-medium">✓</span> Sim: {sim}</span>
                    <span><span className="text-yellow-500 font-medium">~</span> Às vezes: {av}</span>
                    <span><span className="text-red-500 font-medium">✗</span> Não: {nao}</span>
                  </div>

                  {/* Tabela por faixa etária */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={`${c.light}`}>
                          <th className={`text-left px-3 py-2 font-semibold ${c.text}`}>Faixa Etária</th>
                          <th className={`text-center px-2 py-2 font-semibold ${c.text}`}>Total</th>
                          <th className={`text-center px-2 py-2 font-semibold text-green-700`}>Sim</th>
                          <th className={`text-center px-2 py-2 font-semibold text-yellow-600`}>Às vezes</th>
                          <th className={`text-center px-2 py-2 font-semibold text-red-600`}>Não</th>
                          <th className={`text-center px-2 py-2 font-semibold ${c.text}`}>% Acertos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(groups).map(Number).sort((a, b) => a - b).map(k => {
                          const g = groups[k]
                          const s = g.filter(i => responses[i.id] === 'sim').length
                          const a2 = g.filter(i => responses[i.id] === 'as_vezes').length
                          const n = g.filter(i => responses[i.id] === 'nao').length
                          const pct = Math.round((s / g.length) * 100)
                          const highlight = pct >= 75
                          return (
                            <tr key={k} className={`border-t border-gray-100 ${highlight ? 'bg-green-50' : ''}`}>
                              <td className="px-3 py-1.5 font-medium text-gray-700">{AGE_RANGE_LABEL[k]}</td>
                              <td className="px-2 py-1.5 text-center text-gray-500">{g.length}</td>
                              <td className="px-2 py-1.5 text-center text-green-600 font-medium">{s}</td>
                              <td className="px-2 py-1.5 text-center text-yellow-600">{a2}</td>
                              <td className="px-2 py-1.5 text-center text-red-500">{n}</td>
                              <td className="px-2 py-1.5 text-center font-bold">
                                <span className={pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-500'}>{pct}%</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Não / Às vezes */}
      {(tab === 'nao' || tab === 'as_vezes') && (() => {
        const list = tab === 'nao' ? naoItems : avItems
        const grouped = groupByArea(list)
        if (list.length === 0) return <p className="text-center text-gray-300 py-10">Nenhum item nesta categoria.</p>
        return (
          <div className="space-y-4">
            {Object.entries(grouped).map(([area, items]) => {
              const c = AREA_COLOR[area]
              return (
                <div key={area} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className={`px-4 py-2.5 ${c.light}`}>
                    <p className={`text-sm font-semibold ${c.text}`}>{area}</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {items.map(item => (
                      <div key={item.id} className={`p-2.5 rounded-xl text-xs ${tab === 'nao' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <p className="text-gray-800">{item.text}</p>
                        <p className="text-gray-400 mt-0.5">{item.age_range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      <button onClick={() => setView('pei')} className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow flex items-center justify-center gap-2">
        <BookOpen className="w-4 h-4" /> Criar Plano de Ensino Individualizado (PEI)
      </button>
    </div>
  )
}
