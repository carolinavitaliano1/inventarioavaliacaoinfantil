import { useState, useRef } from 'react'
import {
  ArrowLeft, ClipboardList, BookOpen, TrendingUp, AlertCircle,
  FileText, User, Calendar, Download
} from 'lucide-react'
import { toPng } from 'html-to-image'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS, AREA_COLOR } from '../types'
import type { View } from '../App'
import { calcAreaDevResult, calcAgeMonths } from '../utils/ageCalc'
import { exportWord } from '../utils/exportWord'
import { formatQuestion } from '../utils/formatQuestion'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': 'Socialização',
  'II - ÁREA LINGUAGEM': 'Linguagem',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Autocuidados',
  'IV- ÁREA COGNITIVA': 'Cognição',
  'V. ÁREA PSICOMOTORA': 'Motora',
}

const AREA_LINE_COLOR: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': '#7c3aed',
  'II - ÁREA LINGUAGEM': '#2563eb',
  'III – ÁREA CUIDADOS PRÓPRIOS': '#16a34a',
  'IV- ÁREA COGNITIVA': '#ea580c',
  'V. ÁREA PSICOMOTORA': '#dc2626',
}

const FAIXAS = ['0–1 ano', '1–2 anos', '2–3 anos', '3–4 anos', '4–5 anos', '5–6 anos']

export default function PortageResults({ hook, setView }: Props) {
  const { current, getItemsByResponse, getSiblingAssessments, currentId } = hook
  const [tab, setTab] = useState<'sintese' | 'graficos' | 'progressao' | 'nao' | 'as_vezes'>('sintese')
  const [exportingWord, setExportingWord] = useState(false)
  const lineChartRef = useRef<HTMLDivElement>(null)
  const radarChartRef = useRef<HTMLDivElement>(null)
  const barChartRef = useRef<HTMLDivElement>(null)

  const downloadChart = async (ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    if (!ref.current) return
    const dataUrl = await toPng(ref.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${name}-${current?.studentInfo?.name ?? 'grafico'}.png`
    a.click()
  }

  if (!current) return null

  const { responses, studentInfo } = current
  const naoItems = getItemsByResponse('nao')
  const avItems = getItemsByResponse('as_vezes')

  const areaResults = AREAS.map(area =>
    calcAreaDevResult(area, portageItems.filter(i => i.area === area), responses)
  )
  const mediaGeral = areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / areaResults.length
  const idadeCronologicaAnos = studentInfo.birthDate ? calcAgeMonths(studentInfo.birthDate) / 12 : null

  // Avaliações anteriores da mesma criança (para gráfico de progressão)
  const siblings = currentId ? getSiblingAssessments(currentId) : []
  const hasSiblings = siblings.length > 1

  // Dados para o gráfico de progressão: uma entrada por avaliação
  const progressionData = siblings.map((sib, i) => {
    const sibResults = AREAS.map(area =>
      calcAreaDevResult(area, portageItems.filter(item => item.area === area), sib.responses)
    )
    const sibMedia = sibResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / sibResults.length
    const entry: Record<string, any> = {
      label: `Aval. ${i + 1}`,
      data: sib.studentInfo.date,
      'Média Geral': parseFloat(sibMedia.toFixed(2)),
    }
    for (const r of sibResults) entry[AREA_SHORT[r.area]] = parseFloat(r.idadeDesenvAnos.toFixed(2))
    return entry
  })

  const handleExportWord = async () => {
    setExportingWord(true)
    try { await exportWord(current, areaResults, mediaGeral) } finally { setExportingWord(false) }
  }

  const groupByArea = (items: typeof portageItems) => {
    const r: Record<string, typeof portageItems> = {}
    for (const i of items) { if (!r[i.area]) r[i.area] = []; r[i.area].push(i) }
    return r
  }

  // Line chart: X = faixas etárias, one line per área showing % acertos
  const lineData = FAIXAS.map((faixa, idx) => {
    const entry: Record<string, any> = { faixa: faixa.replace(' ano', 'a').replace(' anos', 'a') }
    for (const result of areaResults) {
      const g = result.groups.find(g => g.key === idx)
      entry[AREA_SHORT[result.area]] = g ? Math.round((g.sim / g.total) * 100) : 0
    }
    return entry
  })

  // Radar data
  const radarData = areaResults.map(r => ({
    area: AREA_SHORT[r.area],
    'Idade Desenv.': parseFloat(r.idadeDesenvAnos.toFixed(2)),
    ...(idadeCronologicaAnos !== null ? { 'Cronológica': parseFloat(idadeCronologicaAnos.toFixed(2)) } : {}),
  }))

  return (
    <div className="max-w-4xl mx-auto p-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Resultados – IPO</p>
          <p className="text-xs text-gray-400">{studentInfo.name}</p>
        </div>
        <button onClick={handleExportWord} disabled={exportingWord}
          className="flex items-center gap-1 text-xs bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 transition disabled:opacity-60">
          <FileText className="w-3.5 h-3.5" /> {exportingWord ? 'Gerando...' : 'Exportar Word'}
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

      {/* Cabeçalho estilo planilha */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 mb-5">
        <h2 className="text-center font-bold text-gray-800 text-sm mb-4 uppercase tracking-wide">
          Tabela Síntese de Resultados – Inventário Portage Operacionalizado (IPO)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { icon: <User className="w-3.5 h-3.5" />, label: 'Criança', value: studentInfo.name },
            { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Data de nascimento', value: studentInfo.birthDate },
            { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Idade', value: studentInfo.age },
            { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Data da avaliação', value: studentInfo.date },
            { icon: <User className="w-3.5 h-3.5" />, label: 'Diagnóstico', value: studentInfo.diagnosis || '—' },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">{icon}</span>
              <span className="text-gray-500 font-medium">{label}:</span>
              <span className="text-gray-800">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Média geral */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4 mb-5 text-white text-center shadow">
        <p className="text-xs font-medium opacity-80 mb-1">Idade Desenvolvimental – Média Geral</p>
        <p className="text-4xl font-bold">{mediaGeral.toFixed(2)} <span className="text-xl font-normal">anos</span></p>
        {idadeCronologicaAnos !== null && (
          <p className="text-xs opacity-80 mt-1">
            Cronológica: {idadeCronologicaAnos.toFixed(2)} anos
            {'  ·  '}
            Diferença: {(idadeCronologicaAnos - mediaGeral) >= 0 ? '+' : ''}{(idadeCronologicaAnos - mediaGeral).toFixed(2)} anos
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {[
          { k: 'sintese', label: 'Tabela Síntese', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          { k: 'graficos', label: 'Gráficos', icon: <TrendingUp className="w-3.5 h-3.5" /> },
          ...(hasSiblings ? [{ k: 'progressao', label: `Progressão (${siblings.length})`, icon: <TrendingUp className="w-3.5 h-3.5" /> }] : []),
          { k: 'nao', label: `Prioridade (${naoItems.length})`, icon: <AlertCircle className="w-3.5 h-3.5" /> },
          { k: 'as_vezes', label: `Em Desenv. (${avItems.length})`, icon: <ClipboardList className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── TABELA SÍNTESE ────────────────────────────────────────────────── */}
      {tab === 'sintese' && (
        <div className="space-y-5">
          {/* Tabela de PONTOS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-100">
              <p className="text-sm font-bold text-purple-800">Pontuação por Área e Faixa Etária</p>
              <p className="text-xs text-purple-500 mt-0.5">Pontos = Sim × 1 + Às vezes × 0,5</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 min-w-[110px]">Área</th>
                    {FAIXAS.map(f => <th key={f} className="text-center px-2 py-2 font-semibold text-gray-600 whitespace-nowrap">{f}</th>)}
                    <th className="text-center px-2 py-2 font-semibold text-purple-700">Idade Desenv.</th>
                  </tr>
                </thead>
                <tbody>
                  {areaResults.map((result, ri) => {
                    const c = AREA_COLOR[result.area]
                    return (
                      <tr key={result.area} className={`border-b border-gray-50 ${ri % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className={`px-3 py-2 font-semibold text-xs ${c.text}`}>{AREA_SHORT[result.area]}</td>
                        {result.groups.map(g => {
                          const maxPontos = g.total
                          const pct = g.total > 0 ? (g.pontos / maxPontos) * 100 : 0
                          return (
                            <td key={g.key} className="px-2 py-2 text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-gray-800">{g.pontos.toFixed(1)}</span>
                                <span className="text-gray-400">/{g.total}</span>
                                <div className="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: AREA_LINE_COLOR[result.area] }} />
                                </div>
                              </div>
                            </td>
                          )
                        })}
                        <td className="px-2 py-2 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{result.idadeDesenvLabel}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de % */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100">
              <p className="text-sm font-bold text-blue-800">% de Acertos por Área e Faixa Etária</p>
              <p className="text-xs text-blue-500 mt-0.5">Verde ≥ 75% · Amarelo 50–74% · Vermelho &lt; 50%</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600 min-w-[110px]">Área</th>
                    {FAIXAS.map(f => <th key={f} className="text-center px-2 py-2 font-semibold text-gray-600 whitespace-nowrap">{f}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {areaResults.map((result, ri) => {
                    const c = AREA_COLOR[result.area]
                    return (
                      <tr key={result.area} className={`border-b border-gray-50 ${ri % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className={`px-3 py-2 font-semibold text-xs ${c.text}`}>{AREA_SHORT[result.area]}</td>
                        {result.groups.map(g => {
                          const pct = g.pctAcertos
                          const bg = pct >= 75 ? 'bg-green-100 text-green-700' : pct >= 50 ? 'bg-yellow-100 text-yellow-700' : pct > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-300'
                          return (
                            <td key={g.key} className="px-2 py-2 text-center">
                              <span className={`inline-block font-bold px-2 py-0.5 rounded-lg ${bg}`}>{pct > 0 ? `${pct}%` : '—'}</span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de detalhes: Sim / Às vezes / Não */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">Detalhamento de Respostas por Área</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Área</th>
                    <th className="text-center px-2 py-2 font-semibold text-gray-500">Total</th>
                    <th className="text-center px-2 py-2 font-semibold text-green-700">Sim</th>
                    <th className="text-center px-2 py-2 font-semibold text-yellow-600">Às vezes</th>
                    <th className="text-center px-2 py-2 font-semibold text-red-600">Não</th>
                    <th className="text-center px-2 py-2 font-semibold text-purple-700">Pontos</th>
                    <th className="text-center px-2 py-2 font-semibold text-blue-700">% Acertos</th>
                    <th className="text-center px-2 py-2 font-semibold text-purple-700">Idade Desenv.</th>
                  </tr>
                </thead>
                <tbody>
                  {areaResults.map((result, ri) => {
                    const c = AREA_COLOR[result.area]
                    const pctTotal = Math.round((result.totalSim / result.totalItems) * 100)
                    return (
                      <tr key={result.area} className={`border-b border-gray-50 ${ri % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className={`px-3 py-2 font-semibold text-xs ${c.text}`}>{AREA_SHORT[result.area]}</td>
                        <td className="px-2 py-2 text-center text-gray-500">{result.totalItems}</td>
                        <td className="px-2 py-2 text-center font-bold text-green-600">{result.totalSim}</td>
                        <td className="px-2 py-2 text-center text-yellow-600">{result.totalAv}</td>
                        <td className="px-2 py-2 text-center text-red-500">{result.totalNao}</td>
                        <td className="px-2 py-2 text-center font-bold text-gray-700">{result.totalPontos.toFixed(1)}</td>
                        <td className="px-2 py-2 text-center">
                          <span className={`font-bold ${pctTotal >= 75 ? 'text-green-600' : pctTotal >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{pctTotal}%</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{result.idadeDesenvLabel}</span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-purple-50 border-t-2 border-purple-200">
                    <td className="px-3 py-2 font-bold text-purple-800 text-xs">MÉDIA GERAL</td>
                    <td colSpan={6} />
                    <td className="px-2 py-2 text-center">
                      <span className="text-sm font-bold text-purple-800">{mediaGeral.toFixed(2)} anos</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── GRÁFICOS ──────────────────────────────────────────────────────── */}
      {tab === 'graficos' && (
        <div className="space-y-5">
          {/* Gráfico de linhas: % por faixa etária, uma linha por área */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-700">% de Acertos por Faixa Etária e Área</h3>
              <button onClick={() => downloadChart(lineChartRef, 'grafico-linhas')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Cada linha representa uma área; eixo X = faixa etária</p>
            <div ref={lineChartRef} className="bg-white p-2 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="faixa" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tickCount={6} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {areaResults.map(result => (
                  <Line
                    key={result.area}
                    type="monotone"
                    dataKey={AREA_SHORT[result.area]}
                    stroke={AREA_LINE_COLOR[result.area]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: AREA_LINE_COLOR[result.area] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Radar: perfil desenvolvimental */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-gray-700">Perfil Desenvolvimental por Área</h3>
              <button onClick={() => downloadChart(radarChartRef, 'grafico-radar')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Idade desenvolvimental em anos vs. cronológica</p>
            <div ref={radarChartRef} className="bg-white p-2 rounded-xl">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 6]} tick={{ fontSize: 10 }} tickCount={4} />
                <Radar name="Idade Desenv." dataKey="Idade Desenv." stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} />
                {idadeCronologicaAnos !== null && (
                  <Radar name="Cronológica" dataKey="Cronológica" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeDasharray="5 5" />
                )}
                <Legend />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} anos`} />
              </RadarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Mini barras por área mostrando % por faixa */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Perfil de Acertos por Área e Faixa Etária</h3>
              <button onClick={() => downloadChart(barChartRef, 'grafico-barras')} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
                <Download className="w-3.5 h-3.5" /> Baixar
              </button>
            </div>
            <div ref={barChartRef} className="bg-white p-2 rounded-xl">
            <div className="space-y-4">
              {areaResults.map(result => {
                const c = AREA_COLOR[result.area]
                const color = AREA_LINE_COLOR[result.area]
                return (
                  <div key={result.area}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${c.text}`}>{AREA_SHORT[result.area]}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{result.idadeDesenvLabel}</span>
                    </div>
                    <div className="flex gap-1">
                      {result.groups.map(g => {
                        const pct = g.pctAcertos
                        return (
                          <div key={g.key} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full bg-gray-100 rounded h-16 flex flex-col-reverse overflow-hidden">
                              <div className="w-full rounded transition-all" style={{ height: `${pct}%`, backgroundColor: color, opacity: 0.85 }} />
                            </div>
                            <span className="text-[10px] text-gray-500 font-bold">{pct}%</span>
                            <span className="text-[9px] text-gray-400">{g.label.split('–')[0]}–{g.label.includes('ano ') ? '1' : g.label.split('–')[1]?.split(' ')[0]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESSÃO ───────────────────────────────────────────────────── */}
      {tab === 'progressao' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-1">Progressão da Idade Desenvolvimental</h3>
            <p className="text-xs text-gray-400 mb-4">Evolução entre avaliações — cada ponto representa uma avaliação da criança</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 6]} tickCount={7} tick={{ fontSize: 10 }} unit=" anos" />
                <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)} anos`} labelFormatter={(l, p) => `${l} (${p[0]?.payload?.data ?? ''})`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Média Geral" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} strokeDasharray="" />
                {areaResults.map(r => (
                  <Line key={r.area} type="monotone" dataKey={AREA_SHORT[r.area]} stroke={AREA_LINE_COLOR[r.area]} strokeWidth={1.5} dot={{ r: 3 }} opacity={0.7} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela comparativa entre avaliações */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-purple-50 border-b border-purple-100">
              <p className="text-sm font-bold text-purple-800">Comparativo entre Avaliações</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Área</th>
                    {siblings.map((_, i) => (
                      <th key={i} className="text-center px-2 py-2 font-semibold text-gray-600 whitespace-nowrap">Aval. {i + 1}</th>
                    ))}
                    <th className="text-center px-2 py-2 font-semibold text-green-700">Δ Total</th>
                  </tr>
                </thead>
                <tbody>
                  {AREAS.map((area, ai) => {
                    const c = AREA_COLOR[area]
                    const sibVals = siblings.map(sib => {
                      const r = calcAreaDevResult(area, portageItems.filter(i => i.area === area), sib.responses)
                      return r.idadeDesenvAnos
                    })
                    const delta = sibVals.length > 1 ? sibVals[sibVals.length - 1] - sibVals[0] : 0
                    return (
                      <tr key={area} className={`border-b border-gray-50 ${ai % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className={`px-3 py-2 font-semibold ${c.text}`}>{AREA_SHORT[area]}</td>
                        {sibVals.map((v, i) => (
                          <td key={i} className="px-2 py-2 text-center text-gray-700 font-medium">{v.toFixed(2)} anos</td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          <span className={`font-bold ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {delta > 0 ? '+' : ''}{delta.toFixed(2)} anos
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-purple-50 border-t-2 border-purple-200">
                    <td className="px-3 py-2 font-bold text-purple-800">Média Geral</td>
                    {progressionData.map((p, i) => (
                      <td key={i} className="px-2 py-2 text-center font-bold text-purple-700">{p['Média Geral']} anos</td>
                    ))}
                    <td className="px-2 py-2 text-center">
                      {progressionData.length > 1 && (
                        <span className={`font-bold ${(progressionData[progressionData.length-1]['Média Geral'] - progressionData[0]['Média Geral']) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {(progressionData[progressionData.length-1]['Média Geral'] - progressionData[0]['Média Geral']) >= 0 ? '+' : ''}
                          {(progressionData[progressionData.length-1]['Média Geral'] - progressionData[0]['Média Geral']).toFixed(2)} anos
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
                        <p className="text-gray-800">{formatQuestion(item.text)}</p>
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
