import { useState } from 'react'
import { ArrowLeft, BarChart3, Plus, Trash2, FileDown, Loader2, BookOpen, Layers, Flag } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { formatQuestion } from '../utils/formatQuestion'
import { areaVars } from '../utils/areaDesign'
import TopBar from './TopBar'
import { exportPEI } from '../utils/exportPEI'
import type { PortageItem } from '../types'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth?: AuthHook; onBack?: () => void }

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  status: 'pendente' | 'em_andamento' | 'concluido'
  estrategias: string
}

const PRAZO = { curto: 'Curto prazo · 3 meses', medio: 'Médio prazo · 6 meses', longo: 'Longo prazo · 9–12 meses' }
const PRAZO_HUE = { curto: 24, medio: 214, longo: 280 }
const STATUS = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído' }
const STATUS_STYLE: Record<string, { c: string; b: string }> = {
  pendente: { c: 'var(--ink-2)', b: 'var(--surface-2)' },
  em_andamento: { c: 'var(--primary-ink)', b: 'var(--primary-bg)' },
  concluido: { c: 'var(--pos)', b: 'var(--pos-bg)' },
}

function defaultStrategy(area: string) {
  const s: Record<string, string> = {
    'I – ÁREA SOCIABILIZAÇÃO': 'Utilize situações naturais de brincadeira e rotina para estimular as habilidades sociais. Modele o comportamento esperado e ofereça feedback positivo imediato.',
    'II - ÁREA LINGUAGEM': 'Crie oportunidades comunicativas ao longo do dia. Use expansão de fala e modele estruturas mais complexas de forma natural e contextualizada.',
    'III – ÁREA CUIDADOS PRÓPRIOS': 'Divida a tarefa em etapas menores com apoio visual. Reduza gradualmente a ajuda física à medida que a criança ganha independência.',
    'IV- ÁREA COGNITIVA': 'Utilize materiais concretos e manipulativos. Apresente o conceito em contextos variados e reforce a generalização da habilidade.',
    'V. ÁREA PSICOMOTORA': 'Pratique em ambientes seguros e motivadores. Aumente gradualmente a complexidade do movimento conforme a criança demonstra domínio.',
  }
  return s[area] ?? 'Observe a criança em contexto natural. Ofereça apoio gradativo e reforce progressos.'
}

export default function PortagePEI({ hook, setView, auth, onBack }: Props) {
  const { current } = hook
  const [tab, setTab] = useState<'plano' | 'selecionar'>('selecionar')
  const [exportingWord, setExportingWord] = useState(false)

  const naoItems = portageItems.filter(i => current?.responses[i.id] === 'nao')
  const avItems = portageItems.filter(i => current?.responses[i.id] === 'as_vezes')

  const [plan, setPlan] = useState<PEIItem[]>(() => {
    const pick = (arr: PortageItem[], prazo: PEIItem['prazo'], n: number): PEIItem[] =>
      arr.slice(0, n).map((it, i) => ({
        id: it.id, skill: it.text, area: it.area, ageRange: it.age_range, prazo,
        status: i === 0 ? 'em_andamento' : 'pendente' as PEIItem['status'],
        estrategias: defaultStrategy(it.area),
      }))
    return [...pick(naoItems, 'curto', 3), ...pick(avItems, 'medio', 2)]
  })

  if (!current) return null

  const inPlan = (id: string) => plan.some(p => p.id === id)
  const add = (it: PortageItem, prazo: PEIItem['prazo']) => {
    if (inPlan(it.id)) return
    setPlan(p => [...p, { id: it.id, skill: it.text, area: it.area, ageRange: it.age_range, prazo, status: 'pendente', estrategias: defaultStrategy(it.area) }])
  }
  const remove = (id: string) => setPlan(p => p.filter(x => x.id !== id))
  const setStatus = (id: string, status: PEIItem['status']) => setPlan(p => p.map(x => x.id === id ? { ...x, status } : x))
  const setEstrategias = (id: string, estrategias: string) => setPlan(p => p.map(x => x.id === id ? { ...x, estrategias } : x))
  const [editingEst, setEditingEst] = useState<string | null>(null)

  const grouped: Record<string, PEIItem[]> = { curto: [], medio: [], longo: [] }
  plan.forEach(p => grouped[p.prazo].push(p))
  const done = plan.filter(p => p.status === 'concluido').length

  const handleExportWord = async () => {
    setExportingWord(true)
    try { await exportPEI(current, plan) } finally { setExportingWord(false) }
  }

  return (
    <div className="shell">
      {auth && <TopBar auth={auth} onLogoClick={onBack} right={
        <>
          <button className="btn btn-ghost btn-sm" onClick={() => setView('results')}><BarChart3 size={14} /> Resultados</button>
          <button className="btn btn-primary btn-sm" onClick={handleExportWord} disabled={exportingWord}>
            {exportingWord ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Exportar Word
          </button>
        </>
      } />}

      <div className="app-frame screen" style={{ padding: '20px 24px 64px' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => onBack ? onBack() : setView('dashboard')}>
          <ArrowLeft size={14} /> {current.studentInfo.name}
        </button>

        {/* header */}
        <div className="card card-pad" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <BookOpen size={21} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>Plano de Ensino Individualizado</h1>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: '2px 0 0' }}>
              {current.studentInfo.name} · {current.studentInfo.age} · {current.studentInfo.diagnosis || '—'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 22 }}>
            {[['Habilidades', plan.length, undefined], ['Concluídas', done, 'var(--pos)'], ['Progresso', plan.length ? Math.round(done / plan.length * 100) + '%' : '—', 'var(--primary-ink)']].map(([l, v, accent]) => (
              <div key={l as string}>
                <div className="micro" style={{ marginBottom: 4 }}>{l}</div>
                <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: (accent as string) || 'var(--ink)', lineHeight: 1.1 }}>{String(v)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="seg" style={{ marginBottom: 20 }}>
          <button data-on={tab === 'selecionar'} onClick={() => setTab('selecionar')}>
            <Flag size={14} /> Selecionar habilidades
          </button>
          <button data-on={tab === 'plano'} onClick={() => setTab('plano')}>
            <Layers size={14} /> Plano <span className="chip" style={{ padding: '1px 7px', marginLeft: 2 }}>{plan.length}</span>
          </button>
        </div>

        {/* plano tab */}
        {tab === 'plano' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {plan.length === 0 && (
              <div className="card" style={{ padding: 44, textAlign: 'center', color: 'var(--ink-3)' }}>
                <p style={{ fontSize: 13.5, margin: '0 0 10px' }}>Nenhuma habilidade no plano ainda.</p>
                <button className="btn btn-subtle btn-sm" onClick={() => setTab('selecionar')}>Selecionar habilidades →</button>
              </div>
            )}
            {(['curto', 'medio', 'longo'] as const).map(prazo => {
              const items = grouped[prazo]; if (!items.length) return null
              const h = PRAZO_HUE[prazo]
              return (
                <div key={prazo}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: `hsl(${h} 48% 38%)`, background: `hsl(${h} 55% 96%)`, border: `1px solid hsl(${h} 45% 88%)` }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: `hsl(${h} 46% 47%)` }} />
                    {PRAZO[prazo]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                      <div key={item.id} className="card card-pad" style={areaVars(item.area) as React.CSSProperties}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 5px', lineHeight: 1.45 }}>{formatQuestion(item.skill)}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span className="tag" style={{ background: 'var(--a-bg)', color: 'var(--a-text)' }}>{item.area}</span>
                              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{item.ageRange}</span>
                            </div>
                          </div>
                          <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', alignSelf: 'flex-start', cursor: 'pointer' }}><Trash2 size={15} /></button>
                        </div>
                        <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--surface-2)', border: '1px solid ' + (editingEst === item.id ? 'var(--primary)' : 'var(--line)'), borderRadius: 'var(--r-sm)', boxShadow: editingEst === item.id ? '0 0 0 3px var(--primary-bg)' : 'none', transition: 'border .14s, box-shadow .14s' }}>
                          <div className="micro" style={{ marginBottom: 4 }}>Estratégias de intervenção <span style={{ color: 'var(--ink-4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>— clique para editar</span></div>
                          {editingEst === item.id ? (
                            <textarea
                              autoFocus
                              value={item.estrategias}
                              onChange={e => setEstrategias(item.id, e.target.value)}
                              onBlur={() => setEditingEst(null)}
                              style={{ width: '100%', minHeight: 72, fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.5, background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', padding: 0, fontFamily: 'inherit' }}
                            />
                          ) : (
                            <p
                              onClick={() => setEditingEst(item.id)}
                              style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5, cursor: 'text' }}
                            >{item.estrategias}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 11 }}>
                          {(['pendente', 'em_andamento', 'concluido'] as const).map(s => {
                            const on = item.status === s; const st = STATUS_STYLE[s]
                            return (
                              <button key={s} onClick={() => setStatus(item.id, s)} style={{
                                fontSize: 11.5, fontWeight: 600, padding: '4px 11px', borderRadius: 99, cursor: 'pointer',
                                border: '1px solid ' + (on ? st.c : 'var(--line-2)'),
                                background: on ? st.b : 'var(--surface)', color: on ? st.c : 'var(--ink-4)',
                              }}>{STATUS[s]}</button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {plan.length > 0 && (
              <button className="btn btn-primary" style={{ padding: 13 }} onClick={handleExportWord} disabled={exportingWord}>
                {exportingWord ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Exportar PEI em Word
              </button>
            )}
          </div>
        )}

        {/* selecionar tab */}
        {tab === 'selecionar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {[
              { title: 'Alta prioridade — não adquiridas', items: naoItems, color: 'var(--neg)', prazo: 'curto' as const },
              { title: 'Em desenvolvimento — às vezes', items: avItems, color: 'var(--part)', prazo: 'medio' as const },
            ].map(({ title, items, color, prazo }) => {
              if (!items.length) return null
              return (
                <div key={title}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />
                    <span className="micro" style={{ color }}>{title} · {items.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(it => {
                      const added = inPlan(it.id)
                      return (
                        <div key={it.id} className="card" style={{ ...(areaVars(it.area) as React.CSSProperties), padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderColor: added ? 'var(--a-line)' : 'var(--line)' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, margin: '0 0 4px', lineHeight: 1.45 }}>{formatQuestion(it.text)}</p>
                            <span className="chip" style={{ fontSize: 11 }}>{it.area} · {it.age_range}</span>
                          </div>
                          <button
                            className={added ? 'btn btn-ghost btn-sm' : 'btn btn-subtle btn-sm'}
                            onClick={() => added ? remove(it.id) : add(it, prazo)}
                          >
                            {added ? <><Trash2 size={13} /> Remover</> : <><Plus size={13} /> Adicionar</>}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
