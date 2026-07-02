import { useState, useEffect, useRef } from 'react'
import { Activity, Plus, LogOut, Megaphone, Trash2, Loader2, Camera, X, ChevronRight, BookMarked, Search, TrendingUp, Calendar, Users, ClipboardList } from 'lucide-react'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { portageItems } from '../hooks/usePortageAssessment'
import type { PatientsHook } from '../hooks/usePatients'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { calcAge } from '../utils/ageCalc'
import { AREAS } from '../types'
import type { PortageItem, ResponseType } from '../types'
import { calcAreaDevResult } from '../utils/ageCalc'

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

function getMediaGeral(responses: Record<string, string>): number | null {
  const results = AREAS.map(area => {
    const items = portageItems.filter(p => p.area === area)
    return calcAreaDevResult(area, items as PortageItem[], responses as Record<string, ResponseType>)
  })
  if (results.every(r => r.totalItems === 0)) return null
  return results.reduce((s, r) => s + r.idadeDesenvAnos, 0) / results.length
}

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
  const [search, setSearch] = useState('')
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

  const patientMediaGeral = (pid: string): number | null => {
    const list = assessments.filter(a => a.childId === pid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (list.length === 0) return null
    return getMediaGeral(list[0].responses)
  }

  const patientIdadeDevLabel = (pid: string) => {
    const media = patientMediaGeral(pid)
    if (media === null) return null
    const anos = Math.floor(media)
    const meses = Math.round((media - anos) * 12)
    return { text: `${anos}a ${meses}m`, value: media }
  }

  // Stats
  const totalPatients = patients.length
  const totalAssessments = assessments.length
  const inFollowUp = patients.filter(p => patientAssessmentCount(p.id) > 0).length
  const now = new Date()
  const thisMonth = assessments.filter(a => {
    const d = new Date(a.updatedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">IADI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Inventário de Avaliação do Desenvolvimento Infantil</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{auth.user?.email}</span>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title + CTA */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel clínico</h1>
            <p className="text-sm text-gray-500 mt-0.5">Acompanhe avaliações e a evolução de cada criança.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1.5 text-sm bg-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Novo paciente
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, label: 'PACIENTES ATIVOS', value: totalPatients, color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: ClipboardList, label: 'AVALIAÇÕES REGISTRADAS', value: totalAssessments, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: TrendingUp, label: 'EM ACOMPANHAMENTO', value: inFollowUp, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Calendar, label: 'AVALIADOS ESTE MÊS', value: thisMonth, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Announcements */}
        {!loadingAnn && (announcements.length > 0 || isAdmin) && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Megaphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                {announcements.length > 0 ? (
                  <>
                    <span className="text-sm text-blue-800 font-medium">{announcements[0].title}</span>
                    <span className="text-sm text-blue-700"> — {announcements[0].body}</span>
                  </>
                ) : (
                  <span className="text-sm text-blue-700">Nenhum aviso no momento.</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {announcements.length > 0 && (
                <button type="button" onClick={() => setShowRefs(false)} className="text-xs text-blue-600 font-medium hover:underline whitespace-nowrap">
                  Ver mudanças
                </button>
              )}
              {isAdmin && (
                <button type="button" onClick={() => setShowAnnForm(s => !s)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 border border-blue-200 rounded px-2 py-1">
                  <Plus className="w-3 h-3" /> Novo
                </button>
              )}
            </div>
          </div>
        )}

        {loadingAnn && <div className="flex justify-center py-2 mb-4"><Loader2 className="w-4 h-4 text-purple-400 animate-spin" /></div>}

        {showAnnForm && isAdmin && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 space-y-2">
            <input type="text" placeholder="Título do aviso" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <textarea rows={2} placeholder="Texto..." value={newBody} onChange={e => setNewBody(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveAnn} disabled={savingAnn}
                className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition disabled:opacity-60">
                {savingAnn && <Loader2 className="w-3 h-3 animate-spin" />} Publicar
              </button>
              <button type="button" onClick={() => setShowAnnForm(false)} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg bg-white">Cancelar</button>
            </div>
            {announcements.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-1">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">{ann.title}</span>
                    <button type="button" onClick={() => handleDeleteAnn(ann.id)} className="text-red-300 hover:text-red-500 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New patient form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-purple-700">Cadastrar Paciente</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
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
                  <button type="button" onClick={() => setForm(f => ({ ...f, photoBase64: '' }))} className="text-[10px] text-red-400 hover:text-red-600 mt-0.5">Remover</button>
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
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Cadastrar
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition">Cancelar</button>
            </div>
          </div>
        )}

        {/* Patient list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              Pacientes
              <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{patients.length}</span>
            </h2>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 w-44"
              />
            </div>
          </div>

          {/* Column headers */}
          {filteredPatients.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
              <span>Paciente</span>
              <span className="text-center w-32 hidden sm:block">Idade Desenv. (Média)</span>
              <span className="text-center w-28 hidden sm:block">Última Avaliação</span>
              <span className="text-center w-24">Avaliações</span>
            </div>
          )}

          {filteredPatients.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <Users className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {search ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
              </p>
              {!search && (
                <button type="button" onClick={() => setShowForm(true)}
                  className="mt-3 text-sm text-purple-500 hover:text-purple-700 font-medium">
                  Cadastrar primeiro paciente →
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredPatients.map(p => {
                const count = patientAssessmentCount(p.id)
                const lastDate = lastAssessmentDate(p.id)
                const devInfo = patientIdadeDevLabel(p.id)
                const age = p.birthDate ? calcAge(p.birthDate) : null

                // Calc defasagem for color
                let diffColor = 'text-gray-400'
                let diffText = ''
                if (devInfo && p.birthDate) {
                  const birthMs = new Date(p.birthDate).getTime()
                  const ageYears = (Date.now() - birthMs) / (1000 * 60 * 60 * 24 * 365.25)
                  const diff = devInfo.value - ageYears
                  diffText = diff >= 0 ? `+${diff.toFixed(1)}a` : `${diff.toFixed(1)}a`
                  diffColor = diff >= -0.5 ? 'text-green-600' : diff >= -1 ? 'text-yellow-500' : 'text-red-500'
                }

                return (
                  <div
                    key={p.id}
                    onClick={() => onOpenPatient(p.id)}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition cursor-pointer group"
                  >
                    {/* Patient info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.photoBase64 ? (
                          <img src={p.photoBase64} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-purple-600 font-bold text-sm">{p.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {age && <span>{age}</span>}
                          {age && p.diagnosis && <span> · </span>}
                          {p.diagnosis && <span>{p.diagnosis}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Idade desenvolvimental */}
                    <div className="w-32 text-center hidden sm:block">
                      {devInfo ? (
                        <span className="text-sm font-semibold text-gray-700">
                          {devInfo.text}
                          {diffText && <span className={`ml-1.5 text-xs font-medium ${diffColor}`}>{diffText}</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    {/* Última avaliação */}
                    <div className="w-28 text-center hidden sm:block">
                      <span className="text-xs text-gray-500">{lastDate ?? '—'}</span>
                    </div>

                    {/* Avaliações + actions */}
                    <div className="w-24 flex items-center justify-end gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">{count}</span>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); if (window.confirm(`Excluir ${p.name}?`)) deletePatient(p.id) }}
                        className="text-red-200 hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-400 transition" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Refs */}
        <div className="mt-8 text-center">
          <button type="button" onClick={() => setShowRefs(r => !r)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-purple-600 transition">
            <BookMarked className="w-3.5 h-3.5" /> Referências bibliográficas
          </button>
          {showRefs && (
            <div className="mt-3 bg-white rounded-2xl border border-purple-100 shadow-sm p-5 text-xs text-gray-600 space-y-2 text-left">
              <h3 className="font-bold text-gray-800 text-sm">Referências Bibliográficas</h3>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Bluma, S. et al. (1976). CESA 12, Wisconsin.</li>
                <li>Shearer, D. E., &amp; Shearer, M. S. (1972). <em>Exceptional Children</em>, 36(3), 210–217.</li>
                <li>Williams, L. C. A., &amp; Aiello, A. L. R. (2001). São Paulo: Memnon.</li>
                <li>Neisworth, J. T., &amp; Bagnato, S. J. (2004). <em>Infants &amp; Young Children</em>, 17(3), 198–212.</li>
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
