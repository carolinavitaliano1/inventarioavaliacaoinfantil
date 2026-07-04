import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, ClipboardList, BookOpen, Flag, FileText, Loader2, BarChart2, TrendingUp, Download } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from 'recharts'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS } from '../types'
import type { PortageItem, ResponseType } from '../types'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { calcAreaDevResult, calcAgeMonths } from '../utils/ageCalc'
import { exportWord } from '../utils/exportWord'
import { exportWordHtml, exportWordPdf } from '../utils/exportWord_html'
import { formatQuestion } from '../utils/formatQuestion'
import { areaVars, areaHue } from '../utils/areaDesign'
import TopBar from './TopBar'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth?: AuthHook; onBack?: () => void }

const BAND_LABELS = ['0–1 ano', '1–2 anos', '2–3 anos', '3–4 anos', '4–5 anos', '5–6 anos']
const BAND_SHORT  = ['0–1a', '1–2a', '2–3a', '3–4a', '4–5a', '5–6a']

function pctColor(p: number) {
  if (p >= 75) return { c: 'var(--pos)', b: 'var(--pos-bg)' }
  if (p >= 50) return { c: 'var(--part)', b: 'var(--part-bg)' }
  if (p > 0)  return { c: 'var(--neg)', b: 'var(--neg-bg)' }
  return { c: 'var(--ink-4)', b: 'var(--surface-2)' }
}

function areaColor(area: string) {
  const h = areaHue(area)
  return `hsl(${h} 46% 47%)`
}

// short area label for radar / legend
function areaShort(area: string) {
  const map: Record<string, string> = {
    'I – ÁREA SOCIABILIZAÇÃO':      'Socialização',
    'IIa – LINGUAGEM RECEPTIVA':    'Ling. Receptiva',
    'IIb – LINGUAGEM EXPRESSIVA':   'Ling. Expressiva',
    'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados Próprios',
    'IV- ÁREA COGNITIVA':           'Cognição',
    'V. ÁREA PSICOMOTORA':          'Psicomotora',
  }
  return map[area] ?? area
}

async function downloadChartPNG(container: HTMLElement | null, filename: string) {
  if (!container) return
  // Hide download buttons inside the container before capture
  const btns = container.querySelectorAll<HTMLElement>('button')
  btns.forEach(b => { b.style.visibility = 'hidden' })
  const h2c = (await import('html2canvas')).default
  const canvas = await h2c(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  btns.forEach(b => { b.style.visibility = '' })
  const a = document.createElement('a')
  a.download = filename + '.png'
  a.href = canvas.toDataURL('image/png')
  a.click()
}

export default function PortageResults({ hook, setView, auth, onBack }: Props) {
  const { current, getSiblingAssessments } = hook
  const [tab, setTab] = useState<'sintese' | 'graficos' | 'progressao' | 'prioridades' | 'relatorio'>('sintese')
  const [exportingWord, setExportingWord] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingHtml, setExportingHtml] = useState(false)
  const refLine = useRef<HTMLDivElement>(null)
  const refRadar = useRef<HTMLDivElement>(null)
  const refBar = useRef<HTMLDivElement>(null)
  const refProgMedia = useRef<HTMLDivElement>(null)
  const refProgArea = useRef<HTMLDivElement>(null)

  const dl = useCallback((ref: React.RefObject<HTMLDivElement | null>, name: string) => {
    downloadChartPNG(ref.current, name)
  }, [])

  if (!current) return null

  const results = AREAS.map(area => {
    const items = portageItems.filter(i => i.area === area)
    return calcAreaDevResult(area, items as PortageItem[], current.responses as Record<string, ResponseType>)
  })
  const media = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
  const chron = current.studentInfo.birthDate ? calcAgeMonths(current.studentInfo.birthDate) / 12 : null

  const naoItems = portageItems.filter(i => current.responses[i.id] === 'nao')
  const avItems  = portageItems.filter(i => current.responses[i.id] === 'as_vezes')

  const siblings = getSiblingAssessments(current.id)

  const handleExportWord = async () => {
    setExportingWord(true)
    try { await exportWord(current, results, media) } finally { setExportingWord(false) }
  }
  const handleExportPdf = async () => {
    setExportingPdf(true)
    try { await exportWordPdf(current, results, media) } finally { setExportingPdf(false) }
  }
  const handleExportHtml = async () => {
    setExportingHtml(true)
    try { await exportWordHtml(current, results, media) } finally { setExportingHtml(false) }
  }

  // ── dados para gráfico de linha (% aquisição por faixa × área) ──
  const lineData = BAND_SHORT.map((label, bi) => {
    const row: Record<string, number | string> = { label }
    results.forEach(r => {
      const g = r.groups.find(g => g.key === bi)
      row[areaShort(r.area)] = g ? g.pctAcertos : 0
    })
    return row
  })

  // ── dados para radar (idade desenv × área) ──
  const radarData = results.map(r => ({
    area: areaShort(r.area),
    'Idade desenv.': parseFloat(r.idadeDesenvAnos.toFixed(2)),
    ...(chron !== null ? { Cronológica: parseFloat(chron.toFixed(2)) } : {}),
  }))

  // ── dados para barras (aquisição % por área) ──
  const barData = results.map(r => ({
    area: areaShort(r.area),
    pct: Math.round((r.totalSim / r.totalItems) * 100),
    color: areaColor(r.area),
    label: r.idadeDesenvLabel,
  }))

  // ── progressão: ordenar avaliações por data ──
  const allAssessments = [...siblings].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt))

  const progData = allAssessments.map(ass => {
    const res = AREAS.map(area => {
      const items = portageItems.filter(i => i.area === area)
      return calcAreaDevResult(area, items as PortageItem[], ass.responses as Record<string, ResponseType>)
    })
    const m = res.reduce((s, r) => s + r.idadeDesenvAnos, 0) / res.length
    const row: Record<string, number | string> = { date: ass.studentInfo.date ?? '—', media: parseFloat(m.toFixed(2)) }
    res.forEach(r => { row[areaShort(r.area)] = parseFloat(r.idadeDesenvAnos.toFixed(2)) })
    return row
  })

  const tabs = [
    { k: 'sintese',     label: 'Síntese',                       Icon: ClipboardList },
    { k: 'graficos',    label: 'Gráficos',                       Icon: BarChart2 },
    { k: 'progressao',  label: 'Progressão',                     Icon: TrendingUp },
    { k: 'prioridades', label: `Prioridades (${naoItems.length + avItems.length})`, Icon: Flag },
    { k: 'relatorio',   label: 'Relatório',                      Icon: FileText },
  ] as const

  return (
    <div className="shell">
      {auth && <TopBar auth={auth} onLogoClick={onBack} right={
        <>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('questionnaire')}><ClipboardList size={14} /> Questionário</button>
          <button className="btn btn-subtle btn-sm" onClick={() => setView('pei')}><BookOpen size={14} /> PEI</button>
        </>
      } />}

      <div className="app-frame screen" style={{ padding: '20px 24px 64px' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => onBack ? onBack() : setView('dashboard')}>
          <ArrowLeft size={14} /> {current.studentInfo.name}
        </button>

        {/* headline strip */}
        <div className="card" style={{ overflow: 'hidden', marginBottom: 18 }}>
          <div className="result-strip" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 0 }}>
            <div style={{ background: 'var(--primary)', color: '#fff', padding: '18px 22px' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8, fontWeight: 600 }}>Idade desenvolvimental · média</div>
              <div className="mono" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.1, marginTop: 4 }}>
                {media.toFixed(2)}<span style={{ fontSize: 18, fontWeight: 400 }}> anos</span>
              </div>
              {chron !== null && (
                <div className="mono" style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
                  Cronológica {chron.toFixed(2)}a · defasagem {media - chron >= 0 ? '+' : ''}{(media - chron).toFixed(2)}a
                </div>
              )}
            </div>
            {[['Avaliação', current.studentInfo.date], ['Idade', current.studentInfo.age], ['Diagnóstico', current.studentInfo.diagnosis || '—']].map(([l, v]) => (
              <div key={l} style={{ padding: '18px 20px', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="micro" style={{ marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="seg" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.k} data-on={tab === t.k} onClick={() => setTab(t.k as typeof tab)}>
              <t.Icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── SÍNTESE ── */}
        {tab === 'sintese' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Desempenho por área e faixa etária</h3>
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 0 0' }}>% de aquisição · verde ≥ 75% · âmbar 50–74% · vermelho &lt; 50%</p>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr>
                    <th>Área</th>
                    {BAND_LABELS.map(b => <th key={b}>{b}</th>)}
                    <th>Idade desenv.</th>
                  </tr></thead>
                  <tbody>
                    {results.map(r => (
                      <tr key={r.area} style={areaVars(r.area) as React.CSSProperties}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, color: 'var(--a-text)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--a-solid)', flexShrink: 0 }} />
                            {r.area}
                          </span>
                        </td>
                        {BAND_LABELS.map((_, bi) => {
                          const g = r.groups.find(g => g.key === bi)
                          const p = g ? g.pctAcertos : 0
                          const col = pctColor(p)
                          return <td key={bi}>{g
                            ? <span className="mono" style={{ display: 'inline-block', minWidth: 40, padding: '3px 0', borderRadius: 6, fontWeight: 600, fontSize: 12, color: col.c, background: col.b }}>{p}%</span>
                            : <span className="skel">—</span>}
                          </td>
                        })}
                        <td><span className="mono" style={{ fontWeight: 600, color: 'var(--a-text)', padding: '3px 9px', borderRadius: 6, background: 'var(--a-bg)' }}>{r.idadeDesenvLabel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Detalhamento de respostas</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data">
                  <thead><tr>
                    <th>Área</th><th>Itens</th>
                    <th style={{ color: 'var(--pos)' }}>Sim</th>
                    <th style={{ color: 'var(--part)' }}>Às vezes</th>
                    <th style={{ color: 'var(--neg)' }}>Não</th>
                    <th>Pontos</th><th>% aquisição</th><th>Idade desenv.</th>
                  </tr></thead>
                  <tbody>
                    {results.map(r => {
                      const pct = Math.round((r.totalSim / r.totalItems) * 100)
                      const col = pctColor(pct)
                      return (
                        <tr key={r.area} style={areaVars(r.area) as React.CSSProperties}>
                          <td><span style={{ fontWeight: 600, color: 'var(--a-text)' }}>{r.area}</span></td>
                          <td className="mono" style={{ color: 'var(--ink-3)' }}>{r.totalItems}</td>
                          <td className="mono" style={{ fontWeight: 600, color: 'var(--pos)' }}>{r.totalSim}</td>
                          <td className="mono" style={{ color: 'var(--part)' }}>{r.totalAv}</td>
                          <td className="mono" style={{ color: 'var(--neg)' }}>{r.totalNao}</td>
                          <td className="mono" style={{ fontWeight: 600 }}>{r.totalPontos.toFixed(1)}</td>
                          <td><span className="mono" style={{ fontWeight: 600, color: col.c }}>{pct}%</span></td>
                          <td><span className="mono" style={{ fontWeight: 600, color: 'var(--a-text)' }}>{r.idadeDesenvLabel}</span></td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: 'var(--primary-bg)' }}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-ink)' }}>Média geral</td>
                      <td colSpan={6} />
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--primary-ink)' }}>{media.toFixed(2)} anos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* per-area bars */}
            <div className="card card-pad">
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px' }}>Aquisição por área</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                {results.map(r => {
                  const pct = Math.round((r.totalSim / r.totalItems) * 100)
                  const av = areaVars(r.area)
                  return (
                    <div key={r.area} style={av as React.CSSProperties}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: 'var(--a-text)' }}>{r.area}</span>
                        <span className="mono" style={{ color: 'var(--ink-3)' }}>{r.idadeDesenvLabel}</span>
                      </div>
                      <div style={{ height: 9, borderRadius: 99, background: 'var(--a-bg)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: pct + '%', borderRadius: 99, background: 'var(--a-solid)' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── GRÁFICOS ── */}
        {tab === 'graficos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* linha: % por faixa etária */}
            <div className="card card-pad" ref={refLine}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>% de aquisição por faixa etária</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => dl(refLine, `aquisicao-faixa-${current.studentInfo.name}`)}><Download size={13} /> PNG</button>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '0 0 16px' }}>Uma linha por área de desenvolvimento</p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => v + '%'} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                  <Tooltip formatter={(v) => String(v) + '%'} contentStyle={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  {AREAS.map(area => (
                    <Line
                      key={area}
                      type="monotone"
                      dataKey={areaShort(area)}
                      stroke={areaColor(area)}
                      strokeWidth={2}
                      dot={{ r: 4, strokeWidth: 0, fill: areaColor(area) }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* radar: perfil desenvolvimental */}
              <div className="card card-pad" ref={refRadar}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Perfil desenvolvimental</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => dl(refRadar, `perfil-${current.studentInfo.name}`)}><Download size={13} /> PNG</button>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '0 0 12px' }}>Idade desenv. (anos) vs. cronológica</p>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} margin={{ top: 0, right: 24, bottom: 0, left: 24 }}>
                    <PolarGrid stroke="var(--line)" />
                    <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: 'var(--ink-2)' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 7]} tick={{ fontSize: 9, fill: 'var(--ink-4)' }} tickCount={4} />
                    <Radar name="Idade desenv." dataKey="Idade desenv." stroke="hsl(214 56% 45%)" fill="hsl(214 56% 45%)" fillOpacity={0.18} strokeWidth={2} />
                    {chron !== null && (
                      <Radar name="Cronológica" dataKey="Cronológica" stroke="hsl(220 14% 65%)" fill="hsl(220 14% 65%)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
                    )}
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* barras: aquisição % por área */}
              <div className="card card-pad" ref={refBar}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Aquisição por área</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => dl(refBar, `aquisicao-area-${current.studentInfo.name}`)}><Download size={13} /> PNG</button>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '0 0 12px' }}>% de itens adquiridos (Sim)</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={v => v + '%'} tick={{ fontSize: 10, fill: 'var(--ink-3)' }} />
                    <YAxis type="category" dataKey="area" tick={{ fontSize: 10, fill: 'var(--ink-2)' }} width={96} />
                    <Tooltip formatter={(v) => String(v) + '%'} contentStyle={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 8 }} />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fill: 'var(--ink-3)' }}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── PROGRESSÃO ── */}
        {tab === 'progressao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {allAssessments.length < 2 ? (
              <div className="card" style={{ padding: 44, textAlign: 'center', color: 'var(--ink-3)' }}>
                <p style={{ fontSize: 28, margin: '0 0 10px' }}>📈</p>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 6px', color: 'var(--ink-2)' }}>Sem dados suficientes para progressão</p>
                <p style={{ fontSize: 13, margin: 0 }}>Realize pelo menos duas avaliações para este paciente para visualizar a evolução ao longo do tempo.</p>
              </div>
            ) : (
              <>
                {/* linha: média geral ao longo do tempo */}
                <div className="card card-pad" ref={refProgMedia}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Evolução da idade desenvolvimental — média geral</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => dl(refProgMedia, `progressao-media-${current.studentInfo.name}`)}><Download size={13} /> PNG</button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '0 0 16px' }}>{allAssessments.length} avaliações</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={progData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                      <YAxis domain={['auto', 'auto']} tickFormatter={v => v + 'a'} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                      <Tooltip formatter={(v) => Number(v).toFixed(2) + ' anos'} contentStyle={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="media" name="Média geral" stroke="hsl(214 56% 45%)" strokeWidth={2.5} dot={{ r: 5, strokeWidth: 0, fill: 'hsl(214 56% 45%)' }} activeDot={{ r: 7 }} />
                      {chron !== null && (
                        <Line type="monotone" dataKey={() => chron} name="Cronológica" stroke="hsl(220 14% 65%)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                      )}
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* linha: por área ao longo do tempo */}
                <div className="card card-pad" ref={refProgArea}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Evolução por área</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => dl(refProgArea, `progressao-areas-${current.studentInfo.name}`)}><Download size={13} /> PNG</button>
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '0 0 16px' }}>Idade desenvolvimental (anos) em cada avaliação</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={progData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                      <YAxis domain={['auto', 'auto']} tickFormatter={v => v + 'a'} tick={{ fontSize: 11, fill: 'var(--ink-3)' }} />
                      <Tooltip formatter={(v) => Number(v).toFixed(2) + ' anos'} contentStyle={{ fontSize: 12, border: '1px solid var(--line)', borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      {AREAS.map(area => (
                        <Line key={area} type="monotone" dataKey={areaShort(area)} stroke={areaColor(area)} strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 0, fill: areaColor(area) }} activeDot={{ r: 6 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* tabela comparativa */}
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Comparativo entre avaliações</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data">
                      <thead><tr>
                        <th>Área</th>
                        {allAssessments.map(a => <th key={a.id}>{a.studentInfo.date ?? '—'}</th>)}
                        <th>Δ total</th>
                      </tr></thead>
                      <tbody>
                        {AREAS.map(area => {
                          const vals = allAssessments.map(ass => {
                            const items = portageItems.filter(i => i.area === area)
                            const r = calcAreaDevResult(area, items as PortageItem[], ass.responses as Record<string, ResponseType>)
                            return r.idadeDesenvAnos
                          })
                          const delta = vals.length >= 2 ? vals[vals.length - 1] - vals[0] : null
                          return (
                            <tr key={area} style={areaVars(area) as React.CSSProperties}>
                              <td><span style={{ fontWeight: 600, color: 'var(--a-text)' }}>{areaShort(area)}</span></td>
                              {vals.map((v, i) => <td key={i} className="mono" style={{ fontWeight: 600 }}>{v.toFixed(2)}a</td>)}
                              <td>
                                {delta !== null && (
                                  <span className="mono" style={{ fontWeight: 700, color: delta > 0 ? 'var(--pos)' : delta < 0 ? 'var(--neg)' : 'var(--ink-3)' }}>
                                    {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta).toFixed(2)}a
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── PRIORIDADES ── */}
        {tab === 'prioridades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { title: 'Alta prioridade — não adquiridas', items: naoItems, color: 'var(--neg)' },
              { title: 'Em desenvolvimento — às vezes',    items: avItems,  color: 'var(--part)' },
            ].map(({ title, items, color }) => {
              if (!items.length) return null
              const grouped: Record<string, typeof items> = {}
              items.forEach(i => (grouped[i.area] = grouped[i.area] || []).push(i))
              return (
                <div key={title}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
                    <span className="micro" style={{ color }}>{title} · {items.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(grouped).map(([area, its]) => (
                      <div key={area} className="card" style={{ ...(areaVars(area) as React.CSSProperties), overflow: 'hidden' }}>
                        <div style={{ padding: '9px 14px', background: 'var(--a-bg)', fontSize: 12.5, fontWeight: 600, color: 'var(--a-text)' }}>{area}</div>
                        {its.map((item, idx) => (
                          <div key={item.id} style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: idx % 2 ? 'var(--surface-2)' : 'var(--surface)' }}>
                            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.45 }}>{formatQuestion(item.text)}</p>
                            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{item.age_range}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <button className="btn btn-primary" style={{ padding: 12 }} onClick={() => setView('pei')}>
              <BookOpen size={15} /> Elaborar PEI
            </button>
          </div>
        )}

        {/* ── RELATÓRIO ── */}
        {tab === 'relatorio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card card-pad">
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Exportar relatório completo</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 16px' }}>
                Gera documento Word com síntese, detalhamento por área, análise interpretativa, habilidades não adquiridas e seção de assinatura.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" style={{ padding: '11px 20px' }} onClick={handleExportPdf} disabled={exportingPdf}>
                  {exportingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                  Baixar PDF
                </button>
                <button className="btn btn-ghost" style={{ padding: '11px 20px' }} onClick={handleExportHtml} disabled={exportingHtml}>
                  {exportingHtml ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                  Baixar HTML
                </button>
                <button className="btn btn-primary" style={{ padding: '11px 20px' }} onClick={handleExportWord} disabled={exportingWord}>
                  {exportingWord ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                  Exportar Word
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
