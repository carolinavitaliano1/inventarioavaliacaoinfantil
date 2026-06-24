import { useState } from 'react'
import { ArrowLeft, BarChart3, Plus, Trash2, Save, Printer } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { View } from '../App'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  startDate: string; endDate: string; estrategias: string
  status: 'pendente' | 'em_andamento' | 'concluido'
}

const PRAZO = { curto: 'Curto Prazo (3 meses)', medio: 'Médio Prazo (6 meses)', longo: 'Longo Prazo (9-12 meses)' }
const STATUS = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído' }
const STATUS_COLOR = { pendente: 'bg-gray-100 text-gray-600', em_andamento: 'bg-blue-100 text-blue-700', concluido: 'bg-green-100 text-green-700' }
const PRAZO_COLOR = { curto: 'bg-orange-100 text-orange-700', medio: 'bg-blue-100 text-blue-700', longo: 'bg-purple-100 text-purple-700' }

function loadPEI(id: string): PEIItem[] {
  try { return JSON.parse(localStorage.getItem(`pei_${id}`) || '[]') } catch { return [] }
}
function savePEI(id: string, items: PEIItem[]) {
  localStorage.setItem(`pei_${id}`, JSON.stringify(items))
}

export default function PortagePEI({ hook, setView }: Props) {
  const { current, getItemsByResponse } = hook
  const [pei, setPei] = useState<PEIItem[]>(() => current ? loadPEI(current.id) : [])
  const [tab, setTab] = useState<'select' | 'plan'>('select')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<PEIItem>>({})

  if (!current) return null

  const naoItems = getItemsByResponse('nao')
  const avItems = getItemsByResponse('as_vezes')
  const allPriority = [...naoItems, ...avItems]

  const inPEI = (text: string) => pei.some(p => p.skill === text)

  const add = (item: typeof portageItems[number]) => {
    if (inPEI(item.text)) return
    const newItem: PEIItem = {
      id: `pei_${Date.now()}`, skill: item.text, area: item.area, ageRange: item.age_range,
      prazo: naoItems.includes(item) ? 'curto' : 'medio',
      startDate: '', endDate: '', estrategias: '', status: 'pendente',
    }
    const next = [...pei, newItem]; setPei(next); savePEI(current.id, next)
  }

  const remove = (id: string) => {
    const next = pei.filter(p => p.id !== id); setPei(next); savePEI(current.id, next)
  }

  const saveEdit = () => {
    const next = pei.map(p => p.id === editId ? { ...p, ...editForm } : p)
    setPei(next); savePEI(current.id, next); setEditId(null); setEditForm({})
  }

  const grouped: Record<PEIItem['prazo'], PEIItem[]> = { curto: [], medio: [], longo: [] }
  for (const p of pei) grouped[p.prazo].push(p)

  return (
    <div className="max-w-4xl mx-auto p-4 py-6 print:py-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 print:hidden">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <p className="font-bold text-gray-900">Plano de Ensino Individualizado (PEI)</p>
          <p className="text-xs text-gray-400">{current.studentInfo.name}</p>
        </div>
        <button onClick={() => setView('results')} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <BarChart3 className="w-3.5 h-3.5" /> Resultados
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <Printer className="w-3.5 h-3.5" /> Imprimir
        </button>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-xl font-bold">PLANO DE ENSINO INDIVIDUALIZADO (PEI)</h1>
        <p className="text-sm text-gray-500">Escala Portage de Desenvolvimento</p>
        <div className="grid grid-cols-3 gap-3 mt-3 text-sm text-left border rounded p-3">
          <span><b>Aluno:</b> {current.studentInfo.name}</span>
          <span><b>Idade:</b> {current.studentInfo.age}</span>
          <span><b>Diagnóstico:</b> {current.studentInfo.diagnosis}</span>
          <span><b>Nasc.:</b> {current.studentInfo.birthDate}</span>
          <span><b>Avaliação:</b> {current.studentInfo.date}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 print:hidden">
        {[
          { k: 'select', label: `Selecionar Habilidades (${allPriority.length})` },
          { k: 'plan', label: `Plano PEI (${pei.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Select tab */}
      {tab === 'select' && (
        <div className="space-y-2">
          {allPriority.length === 0 && <p className="text-center text-gray-300 py-10 text-sm">Responda o questionário primeiro.</p>}
          {allPriority.map(item => {
            const isNao = naoItems.includes(item)
            const added = inPEI(item.text)
            return (
              <div key={item.id} className={`p-3 rounded-xl border flex items-start gap-3 ${isNao ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{item.text}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isNao ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {isNao ? 'Alta Prioridade' : 'Em Desenvolvimento'}
                    </span>
                    <span className="text-xs text-gray-400">{item.age_range}</span>
                  </div>
                </div>
                <button
                  onClick={() => added ? remove(pei.find(p => p.skill === item.text)!.id) : add(item)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition ${added ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                  {added ? '✓ Adicionado' : <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</span>}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Plan tab */}
      {(tab === 'plan' || true) && (tab === 'plan' || typeof window !== 'undefined') && tab === 'plan' && (
        <div className="space-y-6 print:space-y-4">
          {pei.length === 0 && <p className="text-center text-gray-300 py-10 text-sm">Nenhuma habilidade no PEI. Selecione na aba anterior.</p>}
          {(['curto', 'medio', 'longo'] as const).map(prazo => {
            const items = grouped[prazo]
            if (items.length === 0) return null
            return (
              <div key={prazo}>
                <h2 className="font-bold text-sm text-gray-600 mb-3 print:text-base">{PRAZO[prazo]}</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
                      {editId === item.id ? (
                        <div className="p-4 space-y-3">
                          <p className="text-sm font-medium text-gray-800">{item.skill}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Prazo</label>
                              <select value={editForm.prazo || item.prazo} onChange={e => setEditForm(f => ({ ...f, prazo: e.target.value as PEIItem['prazo'] }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="curto">Curto (3 meses)</option>
                                <option value="medio">Médio (6 meses)</option>
                                <option value="longo">Longo (9-12 meses)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Status</label>
                              <select value={editForm.status || item.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as PEIItem['status'] }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em andamento</option>
                                <option value="concluido">Concluído</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Data Início</label>
                              <input type="date" value={editForm.startDate ?? item.startDate} onChange={e => setEditForm(f => ({ ...f, startDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Data Fim</label>
                              <input type="date" value={editForm.endDate ?? item.endDate} onChange={e => setEditForm(f => ({ ...f, endDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Estratégias de Intervenção</label>
                            <textarea rows={3} value={editForm.estrategias ?? item.estrategias} onChange={e => setEditForm(f => ({ ...f, estrategias: e.target.value }))}
                              placeholder="Descreva as estratégias..."
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                              <Save className="w-3 h-3" /> Salvar
                            </button>
                            <button onClick={() => { setEditId(null); setEditForm({}) }} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 leading-relaxed">{item.skill}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${PRAZO_COLOR[item.prazo]}`}>{PRAZO[item.prazo]}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status]}`}>{STATUS[item.status]}</span>
                              {item.startDate && <span className="text-xs text-gray-400">Início: {new Date(item.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                              {item.endDate && <span className="text-xs text-gray-400">Fim: {new Date(item.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                            </div>
                            {item.estrategias && <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">{item.estrategias}</p>}
                          </div>
                          <div className="flex flex-col gap-1 shrink-0 print:hidden">
                            <button onClick={() => { setEditId(item.id); setEditForm(item) }} className="text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition">Editar</button>
                            <button onClick={() => remove(item.id)} className="text-xs text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
