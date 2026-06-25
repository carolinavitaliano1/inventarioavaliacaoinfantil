import { useState, useEffect } from 'react'
import { LayoutDashboard, ClipboardList, ArrowLeft, Megaphone, Plus, Trash2, Loader2 } from 'lucide-react'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { portageItems } from '../hooks/usePortageAssessment'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth: AuthHook }

interface Announcement {
  id: string
  title: string
  body: string
  created_at: string
  created_by: string
}

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'

export default function Dashboard({ hook, setView, auth }: Props) {
  const { assessments, getAreaStats } = hook
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loadingAnn, setLoadingAnn] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [saving, setSaving] = useState(false)

  const isAdmin = auth.user?.email === ADMIN_EMAIL

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAnnouncements(data ?? [])
        setLoadingAnn(false)
      })
  }, [])

  const totalAssessments = assessments.length
  const uniqueChildren = new Set(assessments.map(a => a.childId)).size
  const totalAnswered = assessments.reduce((sum, a) => sum + Object.values(a.responses).filter(Boolean).length, 0)
  const totalItems = portageItems.length * totalAssessments || 1
  const avgCompletion = totalAssessments > 0 ? Math.round((totalAnswered / totalItems) * 100) : 0

  const handleSaveAnnouncement = async () => {
    if (!newTitle.trim() || !newBody.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('announcements').insert({
      title: newTitle.trim(),
      body: newBody.trim(),
      created_by: auth.user!.id,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setAnnouncements(prev => [data, ...prev])
      setNewTitle('')
      setNewBody('')
      setShowForm(false)
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">Painel</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">{uniqueChildren}</p>
          <p className="text-xs text-gray-500 mt-1">Crianças</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">{totalAssessments}</p>
          <p className="text-xs text-gray-500 mt-1">Avaliações</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-700">{avgCompletion}%</p>
          <p className="text-xs text-gray-500 mt-1">Conclusão Média</p>
        </div>
      </div>

      {/* Recent assessments */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4" /> Avaliações Recentes
        </h2>
        {assessments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhuma avaliação ainda.</p>
        ) : (
          <div className="space-y-2">
            {[...assessments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map(a => {
              const stats = getAreaStats(a.id)
              const answered = Object.values(a.responses).filter(Boolean).length
              const pct = Math.round((answered / portageItems.length) * 100)
              const nao = Object.values(stats).reduce((s, v) => s + v.nao, 0)
              return (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.studentInfo.name}</p>
                    <p className="text-xs text-gray-400">{a.studentInfo.date} · {pct}% respondido · Não: {nao}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { hook.setCurrentId(a.id); setView('results') }}
                    className="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition shrink-0"
                  >
                    Ver
                  </button>
                </div>
              )
            })}
          </div>
        )}
        {assessments.length > 5 && (
          <button type="button" onClick={() => setView('home')} className="mt-2 text-xs text-purple-500 hover:text-purple-700">
            Ver todas ({assessments.length}) →
          </button>
        )}
      </div>

      {/* Announcements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> Avisos
          </h2>
          {isAdmin && (
            <button type="button" onClick={() => setShowForm(s => !s)} className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">
              <Plus className="w-3.5 h-3.5" /> Novo Aviso
            </button>
          )}
        </div>

        {isAdmin && showForm && (
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-4 mb-4 space-y-3">
            <input
              type="text"
              placeholder="Título do aviso"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <textarea
              placeholder="Texto do aviso..."
              rows={3}
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveAnnouncement} disabled={saving} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-60">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publicar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition">Cancelar</button>
            </div>
          </div>
        )}

        {loadingAnn ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-purple-400 animate-spin" /></div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum aviso no momento.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{ann.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(ann.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {isAdmin && (
                    <button type="button" onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-300 hover:text-red-500 transition shrink-0 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{ann.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
