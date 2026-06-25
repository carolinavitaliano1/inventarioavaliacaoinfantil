import { useState } from 'react'
import {
  ArrowLeft, Plus, Eye, BarChart3, BookOpen, RefreshCw, Trash2,
  FileDown, Loader2, TrendingUp, TrendingDown, Minus, Camera, Edit2, Save, X
} from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import type { PatientsHook } from '../hooks/usePatients'
import type { Patient, PortageItem, ResponseType } from '../types'
import { AREAS } from '../types'
import type { View } from '../App'
import { calcAge, calcAreaDevResult } from '../utils/ageCalc'
import { exportProgressReport } from '../utils/exportProgressReport'

interface Props {
  patientId: string
  patientsHook: PatientsHook
  assessmentHook: AssessmentHook
  setView: (v: View) => void
  onBack: () => void
}

function getAreaResults(responses: Record<string, ResponseType>) {
  return AREAS.map(area => {
    const items = portageItems.filter(i => i.area === area)
    return calcAreaDevResult(area, items as PortageItem[], responses)
  })
}

const AREA_SHORT: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO': 'Social',
  'II - ÁREA LINGUAGEM': 'Linguagem',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'Cuidados',
  'IV- ÁREA COGNITIVA': 'Cognitiva',
  'V. ÁREA PSICOMOTORA': 'Psicomotora',
}

export default function PatientDetail({ patientId, patientsHook, assessmentHook, setView, onBack }: Props) {
  const { getPatient, updatePatient } = patientsHook
  const { assessments, createAssessment, reAssess, deleteAssessment, setCurrentId } = assessmentHook
  const [tab, setTab] = useState<'assessments' | 'progress'>('assessments')
  const [exporting, setExporting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Patient>>({})
  const [photoInput, setPhotoInput] = useState<HTMLInputElement | null>(null)

  const patient = getPatient(patientId)
  if (!patient) return null

  const patientAssessments = assessments
    .filter(a => a.childId === patientId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const handleNewAssessment = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    createAssessment({
      name: patient.name,
      birthDate: patient.birthDate,
      diagnosis: patient.diagnosis,
      age: patient.birthDate ? calcAge(patient.birthDate) : '',
      date: today,
    }, patientId)
    setView('questionnaire')
  }

  const open = (id: string, v: View) => { setCurrentId(id); setView(v) }

  const handleExport = async () => {
    setExporting(true)
    try { await exportProgressReport(patient, patientAssessments) } finally { setExporting(false) }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const b64 = ev.target?.result as string
      setEditForm(f => ({ ...f, photoBase64: b64 }))
    }
    reader.readAsDataURL(file)
  }

  const saveEdit = () => {
    updatePatient(patientId, editForm)
    setEditMode(false)
    setEditForm({})
  }

  // Progression data
  const progressData = patientAssessments.map(a => ({
    assessment: a,
    areaResults: getAreaResults(a.responses as Record<string, ResponseType>),
    answeredPct: Math.round((Object.values(a.responses).filter(Boolean).length / portageItems.length) * 100),
  }))

  const age = patient.birthDate ? calcAge(patient.birthDate) : null
  const displayPhoto = editMode ? (editForm.photoBase64 ?? patient.photoBase64) : patient.photoBase64

  return (
    <div className="max-w-3xl mx-auto p-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onBack} className="p-2 rounded-lg hover:bg-white/70 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400">Paciente</p>
          <p className="font-bold text-gray-900 truncate">{patient.name}</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || patientAssessments.length === 0}
          className="flex items-center gap-1.5 text-xs bg-purple-600 text-white rounded-lg px-3 py-1.5 hover:bg-purple-700 transition disabled:opacity-50 font-medium"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Relatório Word
        </button>
      </div>

      {/* Patient card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        {editMode ? (
          <div className="space-y-3">
            <div className="flex items-center gap-4 mb-2">
              <div
                onClick={() => photoInput?.click()}
                className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden shrink-0"
              >
                {displayPhoto ? (
                  <img src={displayPhoto} alt="foto" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Clique na foto para alterar</p>
                {displayPhoto && (
                  <button type="button" onClick={() => setEditForm(f => ({ ...f, photoBase64: '' }))} className="text-[10px] text-red-400 mt-0.5">Remover foto</button>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" ref={el => setPhotoInput(el)} onChange={handlePhotoChange} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nome', key: 'name', placeholder: patient.name },
                { label: 'Responsável', key: 'responsibleName', placeholder: patient.responsibleName },
                { label: 'Diagnóstico', key: 'diagnosis', placeholder: patient.diagnosis },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={(editForm as any)[key] ?? (patient as any)[key] ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data de Nascimento</label>
                <input type="date" value={editForm.birthDate ?? patient.birthDate ?? ''}
                  onChange={e => setEditForm(f => ({ ...f, birthDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveEdit} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
                <Save className="w-3 h-3" /> Salvar
              </button>
              <button type="button" onClick={() => { setEditMode(false); setEditForm({}) }} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                <X className="w-3 h-3 inline mr-1" />Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 overflow-hidden shrink-0 flex items-center justify-center">
              {patient.photoBase64 ? (
                <img src={patient.photoBase64} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-purple-600 font-bold text-2xl">{patient.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight">{patient.name}</p>
                  {patient.diagnosis && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full inline-block mt-1">{patient.diagnosis}</span>}
                </div>
                <button type="button" onClick={() => setEditMode(true)} className="text-gray-300 hover:text-gray-500 p-1 shrink-0">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                {age && <span><span className="text-gray-400">Idade:</span> {age}</span>}
                {patient.birthDate && <span><span className="text-gray-400">Nasc.:</span> {patient.birthDate}</span>}
                {patient.responsibleName && <span><span className="text-gray-400">Resp.:</span> {patient.responsibleName}</span>}
                <span><span className="text-gray-400">Cadastro:</span> {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {[
          { k: 'assessments', label: 'Avaliações', count: patientAssessments.length },
          { k: 'progress', label: 'Progressão', count: null },
        ].map(t => (
          <button key={t.k} type="button" onClick={() => setTab(t.k as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${tab === t.k ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
            {t.count !== null && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.k ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Assessments tab */}
      {tab === 'assessments' && (
        <div>
          <button
            type="button"
            onClick={handleNewAssessment}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold shadow hover:bg-purple-700 transition mb-4"
          >
            <Plus className="w-4 h-4" /> Nova Avaliação
          </button>

          {patientAssessments.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <p className="text-sm">Nenhuma avaliação ainda. Clique acima para iniciar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...patientAssessments].reverse().map((a, revIdx) => {
                const num = patientAssessments.length - revIdx
                const answered = Object.values(a.responses).filter(Boolean).length
                const pct = Math.round((answered / portageItems.length) * 100)
                const nao = Object.values(a.responses).filter(v => v === 'nao').length
                const av = Object.values(a.responses).filter(v => v === 'as_vezes').length
                return (
                  <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Avaliação {num}</span>
                          <span className="text-xs text-gray-400">{a.studentInfo.date}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                          <span className="text-gray-500">{pct}% respondido</span>
                          {answered > 0 && <>
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Não: {nao}</span>
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Às vezes: {av}</span>
                          </>}
                        </div>
                        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
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
          )}
        </div>
      )}

      {/* Progress tab */}
      {tab === 'progress' && (
        <div>
          {progressData.length < 2 ? (
            <div className="text-center py-16 text-gray-300">
              <TrendingUp className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm text-gray-400">São necessárias pelo menos 2 avaliações para exibir a progressão.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary progression table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
                  <p className="text-xs font-semibold text-purple-700">Idades Desenvolvimentais por Área</p>
                  <p className="text-[10px] text-purple-400 mt-0.5">↑ progressão · ↓ regressão · → estável</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Área</th>
                        {progressData.map((pd, i) => (
                          <th key={pd.assessment.id} className="text-center px-3 py-2 text-gray-500 font-medium whitespace-nowrap">
                            Av. {i + 1}<br /><span className="text-[10px] font-normal text-gray-400">{pd.assessment.studentInfo.date}</span>
                          </th>
                        ))}
                        <th className="text-center px-3 py-2 text-gray-500 font-medium">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AREAS.map((area, aIdx) => {
                        const values = progressData.map(pd => pd.areaResults[aIdx].idadeDesenvAnos)
                        const labels = progressData.map(pd => pd.areaResults[aIdx].idadeDesenvLabel)
                        const totalVar = values[values.length - 1] - values[0]
                        return (
                          <tr key={area} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-2.5 text-gray-700 font-medium">{AREA_SHORT[area] ?? area}</td>
                            {labels.map((label, i) => {
                              const prev = i > 0 ? values[i - 1] : null
                              const curr = values[i]
                              const diff = prev !== null ? curr - prev : 0
                              return (
                                <td key={i} className="px-3 py-2.5 text-center">
                                  <span className="text-gray-800 font-medium">{label}</span>
                                  {i > 0 && (
                                    <span className={`ml-1 font-bold ${diff > 0.05 ? 'text-green-500' : diff < -0.05 ? 'text-red-500' : 'text-gray-400'}`}>
                                      {diff > 0.05 ? '↑' : diff < -0.05 ? '↓' : '→'}
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex items-center gap-0.5 font-semibold ${totalVar > 0.05 ? 'text-green-600' : totalVar < -0.05 ? 'text-red-500' : 'text-gray-500'}`}>
                                {totalVar > 0.05 ? <TrendingUp className="w-3 h-3" /> : totalVar < -0.05 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                {totalVar > 0 ? '+' : ''}{totalVar.toFixed(1)}a
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {/* Média geral */}
                      <tr className="bg-purple-50">
                        <td className="px-4 py-2.5 text-purple-700 font-bold">Média Geral</td>
                        {progressData.map((pd, i) => {
                          const avg = pd.areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / pd.areaResults.length
                          const prevAvg = i > 0
                            ? progressData[i - 1].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[i - 1].areaResults.length
                            : null
                          const diff = prevAvg !== null ? avg - prevAvg : 0
                          return (
                            <td key={i} className="px-3 py-2.5 text-center">
                              <span className="text-purple-800 font-bold">{avg.toFixed(2)}a</span>
                              {i > 0 && (
                                <span className={`ml-1 font-bold ${diff > 0.05 ? 'text-green-500' : diff < -0.05 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {diff > 0.05 ? '↑' : diff < -0.05 ? '↓' : '→'}
                                </span>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-3 py-2.5 text-center">
                          {(() => {
                            const first = progressData[0].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[0].areaResults.length
                            const last = progressData[progressData.length - 1].areaResults.reduce((s, r) => s + r.idadeDesenvAnos, 0) / progressData[progressData.length - 1].areaResults.length
                            const d = last - first
                            return (
                              <span className={`inline-flex items-center gap-0.5 font-bold ${d > 0.05 ? 'text-green-600' : d < -0.05 ? 'text-red-500' : 'text-gray-500'}`}>
                                {d > 0.05 ? <TrendingUp className="w-3 h-3" /> : d < -0.05 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                {d > 0 ? '+' : ''}{d.toFixed(2)}a
                              </span>
                            )
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-area mini cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AREAS.map((area, aIdx) => {
                  const values = progressData.map(pd => pd.areaResults[aIdx].idadeDesenvAnos)
                  const totalVar = values[values.length - 1] - values[0]
                  return (
                    <div key={area} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">{AREA_SHORT[area] ?? area}</p>
                      <div className="flex items-end gap-2 flex-wrap">
                        {progressData.map((_pd, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[10px] text-gray-400">Av.{i + 1}</div>
                            <div className={`text-sm font-bold ${i === progressData.length - 1 ? 'text-purple-700' : 'text-gray-500'}`}>
                              {values[i].toFixed(1)}a
                            </div>
                            {i < progressData.length - 1 && <div className="text-gray-300 text-xs">→</div>}
                          </div>
                        ))}
                      </div>
                      <div className={`mt-2 text-xs font-semibold flex items-center gap-1 ${totalVar > 0.05 ? 'text-green-600' : totalVar < -0.05 ? 'text-red-500' : 'text-gray-400'}`}>
                        {totalVar > 0.05 ? <TrendingUp className="w-3 h-3" /> : totalVar < -0.05 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {totalVar > 0 ? '+' : ''}{totalVar.toFixed(2)} anos no período
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow disabled:opacity-50"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Exportar Relatório de Acompanhamento em Word
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
