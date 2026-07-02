import { useState } from 'react'
import { ArrowLeft, BarChart3, Plus, Trash2, Save, FileDown, Loader2 } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { View } from '../App'
import { formatQuestion } from '../utils/formatQuestion'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

interface PEIItem {
  id: string; skill: string; area: string; ageRange: string
  prazo: 'curto' | 'medio' | 'longo'
  startDate: string; endDate: string; estrategias: string
  status: 'pendente' | 'em_andamento' | 'concluido'
}

const PRAZO = { curto: 'Curto Prazo (3 meses)', medio: 'Médio Prazo (6 meses)', longo: 'Longo Prazo (9–12 meses)' }
const STATUS = { pendente: 'Pendente', em_andamento: 'Em andamento', concluido: 'Concluído' }
const STATUS_COLOR = {
  pendente: 'bg-gray-100 text-gray-600',
  em_andamento: 'bg-blue-100 text-blue-700',
  concluido: 'bg-green-100 text-green-700',
}
const PRAZO_COLOR = {
  curto: 'bg-orange-100 text-orange-700',
  medio: 'bg-blue-100 text-blue-700',
  longo: 'bg-purple-100 text-purple-700',
}
const PRAZO_BORDER = {
  curto: 'border-orange-200',
  medio: 'border-blue-200',
  longo: 'border-purple-200',
}

function loadPEI(id: string): PEIItem[] {
  try { return JSON.parse(localStorage.getItem(`pei_${id}`) || '[]') } catch { return [] }
}
function savePEI(id: string, items: PEIItem[]) {
  localStorage.setItem(`pei_${id}`, JSON.stringify(items))
}

function wCell(text: string, bold = false, shade?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: 'clear' as any } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text || '—'), bold, size: 18 })] })],
  })
}

async function exportPEIWord(current: { studentInfo: { name: string; age: string; diagnosis?: string; birthDate: string; date: string }; id: string }, pei: PEIItem[]) {
  const { studentInfo } = current
  const sections: any[] = []

  sections.push(new Paragraph({
    text: 'PLANO DE ENSINO INDIVIDUALIZADO (PEI)',
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }))
  sections.push(new Paragraph({ text: 'Inventário de Avaliação Infantil', alignment: AlignmentType.CENTER }))
  sections.push(new Paragraph({ text: '' }))

  sections.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [wCell('Aluno', true), wCell(studentInfo.name), wCell('Idade', true), wCell(studentInfo.age)] }),
      new TableRow({ children: [wCell('Diagnóstico', true), wCell(studentInfo.diagnosis || '—'), wCell('Data da Avaliação', true), wCell(studentInfo.date)] }),
    ],
  }))
  sections.push(new Paragraph({ text: '' }))

  const grouped: Record<PEIItem['prazo'], PEIItem[]> = { curto: [], medio: [], longo: [] }
  for (const p of pei) grouped[p.prazo].push(p)

  for (const prazo of ['curto', 'medio', 'longo'] as const) {
    const items = grouped[prazo]
    if (items.length === 0) continue
    sections.push(new Paragraph({ text: PRAZO[prazo], heading: HeadingLevel.HEADING_2 }))
    const rows: TableRow[] = [
      new TableRow({
        children: [
          wCell('Habilidade', true, 'C9DCF1'),
          wCell('Área', true, 'C9DCF1'),
          wCell('Status', true, 'C9DCF1'),
          wCell('Início', true, 'C9DCF1'),
          wCell('Fim', true, 'C9DCF1'),
          wCell('Estratégias', true, 'C9DCF1'),
        ],
      }),
    ]
    for (const item of items) {
      rows.push(new TableRow({
        children: [
          wCell(formatQuestion(item.skill)),
          wCell(item.area),
          wCell(STATUS[item.status]),
          wCell(item.startDate ? new Date(item.startDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'),
          wCell(item.endDate ? new Date(item.endDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'),
          wCell(item.estrategias || '—'),
        ],
      }))
    }
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }))
    sections.push(new Paragraph({ text: '' }))
  }

  const doc = new Document({ sections: [{ children: sections }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `PEI_${studentInfo.name}_${studentInfo.date}.docx`)
}

export default function PortagePEI({ hook, setView }: Props) {
  const { current, getItemsByResponse } = hook
  const [pei, setPei] = useState<PEIItem[]>(() => current ? loadPEI(current.id) : [])
  const [tab, setTab] = useState<'select' | 'plan'>('select')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<PEIItem>>({})
  const [exporting, setExporting] = useState(false)

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

  const handleExport = async () => {
    setExporting(true)
    try { await exportPEIWord(current, pei) } finally { setExporting(false) }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button type="button" onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900">Plano de Ensino Individualizado</p>
          <p className="text-xs text-gray-400">{current.studentInfo.name}{current.studentInfo.age ? ` · ${current.studentInfo.age}` : ''}</p>
        </div>
        <button type="button" onClick={() => setView('results')} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <BarChart3 className="w-3.5 h-3.5" /> Resultados
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || pei.length === 0}
          className="flex items-center gap-1.5 text-xs bg-purple-600 text-white rounded-lg px-3 py-1.5 hover:bg-purple-700 transition disabled:opacity-50 font-medium"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Exportar Word
        </button>
      </div>

      {/* Info aluno */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Aluno</p><p className="text-sm font-semibold text-gray-800 truncate">{current.studentInfo.name}</p></div>
        <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Idade</p><p className="text-sm font-semibold text-gray-800">{current.studentInfo.age || '—'}</p></div>
        <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Diagnóstico</p><p className="text-sm font-semibold text-gray-800 truncate">{current.studentInfo.diagnosis || '—'}</p></div>
        <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">Avaliação</p><p className="text-sm font-semibold text-gray-800">{current.studentInfo.date}</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {[
          { k: 'select', label: `Selecionar Habilidades`, count: allPriority.length },
          { k: 'plan', label: `Plano PEI`, count: pei.length },
        ].map(t => (
          <button key={t.k} type="button" onClick={() => setTab(t.k as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.k ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Select tab */}
      {tab === 'select' && (
        <div className="space-y-2">
          {allPriority.length === 0 && (
            <div className="text-center py-16 text-gray-300">
              <p className="text-sm">Responda o questionário primeiro para ver as habilidades prioritárias.</p>
            </div>
          )}
          {naoItems.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Alta Prioridade — Não adquiridas
              </p>
              <div className="space-y-2">
                {naoItems.map(item => {
                  const added = inPEI(item.text)
                  return (
                    <div key={item.id} className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">{formatQuestion(item.text)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.area} · {item.age_range}</p>
                      </div>
                      <button type="button"
                        onClick={() => added ? remove(pei.find(p => p.skill === item.text)!.id) : add(item)}
                        className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition ${added ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      >
                        {added ? '✓ Adicionado' : <span className="flex items-center gap-1"><Plus className="w-3 h-3" />Adicionar</span>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {avItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Em Desenvolvimento — Às vezes
              </p>
              <div className="space-y-2">
                {avItems.map(item => {
                  const added = inPEI(item.text)
                  return (
                    <div key={item.id} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">{formatQuestion(item.text)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.area} · {item.age_range}</p>
                      </div>
                      <button type="button"
                        onClick={() => added ? remove(pei.find(p => p.skill === item.text)!.id) : add(item)}
                        className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition ${added ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                      >
                        {added ? '✓ Adicionado' : <span className="flex items-center gap-1"><Plus className="w-3 h-3" />Adicionar</span>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Plan tab */}
      {tab === 'plan' && (
        <div className="space-y-6">
          {pei.length === 0 && (
            <div className="text-center py-16 text-gray-300">
              <p className="text-sm">Nenhuma habilidade no PEI ainda.</p>
              <button type="button" onClick={() => setTab('select')} className="mt-3 text-xs text-purple-500 hover:text-purple-700">Selecionar habilidades →</button>
            </div>
          )}
          {(['curto', 'medio', 'longo'] as const).map(prazo => {
            const items = grouped[prazo]
            if (items.length === 0) return null
            return (
              <div key={prazo}>
                <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-semibold border ${PRAZO_COLOR[prazo]} ${PRAZO_BORDER[prazo]}`}>
                  {PRAZO[prazo]}
                </div>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${PRAZO_BORDER[prazo]}`}>
                      {editId === item.id ? (
                        <div className="p-4 space-y-3">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed">{formatQuestion(item.skill)}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Prazo</label>
                              <select value={editForm.prazo || item.prazo} onChange={e => setEditForm(f => ({ ...f, prazo: e.target.value as PEIItem['prazo'] }))}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="curto">Curto (3 meses)</option>
                                <option value="medio">Médio (6 meses)</option>
                                <option value="longo">Longo (9–12 meses)</option>
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
                            <button type="button" onClick={saveEdit} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                              <Save className="w-3 h-3" /> Salvar
                            </button>
                            <button type="button" onClick={() => { setEditId(null); setEditForm({}) }} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 leading-relaxed font-medium">{formatQuestion(item.skill)}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.area} · {item.ageRange}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.status]}`}>{STATUS[item.status]}</span>
                                {item.startDate && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Início: {new Date(item.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                                {item.endDate && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Fim: {new Date(item.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
                              </div>
                              {item.estrategias && (
                                <div className="mt-3 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1 font-medium">Estratégias</p>
                                  <p className="text-xs text-gray-600 leading-relaxed">{item.estrategias}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 shrink-0">
                              <button type="button" onClick={() => { setEditId(item.id); setEditForm(item) }} className="text-xs border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition">Editar</button>
                              <button type="button" onClick={() => remove(item.id)} className="text-xs text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-1">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {pei.length > 0 && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Exportar PEI em Word
            </button>
          )}
        </div>
      )}
    </div>
  )
}
