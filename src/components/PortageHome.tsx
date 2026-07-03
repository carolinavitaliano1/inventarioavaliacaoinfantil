import { useState } from 'react'
import { ClipboardList, Plus, Eye, BarChart3, BookOpen, Trash2, LogOut, RefreshCw, LayoutDashboard, BookMarked } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { StudentInfo } from '../types'
import type { View } from '../App'
import type { useAuth } from '../hooks/useAuth'
import { calcAge } from '../utils/ageCalc'

type AuthHook = ReturnType<typeof useAuth>
interface Props { hook: AssessmentHook; setView: (v: View) => void; auth: AuthHook }

export default function PortageHome({ hook, setView, auth }: Props) {
  const { assessments, createAssessment, reAssess, deleteAssessment, setCurrentId, getAreaStats, getSiblingAssessments } = hook
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<StudentInfo>({ name: '', birthDate: '', diagnosis: '', age: '', date: new Date().toLocaleDateString('pt-BR') })
  const [showRefs, setShowRefs] = useState(false)

  const handleBirthDate = (value: string) => {
    const age = calcAge(value)
    setForm(f => ({ ...f, birthDate: value, age }))
  }

  const handleCreate = () => {
    if (!form.name.trim()) return
    createAssessment(form)
    setView('questionnaire')
  }

  const open = (id: string, v: View) => { setCurrentId(id); setView(v) }

  const answeredCount = (id: string) => {
    const a = assessments.find(x => x.id === id)
    return a ? Object.values(a.responses).filter(Boolean).length : 0
  }

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs text-gray-400 truncate max-w-[60%]">{auth.user?.email}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Painel
          </button>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="flex items-center gap-1.5 text-xs text-red-400 border border-red-100 rounded-lg px-3 py-1.5 hover:bg-red-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
          <ClipboardList className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">IADI</h1>
        <p className="text-base font-semibold text-purple-700 mt-0.5">Inventário de Avaliação do Desenvolvimento Infantil</p>
        <p className="text-sm text-gray-500 mt-1">Avaliação da Idade Desenvolvimental</p>
        <p className="text-xs text-gray-400 mt-1">{portageItems.length} habilidades · 6 áreas · 0–6 anos</p>
        <button type="button" onClick={() => setShowRefs(r => !r)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-purple-500 hover:text-purple-700 transition">
          <BookMarked className="w-3.5 h-3.5" /> Referências bibliográficas
        </button>
      </div>

      {/* Referências */}
      {showRefs && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5 mb-6 text-xs text-gray-600 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Referências Bibliográficas</h3>
          <p className="text-gray-500 italic text-[11px]">Instrumento de avaliação do desenvolvimento infantil de 0 a 6 anos, organizado em 5 áreas e por faixa etária.</p>
          <ol className="space-y-2 list-decimal list-inside">
            <li>Bluma, S., Shearer, M., Frohman, A., &amp; Hilliard, J. (1976). Cooperative Educational Service Agency 12, Wisconsin.</li>
            <li>Shearer, D. E., &amp; Shearer, M. S. (1972). <em>Exceptional Children</em>, <em>36</em>(3), 210–217.</li>
            <li>Williams, L. C. A., &amp; Aiello, A. L. R. (2001). São Paulo: Memnon.</li>
            <li>Boyd, R. D. (1989). <em>Journal of Early Intervention</em>, <em>13</em>(2), 114–119.</li>
            <li>Neisworth, J. T., &amp; Bagnato, S. J. (2004). <em>Infants &amp; Young Children</em>, <em>17</em>(3), 198–212.</li>
          </ol>
        </div>
      )}

      {/* Form nova avaliação */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 mb-6">
          <h2 className="text-base font-semibold text-purple-700 mb-4">Nova Avaliação</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Nome da Criança *', key: 'name', placeholder: 'Nome completo', type: 'text' },
              { label: 'Diagnóstico', key: 'diagnosis', placeholder: 'Ex: TEA, Síndrome de Down...', type: 'text' },
              { label: 'Data da Avaliação', key: 'date', placeholder: '', type: 'text' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof StudentInfo]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data de Nascimento</label>
              <input type="date" value={form.birthDate} onChange={e => handleBirthDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Idade (calculada automaticamente)</label>
              <input type="text" value={form.age} readOnly
                className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleCreate} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">
              <Plus className="w-4 h-4" /> Iniciar Avaliação
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl text-base font-semibold shadow hover:bg-purple-700 transition mb-6"
        >
          <Plus className="w-5 h-5" /> Nova Avaliação
        </button>
      )}

      {/* Lista de avaliações */}
      {assessments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Avaliações Salvas</h2>
          <div className="space-y-3">
            {assessments.map(a => {
              const answered = answeredCount(a.id)
              const pct = Math.round((answered / portageItems.length) * 100)
              const stats = getAreaStats(a.id)
              const nao = Object.values(stats).reduce((s, v) => s + v.nao, 0)
              const av = Object.values(stats).reduce((s, v) => s + v.av, 0)
              const siblings = getSiblingAssessments(a.id)
              const evalNum = siblings.findIndex(s => s.id === a.id) + 1
              return (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{a.studentInfo.name}</span>
                        {a.studentInfo.diagnosis && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a.studentInfo.diagnosis}</span>}
                        {siblings.length > 1 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Avaliação {evalNum}/{siblings.length}</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{a.studentInfo.age && `${a.studentInfo.age} · `}{a.studentInfo.date}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        <span className="text-gray-400">{pct}% respondido</span>
                        {answered > 0 && <>
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Não: {nao}</span>
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Às vezes: {av}</span>
                        </>}
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button type="button" onClick={() => open(a.id, 'questionnaire')} className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition">
                        <Eye className="w-3.5 h-3.5" /> Questionário
                      </button>
                      {answered > 0 && <>
                        <button type="button" onClick={() => open(a.id, 'results')} className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition">
                          <BarChart3 className="w-3.5 h-3.5" /> Resultados
                        </button>
                        <button type="button" onClick={() => open(a.id, 'pei')} className="flex items-center gap-1 text-xs border border-purple-200 text-purple-700 rounded-lg px-2.5 py-1.5 hover:bg-purple-50 transition">
                          <BookOpen className="w-3.5 h-3.5" /> PEI
                        </button>
                        <button type="button" onClick={() => { reAssess(a.id); setView('questionnaire') }} className="flex items-center gap-1 text-xs border border-green-200 text-green-700 rounded-lg px-2.5 py-1.5 hover:bg-green-50 transition">
                          <RefreshCw className="w-3.5 h-3.5" /> Reavaliar
                        </button>
                      </>}
                      <button type="button" onClick={() => deleteAssessment(a.id)} className="flex items-center gap-1 text-xs text-red-400 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition">
                        <Trash2 className="w-3.5 h-3.5" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {assessments.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-300">
          <ClipboardList className="w-14 h-14 mx-auto mb-3" />
          <p className="text-sm">Nenhuma avaliação ainda. Comece criando uma nova.</p>
        </div>
      )}
    </div>
  )
}
