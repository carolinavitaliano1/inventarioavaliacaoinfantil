import { useState } from 'react'
import {
  ArrowLeft, ClipboardList, BookOpen, TrendingUp, AlertCircle,
  FileSpreadsheet, FileText
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS, AREA_COLOR } from '../types'
import type { View } from '../App'
import { calcAreaDevResult, calcAgeMonths } from '../utils/ageCalc'
import { exportExcel } from '../utils/exportExcel'
import { exportWord } from '../utils/exportWord'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': 'Social',
  'II - ÁREA LINGUAGEM': 'Linguagem',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados',
  'IV- ÁREA COGNITIVA': 'Cognitivo',
  'V. ÁREA PSICOMOTORA': 'Psicomotor',
}

export default function PortageResults({ hook, setView }: Props) {
  const { current, getItemsByResponse } = hook
  const [tab, setTab] = useState<'overview' | 'graficos' | 'nao' | 'as_vezes'>('overview')
  const [exporting, setExporting] = useState<'excel' | 'word' | null>(null)

  if (!current) return null

  const { responses, studentInfo } = current
  const naoItems = getItemsByResponse('nao')
  const avItems = getItemsByResponse('as_vezes')

  // Compute dev results for all areas
  const areaResults = AREAS.map(area =>
    calcAreaDevResult(area, portageItems.filter(i => i.area === area), responses)
  )
  const mediaGeral = areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / areaResults.length
  const idadeCronologicaAnos = studentInfo.birthDate
    ? calcAgeMonths(studentInfo.birthDate) / 12
    : null

  const groupByArea = (items: typeof portageItems) => {
    const r: Record<string, typeof portageItems> = {}
    for (const i of items) { if (!r[i.area]) r[i.area] = []; r[i.area].push(i) }
    return r
  }

  const handleExportExcel = () => {
    setExporting('excel')
    try { exportExcel(current, areaResults, mediaGeral) } finally { setExporting(null) }
  }
  const handleExportWord = async () => {
    setExporting('word')
    try { await exportWord(current, areaResults, mediaGeral) } finally { setExporting(null) }
  }

  // Chart data
  const radarData = areaResults.map(r => ({
    area: AREA_SHORT[r.area] ?? r.area,
    'Idade Desenv. (anos)': parseFloat(r.idadeDesenvAnos.toFixed(2)),
    ...(idadeCronologicaAnos !== null ? { 'Idade Cronológica': parseFloat(idadeCronologicaAnos.toFixed(2)) } : {}),
  }))

  const barData = areaResults.map(r => ({
    area: AREA_SHORT[r.area] ?? r.area,
    'Idade Desenv.': parseFloat(r.idadeDesenvAnos.toFixed(2)),
    ...(idadeCronologicaAnos !== null ? { 'Idade Cronológica': parseFloat(idadeCronologicaAnos.toFixed(2)) } : {}),
  }))

  return (
    <div className="max-w-3xl mx-auto p-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Resultados</p>
          <p className="text-xs text-gray-400">{studentInfo.name}</p>
        </div>
        <button onClick={handleExportExcel} disabled={!!exporting}
          className="flex items-center gap-1 text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 transition disabled:opacity-60">
          <FileSpreadsheet className="w-3.5 h-3.5" /> {exporting === 'excel' ? 'Gerando...' : 'Excel'}
        </button>
        <button onClick={handleExportWord} disabled={!!exporting}
          className="flex items-center gap-1 text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition disabled:opacity-60">
          <FileText className="w-3.5 h-3.5" /> {exporting === 'word' ? 'Gerando...' : 'Word'}
        </button>
        <button onClick={() => setView('questionnaire')}
          className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <ClipboardList className="w-3.5 h-3.5" /> Questionário
        </button>
        <button onClick={() => setView('pei')}
          className="flex items-center gap-1 text-xs bg-purple-600 text-white rounded-lg px-3 py-1.5 hover:bg-purple-700 transition">
          <BookOpen className="w-3.5 h-3.5" /> PEI
        </button>
      </div>

      {/* Student info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
        <div><p className="text-xs text-gray-400">Aluno</p><p className="font-semibold truncate">{studentInfo.name}</p></div>
        <div><p className="text-xs text-gray-400">Idade</p><p className="font-semibold">{studentInfo.age || '—'}</p></div>
        <div><p className="text-xs text-gray-400">Diagnóstico</p><p className="font-semibold truncate">{studentInfo.diagnosis || '—'}</p></div>
        <div><p className="text-xs text-gray-400">Data</p><p className="font-semibold">{studentInfo.date}</p></div>
      </div>

      {/* Média geral card */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 mb-5 text-white text-center shadow">
        <p className="text-xs font-medium opacity-80 mb-1">Idade Desenvolvimental Média Geral</p>
        <p className="text-4xl font-bold">{mediaGeral.toFixed(2)} <span className="text-xl">anos</span></p>
        {idadeCronologicaAnos !== null && (
          <p className="text-xs opacity-80 mt-1">
            Idade cronológica: {idadeCronologicaAnos.toFixed(2)} anos
            {' · '}Diferença: {Math.abs(idadeCronologicaAnos - mediaGeral).toFixed(2)} anos
          </p>
        )}
      </div>

      {/* Summary cards */}
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
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {[
          { k: 'overview', label: 'Por Área', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { k: 'graficos', label: 'Gráficos', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { k: 'nao', label: `Prioridade (${naoItems.length})`, icon: <AlertCircle className="w-3.5 h-3.5" /> },
          { k: 'as_vezes', label: `Em Desenv. (${avItems.length})`, icon: <ClipboardList className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {areaResults.map(result => {
            const c = AREA_COLOR[result.area]
            return (
              <div key={result.area} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Area header */}
                <div className={`px-4 py-2.5 flex items-center justify-between ${c.light}`}>
                  <span className={`text-sm font-semibold ${c.text}`}>{result.area}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.badge}`}>
                    {result.idadeDesenvLabel}
                  </span>
                </div>

                <div className="p-4">
                  {/* Barra geral */}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">{result.totalSim + result.totalAv + result.totalNao}/{result.totalItems} respondidos</span>
                    <span className="text-xs font-medium text-gray-600">
                      Pontos: {result.totalPontos.toFixed(1)} · {Math.round((result.totalSim / result.totalItems) * 100)}% acertos
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-gray-100 flex mb-4">
                    <div className="bg-green-500 h-full" style={{ width: `${(result.totalSim / result.totalItems) * 100}%` }} />
                    <div className="bg-yellow-400 h-full" style={{ width: `${(result.totalAv / result.totalItems) * 100}%` }} />
                    <div className="bg-red-400 h-full" style={{ width: `${(result.totalNao / result.totalItems) * 100}%` }} />
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400 mb-4">
                    <span><span className="text-green-500 font-medium">✓</span> Sim: {result.totalSim}</span>
                    <span><span className="text-yellow-500 font-medium">~</span> Às vezes: {result.totalAv}</span>
                    <span><span className="text-red-500 font-medium">✗</span> Não: {result.totalNao}</span>
                  </div>

                  {/* Tabela por faixa etária */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={c.light}>
                          <th className={`text-left px-3 py-2 font-semibold ${c.text}`}>Faixa</th>
                          <th className={`text-center px-2 py-2 font-semibold ${c.text}`}>Total</th>
                          <th className="text-center px-2 py-2 font-semibold text-green-700">Sim</th>
                          <th className="text-center px-2 py-2 font-semibold text-yellow-600">Às vezes</th>
                          <th className="text-center px-2 py-2 font-semibold text-red-600">Não</th>
                          <th className={`text-center px-2 py-2 font-semibold ${c.text}`}>Pontos</th>
                          <th className={`text-center px-2 py-2 font-semibold ${c.text}`}>% Acertos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.groups.map(g => {
                          const highlight = g.pctAcertos >= 75
                          return (
                            <tr key={g.key} className={`border-t border-gray-100 ${highlight ? 'bg-green-50' : ''}`}>
                              <td className="px-3 py-1.5 font-medium text-gray-700">{g.label}</td>
                              <td className="px-2 py-1.5 text-center text-gray-500">{g.total}</td>
                              <td className="px-2 py-1.5 text-center text-green-600 font-medium">{g.sim}</td>
                              <td className="px-2 py-1.5 text-center text-yellow-600">{g.asVezes}</td>
                              <td className="px-2 py-1.5 text-center text-red-500">{g.nao}</td>
                              <td className="px-2 py-1.5 text-center font-semibold text-gray-700">{g.pontos.toFixed(1)}</td>
                              <td className="px-2 py-1.5 text-center font-bold">
                                <span className={g.pctAcertos >= 75 ? 'text-green-600' : g.pctAcertos >= 50 ? 'text-yellow-600' : 'text-red-500'}>
                                  {g.pctAcertos}%
                                </span>
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

      {/* ── GRÁFICOS ──────────────────────────────────────────────────────── */}
      {tab === 'graficos' && (
        <div className="space-y-6">
          {/* Radar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Perfil Desenvolvimental por Área (anos)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fontSize: 10 }} tickCount={4} />
                <Radar name="Idade Desenv." dataKey="Idade Desenv. (anos)" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                {idadeCronologicaAnos !== null && (
                  <Radar name="Idade Cronológica" dataKey="Idade Cronológica" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeDasharray="5 5" />
                )}
                <Legend />
                <Tooltip formatter={(v: any) => `${v.toFixed(2)} anos`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: Idade desenvolvimental vs cronológica */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Idade Desenvolvimental vs Cronológica por Área</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 6]} tickCount={7} tick={{ fontSize: 10 }} label={{ value: 'anos', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip formatter={(v: any) => `${v.toFixed(2)} anos`} />
                <Legend />
                <Bar dataKey="Idade Desenv." fill="#7c3aed" radius={[4, 4, 0, 0]} />
                {idadeCronologicaAnos !== null && (
                  <Bar dataKey="Idade Cronológica" fill="#3b82f6" radius={[4, 4, 0, 0]} fillOpacity={0.6} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart: % acertos por faixa etária e área */}
          {areaResults.map(result => {
            const c = AREA_COLOR[result.area]
            const data = result.groups.map(g => ({
              faixa: g.label.replace(' ano', 'a').replace(' anos', 'a'),
              'Sim (%)': g.pctAcertos,
              'Às vezes (%)': Math.round((g.asVezes / g.total) * 100),
            }))
            return (
              <div key={result.area} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold ${c.text}`}>{result.area}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.badge}`}>{result.idadeDesenvLabel}</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="faixa" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tickCount={6} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Sim (%)" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Às vezes (%)" stackId="a" fill="#facc15" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}

      {/* ── NÃO / ÀS VEZES ────────────────────────────────────────────────── */}
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

      <button onClick={() => setView('pei')}
        className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow flex items-center justify-center gap-2">
        <BookOpen className="w-4 h-4" /> Criar Plano de Ensino Individualizado (PEI)
      </button>
    </div>
  )
}
