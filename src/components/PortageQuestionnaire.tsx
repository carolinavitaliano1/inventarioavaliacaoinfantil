import { useState, useMemo } from 'react'
import { ArrowLeft, BarChart3, CheckCircle, XCircle, MinusCircle, Circle, Info } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS } from '../types'
import type { ResponseType } from '../types'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { formatQuestion } from '../utils/formatQuestion'
import { getEvaluationTip } from '../utils/getEvaluationTip'
import { areaVars, AREA_NUM } from '../utils/areaDesign'
import TopBar from './TopBar'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth?: AuthHook; onBack?: () => void }

const RESP = {
  sim:      { label: 'Sim',      icon: CheckCircle,  color: 'var(--pos)',  bg: 'var(--pos-bg)' },
  nao:      { label: 'Não',      icon: XCircle,      color: 'var(--neg)',  bg: 'var(--neg-bg)' },
  as_vezes: { label: 'Às vezes', icon: MinusCircle,  color: 'var(--part)', bg: 'var(--part-bg)' },
}


export default function PortageQuestionnaire({ hook, setView, auth, onBack }: Props) {
  const { current, updateResponse: setResponse } = hook
  const responses = current?.responses ?? {}
  const [openAreas, setOpenAreas] = useState<Set<string>>(() => new Set([AREAS[0]]))
  const [openBands, setOpenBands] = useState<Set<string>>(() => new Set())
  const [tipFor, setTipFor] = useState<string | null>(null)

  const answered = useMemo(() => Object.values(responses).filter(Boolean).length, [responses])
  const progress = Math.round((answered / portageItems.length) * 100)

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, key: string) => {
    const n = new Set(set); n.has(key) ? n.delete(key) : n.add(key); setSet(n)
  }

  const setR = (id: string, v: ResponseType) => {
    const current_val = responses[id]
    setResponse(id, current_val === v ? null : v)
  }

  const markAll = (v: ResponseType) => {
    hook.batchUpdateResponses(portageItems.map(i => i.id), v)
  }

  if (!current) return null

  return (
    <div className="shell">
      {auth && <TopBar auth={auth} onLogoClick={onBack} right={
        <button className="btn btn-subtle btn-sm" onClick={() => setView('results')}>
          <BarChart3 size={14} /> Resultados
        </button>
      } />}

      <div className="app-frame screen" style={{ padding: '20px 24px 64px', maxWidth: 920 }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => onBack ? onBack() : setView('dashboard')}>
          <ArrowLeft size={14} /> {current.studentInfo.name}
        </button>

        {/* progress card */}
        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>Progresso da avaliação</span>
            <span className="mono" style={{ fontWeight: 600, color: 'var(--primary-ink)' }}>{progress}%</span>
          </div>
          <div className="bar"><i style={{ width: progress + '%' }} /></div>
          <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12.5 }}>
            {(['sim', 'as_vezes', 'nao'] as ResponseType[]).filter(Boolean).map(k => {
              const r = RESP[k as keyof typeof RESP]
              return (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: r.color }} />
                  {r.label}: <b className="mono">{portageItems.filter(i => responses[i.id] === k).length}</b>
                </span>
              )
            })}
          </div>
        </div>

        {/* mark-all toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Marcar todos:</span>
          {(['sim', 'as_vezes', 'nao'] as ResponseType[]).filter(Boolean).map(k => {
            const r = RESP[k as keyof typeof RESP]
            return (
              <button key={k} className="btn btn-sm" onClick={() => markAll(k)} style={{ background: r.bg, color: r.color, border: '1px solid transparent' }}>
                <r.icon size={14} /> {r.label}
              </button>
            )
          })}
        </div>

        {/* areas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {AREAS.map(area => {
            const av = areaVars(area)
            const aItems = portageItems.filter(i => i.area === area)
            const ans = aItems.filter(i => responses[i.id]).length
            const isOpen = openAreas.has(area)
            const bands = [...new Set(aItems.map(i => i.age_range))].sort()
            return (
              <div key={area} className="card" style={{ ...(av as React.CSSProperties), overflow: 'hidden', borderColor: 'var(--a-line)' }}>
                <button
                  onClick={() => toggle(openAreas, setOpenAreas, area)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 16px', background: 'var(--a-bg)', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--a-solid)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }} className="mono">
                      {AREA_NUM[area] ?? '?'}
                    </span>
                    <span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--a-text)' }}>{area}</span>
                      <span className="mono" style={{ display: 'block', fontSize: 11, color: 'var(--ink-3)' }}>{ans}/{aItems.length} respondidos</span>
                    </span>
                  </span>
                  <span style={{ color: 'var(--a-strong)', fontSize: 18 }}>{isOpen ? '▾' : '▸'}</span>
                </button>

                {isOpen && bands.map(band => {
                  const bItems = aItems.filter(i => i.age_range === band)
                  const bKey = area + '__' + band
                  const bOpen = openBands.has(bKey)
                  const bAns = bItems.filter(i => responses[i.id]).length
                  // bandIdx unused
                  return (
                    <div key={band}>
                      <button
                        onClick={() => toggle(openBands, setOpenBands, bKey)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface-2)', border: 'none', borderTop: '1px solid var(--line)', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{bOpen ? '▾' : '▸'}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{band}</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>({bAns}/{bItems.length})</span>
                      </button>
                      {bOpen && bItems.map((item, idx) => (
                        <div key={item.id} style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', background: idx % 2 ? 'var(--surface-2)' : 'var(--surface)' }}>
                          <p style={{ fontSize: 13.5, margin: '0 0 9px', lineHeight: 1.45 }}>{formatQuestion(item.text)}</p>
                          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                            {(['sim', 'as_vezes', 'nao'] as ResponseType[]).filter(Boolean).map(k => {
                              const r = RESP[k as keyof typeof RESP]
                              const on = responses[item.id] === k
                              const Icon = r.icon
                              return (
                                <button
                                  key={k}
                                  onClick={() => setR(item.id, k)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
                                    padding: '5px 11px', borderRadius: 99, cursor: 'pointer',
                                    border: '1px solid ' + (on ? r.color : 'var(--line-2)'),
                                    background: on ? r.color : 'var(--surface)', color: on ? '#fff' : 'var(--ink-3)',
                                    transition: 'all .12s',
                                  }}
                                >
                                  {on ? <Icon size={13} /> : <Circle size={13} />}
                                  {r.label}
                                </button>
                              )
                            })}
                            <button
                              onClick={() => setTipFor(tipFor === item.id ? null : item.id)}
                              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--primary-ink)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              <Info size={13} /> Como avaliar
                            </button>
                          </div>
                          {tipFor === item.id && (
                            <div style={{ marginTop: 9, padding: '10px 12px', background: 'var(--primary-bg)', border: '1px solid var(--primary-line)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--primary-ink)', lineHeight: 1.5 }}>
                              {getEvaluationTip(item as any)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: 13, marginTop: 20 }} onClick={() => setView('results')}>
          Ver resultados <BarChart3 size={15} />
        </button>
      </div>
    </div>
  )
}
