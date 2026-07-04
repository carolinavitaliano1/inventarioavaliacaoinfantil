import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Eye, BarChart3, BookOpen, RefreshCw, Trash2, FileDown, Loader2, TrendingUp, TrendingDown, Minus, Camera, Edit2, Save, X } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { PatientsHook } from '../hooks/usePatients'
import type { Patient, PortageItem, ResponseType } from '../types'
import { AREAS } from '../types'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { calcAge, calcAreaDevResult, calcAgeMonths } from '../utils/ageCalc'
import { exportProgressReport } from '../utils/exportProgressReport'
import { exportProgressHtml, exportProgressPdf } from '../utils/exportProgressReport_html'
import TopBar from './TopBar'

type AuthHook = ReturnType<typeof useAuth>
interface Props {
  patientId: string
  patientsHook: PatientsHook
  assessmentHook: AssessmentHook
  setView: (v: View) => void
  onBack: () => void
  onPatientNotFound?: () => void
  auth?: AuthHook
}

function getAreaResults(responses: Record<string, ResponseType>) {
  return AREAS.map(area => {
    const items = portageItems.filter(i => i.area === area)
    return calcAreaDevResult(area, items as PortageItem[], responses)
  })
}

function formatDevAge(years: number) {
  const a = Math.floor(years); const m = Math.round((years - a) * 12)
  return `${a}a ${m}m`
}

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO':      'Social',
  'IIa – LINGUAGEM RECEPTIVA':    'Ling. Rec.',
  'IIb – LINGUAGEM EXPRESSIVA':   'Ling. Exp.',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados',
  'IV- ÁREA COGNITIVA':           'Cognitiva',
  'V. ÁREA PSICOMOTORA':          'Psicomotora',
}

export default function PatientDetail({ patientId, patientsHook, assessmentHook, setView, onBack, onPatientNotFound, auth }: Props) {
  const { getPatient, updatePatient } = patientsHook
  const { assessments, createAssessment, reAssess, deleteAssessment, setCurrentId } = assessmentHook
  const [tab, setTab] = useState<'assessments' | 'progress'>('assessments')
  const [exporting, setExporting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingHtml, setExportingHtml] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Patient>>({})
  const [photoInput, setPhotoInput] = useState<HTMLInputElement | null>(null)

  const patient = getPatient(patientId)
  useEffect(() => { if (!patient) onPatientNotFound?.() }, [patient]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!patient) return null

  const patientAssessments = assessments
    .filter(a => a.childId === patientId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const chronYears = patient.birthDate ? calcAgeMonths(patient.birthDate) / 12 : null

  const latestResults = patientAssessments.length
    ? getAreaResults(patientAssessments[patientAssessments.length - 1].responses as Record<string, ResponseType>)
    : null
  const latestDev = latestResults
    ? latestResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / latestResults.length
    : null

  const handleNewAssessment = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    createAssessment({ name: patient.name, birthDate: patient.birthDate, diagnosis: patient.diagnosis, age: patient.birthDate ? calcAge(patient.birthDate) : '', date: today }, patientId)
    setView('questionnaire')
  }

  // setCurrentId + setView in the same event: state is batched, so hook.current
  // is still stale when setView runs. App.tsx's safeSetView uses pendingNav to
  // defer navigation until hook.currentId updates on next render.
  const open = (id: string, v: View) => { setCurrentId(id); setView(v) }

  const handleExport = async () => {
    setExporting(true)
    try { await exportProgressReport(patient, patientAssessments) } finally { setExporting(false) }
  }
  const handleExportPdf = async () => {
    setExportingPdf(true)
    try { await exportProgressPdf(patient, patientAssessments) } finally { setExportingPdf(false) }
  }
  const handleExportHtml = async () => {
    setExportingHtml(true)
    try { exportProgressHtml(patient, patientAssessments) } finally { setExportingHtml(false) }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setEditForm(f => ({ ...f, photoBase64: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const saveEdit = async () => { await updatePatient(patientId, editForm); setEditMode(false); setEditForm({}) }

  const progressData = patientAssessments.map(a => ({
    assessment: a,
    areaResults: getAreaResults(a.responses as Record<string, ResponseType>),
  }))

  const age = patient.birthDate ? calcAge(patient.birthDate) : null
  const displayPhoto = editMode ? (editForm.photoBase64 ?? patient.photoBase64) : patient.photoBase64
  const initials = patient.name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()

  return (
    <div className="shell">
      {auth && <TopBar auth={auth} onLogoClick={onBack} right={
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-subtle btn-sm" onClick={handleExportPdf} disabled={exportingPdf || patientAssessments.length === 0}>
            {exportingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} PDF
          </button>
          <button className="btn btn-subtle btn-sm" onClick={handleExportHtml} disabled={exportingHtml || patientAssessments.length === 0}>
            {exportingHtml ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} HTML
          </button>
          <button className="btn btn-subtle btn-sm" onClick={handleExport} disabled={exporting || patientAssessments.length === 0}>
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} Word
          </button>
        </div>
      } />}

      <div className="app-frame screen" style={{ padding: '22px 24px 64px' }}>
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={onBack}>
          <ArrowLeft size={14} /> Pacientes
        </button>

        {/* patient header card */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div onClick={() => photoInput?.click()} style={{ width: 62, height: 62, borderRadius: 11, background: 'var(--surface-2)', border: '1.5px dashed var(--line-2)', display: 'grid', placeItems: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
                  {displayPhoto ? <img src={displayPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={20} style={{ color: 'var(--ink-4)' }} />}
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} ref={el => setPhotoInput(el)} onChange={handlePhotoChange} />
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
                  {[['Nome', 'name', patient.name], ['Responsável', 'responsibleName', patient.responsibleName ?? ''], ['Diagnóstico', 'diagnosis', patient.diagnosis ?? '']].map(([l, k, ph]) => (
                    <div key={k}>
                      <div className="label" style={{ marginBottom: 4 }}>{l}</div>
                      <input className="field" placeholder={ph} value={(editForm as any)[k] ?? (patient as any)[k] ?? ''} onChange={e => setEditForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>Data de nascimento</div>
                    <input className="field" type="date" value={editForm.birthDate ?? patient.birthDate ?? ''} onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveEdit}><Save size={13} /> Salvar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditMode(false); setEditForm({}) }}><X size={13} /> Cancelar</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 62, height: 62, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, color: 'hsl(214 45% 38%)', background: 'hsl(214 48% 95%)', border: '1px solid hsl(214 42% 88%)', overflow: 'hidden' }}>
                {patient.photoBase64 ? <img src={patient.photoBase64} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 21, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>{patient.name}</h1>
                  {patient.diagnosis && <span className="chip">{patient.diagnosis}</span>}
                  <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', color: 'var(--ink-4)', padding: 0, cursor: 'pointer' }}><Edit2 size={14} /></button>
                </div>
                <div style={{ display: 'flex', gap: 22, marginTop: 10, flexWrap: 'wrap' }}>
                  {[['Idade cronológica', age], ['Nascimento', patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : null], ['Responsável', patient.responsibleName]].filter(([, v]) => v).map(([l, v]) => (
                    <div key={l as string}>
                      <div className="micro" style={{ marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
              {latestDev !== null && latestDev !== undefined && (
                <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 20, textAlign: 'right' }}>
                  <div className="micro" style={{ marginBottom: 4 }}>Idade desenv. (última)</div>
                  <div className="mono" style={{ fontSize: 26, fontWeight: 600, color: 'var(--primary-ink)', lineHeight: 1 }}>{formatDevAge(latestDev)}</div>
                  {chronYears !== null && (
                    <div className="mono" style={{ fontSize: 12, marginTop: 5, color: latestDev - chronYears >= -0.25 ? 'var(--pos)' : 'var(--neg)' }}>
                      {latestDev - chronYears >= 0 ? '+' : ''}{(latestDev - chronYears).toFixed(1)}a vs. cronológica
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* tabs */}
        <div className="seg" style={{ marginBottom: 20 }}>
          <button data-on={tab === 'assessments'} onClick={() => setTab('assessments')}>
            <BarChart3 size={14} /> Avaliações <span className="chip" style={{ padding: '1px 7px', marginLeft: 2 }}>{patientAssessments.length}</span>
          </button>
          <button data-on={tab === 'progress'} onClick={() => setTab('progress')}>
            <TrendingUp size={14} /> Progressão
          </button>
        </div>

        {/* assessments tab */}
        {tab === 'assessments' && (
          <div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginBottom: 16 }} onClick={handleNewAssessment}>
              <Plus size={16} /> Nova avaliação
            </button>
            {patientAssessments.length === 0 ? (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>
                <p style={{ fontSize: 13.5 }}>Nenhuma avaliação ainda. Clique acima para iniciar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...patientAssessments].reverse().map((a, ri) => {
                  const num = patientAssessments.length - ri
                  const answered = Object.values(a.responses).filter(Boolean).length
                  const pct = Math.round((answered / portageItems.length) * 100)
                  const nao = Object.values(a.responses).filter(v => v === 'nao').length
                  const av = Object.values(a.responses).filter(v => v === 'as_vezes').length
                  const results = getAreaResults(a.responses as Record<string, ResponseType>)
                  const dev = results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
                  return (
                    <div key={a.id} className="card card-pad">
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span className="tag" style={{ background: 'var(--primary-bg)', color: 'var(--primary-ink)' }}>Avaliação {num}</span>
                            <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{a.studentInfo.date}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 18, marginTop: 13, flexWrap: 'wrap' }}>
                            {answered > 0 && <div><div className="micro" style={{ marginBottom: 2 }}>Idade desenv.</div><div className="mono" style={{ fontWeight: 600, color: 'var(--primary-ink)' }}>{formatDevAge(dev)}</div></div>}
                            <div><div className="micro" style={{ marginBottom: 2 }}>Concluído</div><div className="mono" style={{ fontWeight: 600 }}>{pct}%</div></div>
                            {answered > 0 && <div><div className="micro" style={{ marginBottom: 2 }}>Não / Às vezes</div><div className="mono"><span style={{ color: 'var(--neg)' }}>{nao}</span> / <span style={{ color: 'var(--part)' }}>{av}</span></div></div>}
                          </div>
                          <div className="bar" style={{ marginTop: 13, maxWidth: 320 }}><i style={{ width: pct + '%' }} /></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 134 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => open(a.id, 'questionnaire')}><Eye size={14} /> Questionário</button>
                          {answered > 0 && <>
                            <button className="btn btn-ghost btn-sm" onClick={() => open(a.id, 'results')}><BarChart3 size={14} /> Resultados</button>
                            <button className="btn btn-subtle btn-sm" onClick={() => open(a.id, 'pei')}><BookOpen size={14} /> PEI</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { reAssess(a.id); setView('questionnaire') }}><RefreshCw size={14} /> Reavaliar</button>
                          </>}
                          <button className="btn btn-sm" style={{ color: 'var(--neg)', borderColor: 'hsl(6 60% 88%)', background: 'var(--neg-bg)' }} onClick={() => { if (window.confirm('Excluir esta avaliação? Esta ação não pode ser desfeita.')) deleteAssessment(a.id) }}><Trash2 size={14} /> Excluir</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* progress tab */}
        {tab === 'progress' && (
          <div>
            {progressData.length < 2 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>
                <TrendingUp size={32} style={{ margin: '0 auto 10px', color: 'var(--ink-4)' }} />
                <p style={{ fontSize: 13.5, margin: 0 }}>São necessárias ao menos 2 avaliações para exibir a progressão.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Idade desenvolvimental por área</h3>
                    <p style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 0 0' }}>↑ progressão · ↓ regressão · → estável</p>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data">
                      <thead><tr>
                        <th>Área</th>
                        {progressData.map((pd, i) => <th key={pd.assessment.id}>Av. {i + 1}<br /><span className="mono" style={{ fontWeight: 400, color: 'var(--ink-4)', fontSize: 10.5 }}>{pd.assessment.studentInfo.date}</span></th>)}
                        <th>Variação</th>
                      </tr></thead>
                      <tbody>
                        {AREAS.map((area, aIdx) => {
                          const vals = progressData.map(pd => pd.areaResults[aIdx].idadeDesenvAnos)
                          const totalVar = vals[vals.length - 1] - vals[0]
                          return (
                            <tr key={area}>
                              <td style={{ fontWeight: 600 }}>{AREA_SHORT[area] ?? area}</td>
                              {vals.map((v, i) => {
                                const diff = i > 0 ? v - vals[i - 1] : 0
                                return <td key={i}><span className="mono" style={{ fontWeight: 500 }}>{formatDevAge(v)}</span>{i > 0 && <span className="mono" style={{ marginLeft: 5, fontWeight: 700, fontSize: 12, color: diff > 0.05 ? 'var(--pos)' : diff < -0.05 ? 'var(--neg)' : 'var(--ink-4)' }}>{diff > 0.05 ? '↑' : diff < -0.05 ? '↓' : '→'}</span>}</td>
                              })}
                              <td>
                                <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600, color: totalVar > 0.05 ? 'var(--pos)' : totalVar < -0.05 ? 'var(--neg)' : 'var(--ink-3)' }}>
                                  {totalVar > 0.05 ? <TrendingUp size={13} /> : totalVar < -0.05 ? <TrendingDown size={13} /> : <Minus size={13} />}
                                  {totalVar >= 0 ? '+' : ''}{totalVar.toFixed(2)}a
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        <tr style={{ background: 'var(--primary-bg)' }}>
                          <td style={{ fontWeight: 700, color: 'var(--primary-ink)' }}>Média geral</td>
                          {progressData.map((pd, i) => {
                            const avg = pd.areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / pd.areaResults.length
                            const prev = i > 0 ? progressData[i-1].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[i-1].areaResults.length : null
                            const diff = prev !== null ? avg - prev : 0
                            return <td key={i}><span className="mono" style={{ fontWeight: 700, color: 'var(--primary-ink)' }}>{formatDevAge(avg)}</span>{i > 0 && <span className="mono" style={{ marginLeft: 5, fontWeight: 700, fontSize: 12, color: diff > 0.05 ? 'var(--pos)' : diff < -0.05 ? 'var(--neg)' : 'var(--ink-4)' }}>{diff > 0.05 ? '↑' : diff < -0.05 ? '↓' : '→'}</span>}</td>
                          })}
                          <td>{(() => {
                            const first = progressData[0].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[0].areaResults.length
                            const last = progressData[progressData.length-1].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[progressData.length-1].areaResults.length
                            const d = last - first
                            return <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 700, color: d > 0.05 ? 'var(--pos)' : d < -0.05 ? 'var(--neg)' : 'var(--ink-3)' }}>
                              {d > 0.05 ? <TrendingUp size={13} /> : d < -0.05 ? <TrendingDown size={13} /> : <Minus size={13} />}
                              {d >= 0 ? '+' : ''}{d.toFixed(2)}a
                            </span>
                          })()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" style={{ padding: 12, flex: 1 }} onClick={handleExportPdf} disabled={exportingPdf}>
                    {exportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    Baixar PDF
                  </button>
                  <button className="btn btn-ghost" style={{ padding: 12, flex: 1 }} onClick={handleExportHtml} disabled={exportingHtml}>
                    {exportingHtml ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    Baixar HTML
                  </button>
                  <button className="btn btn-primary" style={{ padding: 12, flex: 1 }} onClick={handleExport} disabled={exporting}>
                    {exporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    Exportar Word
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
