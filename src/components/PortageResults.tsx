import { useState } from 'react'
import { ArrowLeft, ClipboardList, BookOpen, Flag, FileText, Loader2 } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS } from '../types'
import type { PortageItem, ResponseType } from '../types'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { calcAreaDevResult, calcAgeMonths } from '../utils/ageCalc'
import { exportWord } from '../utils/exportWord'
import { formatQuestion } from '../utils/formatQuestion'
import { areaVars } from '../utils/areaDesign'
import TopBar from './TopBar'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth?: AuthHook; onBack?: () => void }

const BAND_LABELS = ['0–1 ano', '1–2 anos', '2–3 anos', '3–4 anos', '4–5 anos', '5–6 anos']

function pctColor(p: number) {
  if (p >= 75) return { c: 'var(--pos)', b: 'var(--pos-bg)' }
  if (p >= 50) return { c: 'var(--part)', b: 'var(--part-bg)' }
  if (p > 0) return { c: 'var(--neg)', b: 'var(--neg-bg)' }
  return { c: 'var(--ink-4)', b: 'var(--surface-2)' }
}

export default function PortageResults({ hook, setView, auth, onBack }: Props) {
  const { current } = hook
  const [tab, setTab] = useState<'sintese' | 'prioridades' | 'relatorio'>('sintese')
  const [exportingWord, setExportingWord] = useState(false)

  if (!current) return null

  const results = AREAS.map(area => {
    const items = portageItems.filter(i => i.area === area)
    return calcAreaDevResult(area, items as PortageItem[], current.responses as Record<string, ResponseType>)
  })
  const media = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
  const chron = current.studentInfo.birthDate ? calcAgeMonths(current.studentInfo.birthDate) / 12 : null

  const naoItems = portageItems.filter(i => current.responses[i.id] === 'nao')
  const avItems = portageItems.filter(i => current.responses[i.id] === 'as_vezes')

  const handleExportWord = async () => {
    setExportingWord(true)
    try { await exportWord(current, results, media) } finally { setExportingWord(false) }
  }

  const tabs = [
    { k: 'sintese', label: 'Síntese', Icon: ClipboardList },
    { k: 'prioridades', label: `Prioridades (${naoItems.length + avItems.length})`, Icon: Flag },
    { k: 'relatorio', label: 'Relatório', Icon: FileText },
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
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 0 }}>
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

        {/* síntese tab */}
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

        {/* prioridades tab */}
        {tab === 'prioridades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { title: 'Alta prioridade — não adquiridas', items: naoItems, color: 'var(--neg)' },
              { title: 'Em desenvolvimento — às vezes', items: avItems, color: 'var(--part)' },
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

        {/* relatório tab */}
        {tab === 'relatorio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card card-pad">
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Exportar relatório completo</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '0 0 16px' }}>
                Gera documento Word com síntese, detalhamento por área, análise interpretativa, habilidades não adquiridas e seção de assinatura.
              </p>
              <button className="btn btn-primary" style={{ padding: '11px 20px' }} onClick={handleExportWord} disabled={exportingWord}>
                {exportingWord ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
                Exportar Relatório em Word
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
