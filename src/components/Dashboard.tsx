import { useState, useEffect, useRef } from 'react'
import { Plus, Megaphone, Trash2, Loader2, Camera, X, ChevronRight, BookMarked, Search, Users, ClipboardList, TrendingUp, Calendar, MessageSquare, UserCircle } from 'lucide-react'
import AppFooter from './AppFooter'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { portageItems } from '../hooks/usePortageAssessment'
import type { PatientsHook } from '../hooks/usePatients'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { calcAge, calcAreaDevResult } from '../utils/ageCalc'
import { AREAS } from '../types'
import type { PortageItem, ResponseType } from '../types'
import TopBar from './TopBar'

type AuthHook = ReturnType<typeof useAuth>
interface Props {
  hook: AssessmentHook
  setView?: (v: View) => void
  auth: AuthHook
  patientsHook: PatientsHook
  onOpenPatient: (id: string) => void
}

interface Announcement { id: string; title: string; body: string; created_at: string; created_by: string }

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'
const BLANK = { name: '', birthDate: '', diagnosis: '', responsibleName: '', photoBase64: '' }

function calcMediaGeral(responses: Record<string, string>): number | null {
  const results = AREAS.map(area => {
    const items = portageItems.filter(p => p.area === area)
    return calcAreaDevResult(area, items as PortageItem[], responses as Record<string, ResponseType>)
  })
  if (results.every(r => r.totalItems === 0)) return null
  return results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
}

function formatDevAge(years: number) {
  const a = Math.floor(years)
  const m = Math.round((years - a) * 12)
  return `${a}a ${m}m`
}

export default function Dashboard({ hook, auth, patientsHook, onOpenPatient, setView }: Props) {
  const { assessments } = hook
  const { patients, loading: loadingPatients, createPatient, deletePatient } = patientsHook
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnn, setLoadingAnn] = useState(true)
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [savingAnn, setSavingAnn] = useState(false)
  const [showRefs, setShowRefs] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const isAdmin = auth.user?.email === ADMIN_EMAIL

  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoadingAnn(false) })
  }, [])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photoBase64: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleCreate = async () => {
    if (!form.name.trim() || creating) return
    setCreating(true)
    try {
      await createPatient({ name: form.name.trim(), birthDate: form.birthDate, diagnosis: form.diagnosis.trim(), responsibleName: form.responsibleName.trim(), photoBase64: form.photoBase64 || undefined })
      setForm(BLANK); setShowForm(false)
    } finally {
      setCreating(false)
    }
  }

  const handleSaveAnn = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setSavingAnn(true)
    const { data, error } = await supabase.from('announcements').insert({ title: newTitle.trim(), body: newBody.trim(), created_by: auth.user!.id }).select().single()
    setSavingAnn(false)
    if (!error && data) { setAnnouncements(p => [data, ...p]); setNewTitle(''); setNewBody(''); setShowAnnForm(false) }
  }

  const handleDeleteAnn = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(p => p.filter(a => a.id !== id))
  }

  const patientAssessmentCount = (pid: string) => assessments.filter(a => a.childId === pid).length

  const lastAssessmentDate = (pid: string) => {
    const list = assessments.filter(a => a.childId === pid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return list[0]?.studentInfo.date ?? null
  }

  const patientDevAge = (pid: string): { text: string; value: number } | null => {
    const list = assessments.filter(a => a.childId === pid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (!list[0]) return null
    const media = calcMediaGeral(list[0].responses as Record<string, string>)
    if (media === null) return null
    return { text: formatDevAge(media), value: media }
  }

  // Stats
  const now = new Date()
  const thisMonthCount = assessments.filter(a => {
    const d = new Date(a.updatedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="shell">
      <TopBar auth={auth} onLogoClick={() => {}} right={
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView?.('community')}>
            <MessageSquare size={14} /> Comunidade
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setView?.('profile')}>
            <UserCircle size={14} /> Perfil
          </button>
        </div>
      } />

      <div className="app-frame screen" style={{ padding: '28px 24px 64px' }}>
        {/* page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Painel clínico</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: 0 }}>Acompanhe avaliações e a evolução de cada criança.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <Plus size={15} /> Novo paciente
          </button>
        </div>

        {/* stat cards */}
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
          {[
            { l: 'Pacientes ativos', v: patients.length, Icon: Users },
            { l: 'Avaliações registradas', v: assessments.length, Icon: ClipboardList },
            { l: 'Em acompanhamento', v: patients.filter(p => patientAssessmentCount(p.id) >= 2).length, Icon: TrendingUp },
            { l: 'Avaliados este mês', v: thisMonthCount, Icon: Calendar },
          ].map(s => (
            <div key={s.l} className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <s.Icon size={18} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>{s.v}</div>
                <div className="micro" style={{ marginTop: 4 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>

        {/* announcements */}
        {loadingAnn && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>}
        {!loadingAnn && (announcements.length > 0 || isAdmin) && (
          <div className="card" style={{ borderColor: 'var(--primary-line)', background: 'var(--primary-bg)', padding: '13px 16px', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: announcements.length > 0 || showAnnForm ? 10 : 0 }}>
              <Megaphone size={15} style={{ color: 'var(--primary-ink)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-ink)', flex: 1 }}>Avisos</span>
              {isAdmin && (
                <button className="btn btn-subtle btn-sm" onClick={() => setShowAnnForm(s => !s)}>
                  <Plus size={13} /> Novo
                </button>
              )}
            </div>
            {showAnnForm && isAdmin && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, paddingTop: 10, borderTop: '1px solid var(--primary-line)' }}>
                <input className="field" placeholder="Título" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <textarea className="field" rows={2} placeholder="Texto…" value={newBody} onChange={e => setNewBody(e.target.value)} style={{ resize: 'none' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveAnn} disabled={savingAnn}>
                    {savingAnn && <Loader2 size={12} className="animate-spin" />} Publicar
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAnnForm(false)}>Cancelar</button>
                </div>
              </div>
            )}
            {announcements.length === 0 && <p style={{ fontSize: 12, color: 'var(--primary-ink)', opacity: 0.7 }}>Nenhum aviso no momento.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {announcements.map(ann => (
                <div key={ann.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{ann.title}</p>
                    <p style={{ fontSize: 12.5, color: 'var(--ink-2)', margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{ann.body}</p>
                    <p style={{ fontSize: 11, color: 'var(--ink-4)', margin: '2px 0 0' }}>{new Date(ann.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDeleteAnn(ann.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', padding: 4, cursor: 'pointer' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* new patient form */}
        {showForm && (
          <div className="card card-pad" style={{ marginBottom: 22, borderColor: 'var(--primary-line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 600, margin: 0 }}>Cadastrar paciente</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div
                onClick={() => photoRef.current?.click()}
                style={{ width: 72, height: 72, borderRadius: 12, border: '1.5px dashed var(--line-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)', flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}
              >
                {form.photoBase64 ? <img src={form.photoBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={22} />}
              </div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Nome completo *', 'name', 'Nome da criança'], ['Responsável', 'responsibleName', 'Nome do responsável'], ['Diagnóstico', 'diagnosis', 'Ex.: TEA, Síndrome de Down…']].map(([l, k, ph]) => (
                  <div key={k}>
                    <div className="label" style={{ marginBottom: 5 }}>{l}</div>
                    <input className="field" placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <div className="label" style={{ marginBottom: 5 }}>Data de nascimento</div>
                  <input className="field" type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating}><Plus size={15} /> Cadastrar</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {/* patient list */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            Pacientes <span className="chip" style={{ marginLeft: 4 }}>{patients.length}</span>
          </h2>
          <div style={{ flex: 1 }} />
          <div className="search-bar" style={{ position: 'relative', width: 260, maxWidth: '46vw' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'flex' }}><Search size={15} /></span>
            <input className="field" style={{ paddingLeft: 33 }} placeholder="Buscar paciente…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loadingPatients ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
            <p style={{ fontSize: 13.5, margin: 0 }}>Carregando pacientes…</p>
          </div>
        ) : patients.length === 0 && !showForm ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
            <Users size={40} style={{ margin: '0 auto 12px', color: 'var(--ink-4)' }} />
            <p style={{ fontSize: 13.5, margin: '0 0 12px' }}>Nenhum paciente cadastrado ainda.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={14} /> Cadastrar primeiro paciente</button>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.9fr 40px', gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', minWidth: 520 }}>
              {['Paciente', 'Idade desenv. (média)', 'Última avaliação', 'Avaliações', ''].map((h, i) => (
                <div key={i} className="micro" style={{ textAlign: i >= 3 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13.5 }}>Nenhum paciente encontrado.</div>
            )}

            {filtered.map((p, idx) => {
              const dev = patientDevAge(p.id)
              const chronYears = p.birthDate ? (() => {
                const b = new Date(p.birthDate); const n = new Date()
                return (n.getFullYear() - b.getFullYear()) + (n.getMonth() - b.getMonth()) / 12
              })() : null
              const gap = dev && chronYears !== null ? dev.value - chronYears : null
              const age = p.birthDate ? calcAge(p.birthDate) : null
              const count = patientAssessmentCount(p.id)
              const lastDate = lastAssessmentDate(p.id)
              const initials = p.name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenPatient(p.id)}
                  style={{
                    display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 0.9fr 40px', gap: 12, padding: '14px 18px',
                    alignItems: 'center', cursor: 'pointer', borderBottom: idx < filtered.length - 1 ? '1px solid var(--line)' : 'none',
                    transition: 'background .1s', minWidth: 520,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center',
                      fontWeight: 600, fontSize: 14, color: 'hsl(214 45% 38%)', background: 'hsl(214 48% 95%)', border: '1px solid hsl(214 42% 88%)', overflow: 'hidden',
                    }}>
                      {p.photoBase64 ? <img src={p.photoBase64} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 6 }}>
                        {age && <span>{age}</span>}
                        {p.diagnosis && <><span>·</span><span style={{ color: 'var(--ink-2)' }}>{p.diagnosis}</span></>}
                      </div>
                    </div>
                  </div>

                  <div>
                    {dev ? <>
                      <span className="mono" style={{ fontWeight: 600, fontSize: 13.5 }}>{dev.text}</span>
                      {gap !== null && (
                        <span className="mono" style={{ fontSize: 11.5, marginLeft: 6, color: gap >= -0.25 ? 'var(--pos)' : 'var(--neg)' }}>
                          {gap >= 0 ? '+' : ''}{gap.toFixed(1)}a
                        </span>
                      )}
                    </> : <span className="skel" style={{ fontSize: 12.5 }}>—</span>}
                  </div>

                  <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{lastDate || '—'}</div>

                  <div style={{ textAlign: 'center' }}>
                    <span className="chip" style={{ background: 'var(--primary-bg)', color: 'var(--primary-ink)', borderColor: 'var(--primary-line)' }}>{count}</span>
                  </div>

                  <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <button
                      onClick={async e => { e.stopPropagation(); if (window.confirm(`Excluir ${p.name}?`)) await deletePatient(p.id) }}
                      style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer', padding: 2 }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={16} style={{ color: 'var(--ink-4)' }} />
                  </div>
                </div>
              )
            })}
            </div>{/* end overflow-x auto */}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--ink-3)' }} onClick={() => setShowRefs(r => !r)}>
            <BookMarked size={14} /> Referências bibliográficas
          </button>
          {showRefs && (
            <div className="card card-pad" style={{ marginTop: 12, textAlign: 'left', fontSize: 12.5, color: 'var(--ink-2)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Referências Bibliográficas</h3>
              <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
                <li>Bluma, S. et al. (1976). CESA 12, Wisconsin.</li>
                <li>Shearer, D. E., & Shearer, M. S. (1972). <em>Exceptional Children</em>, 36(3), 210–217.</li>
                <li>Williams, L. C. A., & Aiello, A. L. R. (2001). São Paulo: Memnon.</li>
                <li>Neisworth, J. T., & Bagnato, S. J. (2004). <em>Infants & Young Children</em>, 17(3), 198–212.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
