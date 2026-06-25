import { useState, useEffect, useRef } from 'react'
import { Users, Plus, LogOut, Megaphone, Trash2, Loader2, Camera, X, ClipboardList, ChevronRight, BookMarked } from 'lucide-react'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { portageItems } from '../hooks/usePortageAssessment'
import type { PatientsHook } from '../hooks/usePatients'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { calcAge } from '../utils/ageCalc'

type AuthHook = ReturnType<typeof useAuth>
interface Props {
  hook: AssessmentHook
  setView?: (v: View) => void
  auth: AuthHook
  patientsHook: PatientsHook
  onOpenPatient: (id: string) => void
}

interface Announcement {
  id: string; title: string; body: string; created_at: string; created_by: string
}

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'
const BLANK_FORM = { name: '', birthDate: '', diagnosis: '', responsibleName: '', photoBase64: '' }

export default function Dashboard({ hook, auth, patientsHook, onOpenPatient }: Props) {
  const { assessments } = hook
  const { patients, createPatient, deletePatient } = patientsHook
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnn, setLoadingAnn] = useState(true)
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [savingAnn, setSavingAnn] = useState(false)
  const [showRefs, setShowRefs] = useState(false)
  const [creating, setCreating] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const isAdmin = auth.user?.email === ADMIN_EMAIL

  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoadingAnn(false) })
  }, [])

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photoBase64: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const handleCreate = () => {
    if (!form.name.trim() || creating) return
    setCreating(true)
    createPatient({
      name: form.name.trim(),
      birthDate: form.birthDate,
      diagnosis: form.diagnosis.trim(),
      responsibleName: form.responsibleName.trim(),
      photoBase64: form.photoBase64 || undefined,
    })
    setForm(BLANK_FORM)
    setShowForm(false)
    setTimeout(() => setCreating(false), 500)
  }

  const handleSaveAnn = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setSavingAnn(true)
    const { data, error } = await supabase.from('announcements').insert({
      title: newTitle.trim(), body: newBody.trim(), created_by: auth.user!.id,
    }).select().single()
    setSavingAnn(false)
    if (!error && data) { setAnnouncements(prev => [data, ...prev]); setNewTitle(''); setNewBody(''); setShowAnnForm(false) }
  }

  const handleDeleteAnn = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const patientAssessmentCount = (pid: string) => assessments.filter(a => a.childId === pid).length

  const lastAssessmentDate = (pid: string) => {
    const list = assessments.filter(a => a.childId === pid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    return list[0]?.studentInfo.date ?? null
  }

  const patientCompletion = (pid: string) => {
    const list = assessments.filter(a => a.childId === pid)
    if (list.length === 0) return null
    const last = list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    const answered = Object.values(last.responses).filter(Boolean).length
    return Math.round((answered / portageItems.length) * 100)
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">IADI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Inventário de Avaliação Infantil</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[160px]">{auth.user?.email}</span>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-1 text-xs text-red-400 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* Announcements */}
      {loadingAnn && <div className="flex justify-center py-2 mb-4"><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /></div>}
      {!loadingAnn && (announcements.length > 0 || isAdmin) && (
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> Avisos
            </p>
            {isAdmin && (
              <button type="button" onClick={() => setShowAnnForm(s => !s)}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-0.5">
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            )}
          </div>
          {showAnnForm && isAdmin && (
            <div className="space-y-2 mb-3 pt-2 border-t border-purple-100">
              <input type="text" placeholder="Título" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
              <textarea rows={2} placeholder="Texto..." value={newBody} onChange={e => setNewBody(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
              <div className="flex gap-2">
                <button type="button" onClick={handleSaveAnn} disabled={savingAnn}
                  className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-60">
                  {savingAnn && <Loader2 className="w-3 h-3 animate-spin" />} Publicar
                </button>
                <button type="button" onClick={() => setShowAnnForm(false)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg bg-white">Cancelar</button>
              </div>
            </div>
          )}
          {announcements.length === 0 && <p className="text-xs text-purple-400">Nenhum aviso no momento.</p>}
          <div className="space-y-2">
            {announcements.map(ann => (
              <div key={ann.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{ann.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{ann.body}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(ann.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                {isAdmin && (
                  <button type="button" onClick={() => handleDeleteAnn(ann.id)} className="text-red-300 hover:text-red-500 shrink-0 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patients header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" /> Pacientes
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{patients.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 text-sm bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Paciente
        </button>
      </div>

      {/* New patient form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-purple-700">Cadastrar Paciente</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Photo */}
          <div className="flex items-center gap-4 mb-4">
            <div
              onClick={() => photoRef.current?.click()}
              className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden shrink-0"
            >
              {form.photoBase64 ? (
                <img src={form.photoBase64} alt="foto" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-gray-300" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Foto do paciente</p>
              <p className="text-xs text-gray-400">Clique para selecionar</p>
              {form.photoBase64 && (
                <button type="button" onClick={() => setForm(f => ({ ...f, photoBase64: '' }))} className="text-[10px] text-red-400 hover:text-red-600 mt-0.5">Remover foto</button>
              )}
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Nome completo *', key: 'name', placeholder: 'Nome da criança' },
              { label: 'Responsável', key: 'responsibleName', placeholder: 'Nome do responsável' },
              { label: 'Diagnóstico', key: 'diagnosis', placeholder: 'Ex: TEA, Síndrome de Down...' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="text" placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data de Nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCreate} disabled={creating}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-60">
              <Plus className="w-4 h-4" /> Cadastrar
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition">Cancelar</button>
          </div>
        </div>
      )}

      {/* Patient list */}
      {patients.length === 0 && !showForm ? (
        <div className="text-center py-20 text-gray-300">
          <Users className="w-14 h-14 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Nenhum paciente cadastrado ainda.</p>
          <button type="button" onClick={() => setShowForm(true)}
            className="mt-4 text-sm text-purple-500 hover:text-purple-700 font-medium">
            Cadastrar primeiro paciente →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map(p => {
            const count = patientAssessmentCount(p.id)
            const lastDate = lastAssessmentDate(p.id)
            const completion = patientCompletion(p.id)
            const age = p.birthDate ? calcAge(p.birthDate) : null
            return (
              <div
                key={p.id}
                onClick={() => onOpenPatient(p.id)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-purple-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.photoBase64 ? (
                      <img src={p.photoBase64} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-purple-600 font-bold text-lg">{p.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{p.name}</span>
                      {p.diagnosis && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.diagnosis}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-gray-400">
                      {age && <span>{age}</span>}
                      {p.responsibleName && <span>Resp: {p.responsibleName}</span>}
                      <span>Cadastro: {new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
                      <span className="text-purple-600 font-medium">{count} {count === 1 ? 'avaliação' : 'avaliações'}</span>
                      {lastDate && <span className="text-gray-400">Última: {lastDate}</span>}
                      {completion !== null && (
                        <span className={`font-medium ${completion === 100 ? 'text-green-600' : 'text-gray-500'}`}>{completion}% concluída</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); if (window.confirm(`Excluir ${p.name}?`)) deletePatient(p.id) }}
                      className="text-red-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Refs */}
      <div className="mt-10 text-center">
        <button type="button" onClick={() => setShowRefs(r => !r)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 transition">
          <BookMarked className="w-3.5 h-3.5" /> Referências bibliográficas
        </button>
        {showRefs && (
          <div className="mt-3 bg-white rounded-2xl border border-purple-100 shadow-sm p-5 text-xs text-gray-600 space-y-2 text-left">
            <h3 className="font-bold text-gray-800 text-sm">Referências Bibliográficas</h3>
            <ol className="space-y-1.5 list-decimal list-inside">
              <li>Bluma, S. et al. (1976). <em>Portage guide to early education</em>. CESA 12.</li>
              <li>Shearer, D. E., &amp; Shearer, M. S. (1972). The Portage Project. <em>Exceptional Children</em>, 36(3), 210–217.</li>
              <li>Williams, L. C. A., &amp; Aiello, A. L. R. (2001). <em>O Inventário Portage Operacionalizado</em>. São Paulo: Memnon.</li>
              <li>Neisworth, J. T., &amp; Bagnato, S. J. (2004). <em>Infants &amp; Young Children</em>, 17(3), 198–212.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
