import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, ArrowLeft, BarChart3, CheckCircle, XCircle, MinusCircle, Circle, Keyboard } from 'lucide-react'
import { portageItems } from '../hooks/usePortageAssessment'
import type { AssessmentHook } from '../hooks/usePortageAssessment'
import { AREAS, AREA_COLOR } from '../types'
import type { ResponseType } from '../types'
import type { View } from '../App'

interface Props { hook: AssessmentHook; setView: (v: View) => void }

function ResponseBtn({ value, current, onClick, shortcut }: { value: ResponseType; current: ResponseType; onClick: () => void; shortcut: string }) {
  const cfg: Record<string, { label: string; icon: React.ReactNode; on: string }> = {
    sim:      { label: 'Sim',      icon: <CheckCircle className="w-3.5 h-3.5" />,  on: 'bg-green-500 text-white border-green-500' },
    nao:      { label: 'Não',      icon: <XCircle className="w-3.5 h-3.5" />,      on: 'bg-red-500 text-white border-red-500' },
    as_vezes: { label: 'Às vezes', icon: <MinusCircle className="w-3.5 h-3.5" />,  on: 'bg-yellow-500 text-white border-yellow-500' },
  }
  const c = cfg[value as string]
  const active = current === value
  return (
    <button onClick={onClick} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${active ? c.on : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
      {active ? c.icon : <Circle className="w-3 h-3 text-gray-300" />}
      {c.label}
      <span className={`ml-0.5 text-[10px] px-1 rounded font-mono ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>{shortcut}</span>
    </button>
  )
}

export default function PortageQuestionnaire({ hook, setView }: Props) {
  const { current, updateResponse, getProgress } = hook
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set([AREAS[0]]))
  const [expandedAges, setExpandedAges] = useState<Set<string>>(new Set())
  const [onlyUnanswered, setOnlyUnanswered] = useState(false)
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const grouped = useMemo(() => {
    const r: Record<string, Record<string, typeof portageItems>> = {}
    for (const item of portageItems) {
      if (!r[item.area]) r[item.area] = {}
      if (!r[item.area][item.age_range]) r[item.area][item.age_range] = []
      r[item.area][item.age_range].push(item)
    }
    return r
  }, [])

  // Flat list of visible items for keyboard navigation
  const visibleItems = useMemo(() => {
    const items: typeof portageItems = []
    for (const area of AREAS) {
      if (!expandedAreas.has(area)) continue
      const ages = grouped[area] || {}
      for (const [ageRange, ageItems] of Object.entries(ages)) {
        const key = `${area}__${ageRange}`
        if (!expandedAges.has(key)) continue
        for (const item of (onlyUnanswered ? ageItems.filter(i => !current?.responses[i.id]) : ageItems)) {
          items.push(item)
        }
      }
    }
    return items
  }, [grouped, expandedAreas, expandedAges, onlyUnanswered, current?.responses])

  if (!current) return null
  const { responses } = current
  const progress = getProgress()

  const toggleArea = (a: string) => setExpandedAreas(p => { const n = new Set(p); n.has(a) ? n.delete(a) : n.add(a); return n })
  const toggleAge = (k: string) => setExpandedAges(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })

  // Mark all items with given response
  const markAll = (resp: ResponseType) => {
    for (const item of portageItems) {
      updateResponse(item.id, resp)
    }
  }

  // Keyboard shortcuts: S=sim, A=às vezes, N=não (when item is focused)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!focusedItemId) return
      const key = e.key.toLowerCase()
      if (key === 's') { e.preventDefault(); updateResponse(focusedItemId, responses[focusedItemId] === 'sim' ? null : 'sim') }
      else if (key === 'n') { e.preventDefault(); updateResponse(focusedItemId, responses[focusedItemId] === 'nao' ? null : 'nao') }
      else if (key === 'a') { e.preventDefault(); updateResponse(focusedItemId, responses[focusedItemId] === 'as_vezes' ? null : 'as_vezes') }
      // Tab/ArrowDown/ArrowUp to navigate items
      else if (key === 'arrowdown' || key === 'tab') {
        e.preventDefault()
        const idx = visibleItems.findIndex(i => i.id === focusedItemId)
        const next = visibleItems[idx + 1]
        if (next) { setFocusedItemId(next.id); document.getElementById(`item-${next.id}`)?.scrollIntoView({ block: 'nearest' }) }
      } else if (key === 'arrowup') {
        e.preventDefault()
        const idx = visibleItems.findIndex(i => i.id === focusedItemId)
        const prev = visibleItems[idx - 1]
        if (prev) { setFocusedItemId(prev.id); document.getElementById(`item-${prev.id}`)?.scrollIntoView({ block: 'nearest' }) }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [focusedItemId, responses, updateResponse, visibleItems])

  return (
    <div className="max-w-3xl mx-auto p-4 py-6" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => setView('home')} className="p-2 rounded-lg hover:bg-white/70 transition"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{current.studentInfo.name}</p>
          <p className="text-xs text-gray-400">{current.studentInfo.diagnosis && `${current.studentInfo.diagnosis} · `}{current.studentInfo.date}</p>
        </div>
        <button onClick={() => setShowShortcuts(s => !s)} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <Keyboard className="w-3.5 h-3.5" /> Atalhos
        </button>
        <button onClick={() => setView('results')} className="flex items-center gap-1 text-xs border border-gray-200 bg-white rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
          <BarChart3 className="w-3.5 h-3.5" /> Resultados
        </button>
      </div>

      {/* Atalhos de teclado */}
      {showShortcuts && (
        <div className="bg-gray-800 text-white rounded-2xl p-4 mb-4 text-xs space-y-2">
          <p className="font-semibold text-gray-300 mb-2">Atalhos de teclado (clique em uma questão primeiro)</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2"><kbd className="bg-green-500 text-white px-2 py-0.5 rounded font-mono font-bold">S</kbd><span>Marcar Sim</span></div>
            <div className="flex items-center gap-2"><kbd className="bg-red-500 text-white px-2 py-0.5 rounded font-mono font-bold">N</kbd><span>Marcar Não</span></div>
            <div className="flex items-center gap-2"><kbd className="bg-yellow-500 text-white px-2 py-0.5 rounded font-mono font-bold">A</kbd><span>Marcar Às vezes</span></div>
            <div className="flex items-center gap-2"><kbd className="bg-gray-600 px-2 py-0.5 rounded font-mono">↓ Tab</kbd><span>Próxima questão</span></div>
            <div className="flex items-center gap-2"><kbd className="bg-gray-600 px-2 py-0.5 rounded font-mono">↑</kbd><span>Questão anterior</span></div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-bold text-purple-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span><span className="text-green-500 font-medium">Sim:</span> {portageItems.filter(i => responses[i.id] === 'sim').length}</span>
          <span><span className="text-red-500 font-medium">Não:</span> {portageItems.filter(i => responses[i.id] === 'nao').length}</span>
          <span><span className="text-yellow-500 font-medium">Às vezes:</span> {portageItems.filter(i => responses[i.id] === 'as_vezes').length}</span>
        </div>
      </div>

      {/* Marcar tudo + Filtro */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setOnlyUnanswered(false)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${!onlyUnanswered ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-gray-200 text-gray-500'}`}>Todos</button>
        <button onClick={() => setOnlyUnanswered(true)} className={`text-xs px-3 py-1.5 rounded-lg border transition ${onlyUnanswered ? 'bg-purple-600 text-white border-purple-600' : 'bg-white border-gray-200 text-gray-500'}`}>Não respondidos</button>
        <div className="flex-1" />
        <span className="text-xs text-gray-400 self-center">Marcar tudo:</span>
        <button onClick={() => markAll('sim')} className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition font-medium">
          <CheckCircle className="w-3.5 h-3.5" /> Sim
        </button>
        <button onClick={() => markAll('as_vezes')} className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition font-medium">
          <MinusCircle className="w-3.5 h-3.5" /> Às vezes
        </button>
        <button onClick={() => markAll('nao')} className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 transition font-medium">
          <XCircle className="w-3.5 h-3.5" /> Não
        </button>
      </div>

      {/* Areas */}
      <div className="space-y-3">
        {AREAS.map(area => {
          const c = AREA_COLOR[area]
          const areaItems = portageItems.filter(i => i.area === area)
          const answered = areaItems.filter(i => responses[i.id]).length
          const sim = areaItems.filter(i => responses[i.id] === 'sim').length
          const nao = areaItems.filter(i => responses[i.id] === 'nao').length
          const av = areaItems.filter(i => responses[i.id] === 'as_vezes').length
          const expanded = expandedAreas.has(area)
          const ages = grouped[area] || {}

          return (
            <div key={area} className={`rounded-2xl border overflow-hidden shadow-sm ${c.bg}`}>
              <button onClick={() => toggleArea(area)} className={`w-full flex items-center justify-between p-4 text-left ${c.header} text-white hover:opacity-90 transition`}>
                <div>
                  <p className="font-semibold text-sm">{area}</p>
                  <p className="text-xs opacity-75 mt-0.5">{answered}/{areaItems.length} · ✓{sim} ✗{nao} ~{av}</p>
                </div>
                {expanded ? <ChevronDown className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
              </button>

              {expanded && Object.entries(ages).map(([ageRange, items]) => {
                const key = `${area}__${ageRange}`
                const isAgeOpen = expandedAges.has(key)
                const filtered = onlyUnanswered ? items.filter(i => !responses[i.id]) : items
                if (filtered.length === 0) return null
                const ageAnswered = items.filter(i => responses[i.id]).length

                return (
                  <div key={ageRange}>
                    <button onClick={() => toggleAge(key)} className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-white/70 hover:bg-white/90 transition border-t border-white/40">
                      <span className="text-xs font-semibold text-gray-700">{ageRange} <span className="text-gray-400 font-normal">({ageAnswered}/{items.length})</span></span>
                      {isAgeOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isAgeOpen && filtered.map((item, idx) => {
                      const isFocused = focusedItemId === item.id
                      return (
                        <div
                          key={item.id}
                          id={`item-${item.id}`}
                          onClick={() => setFocusedItemId(item.id)}
                          className={`px-4 py-3 border-t border-gray-50 cursor-pointer transition-all ${isFocused ? 'ring-2 ring-inset ring-purple-400 bg-purple-50' : idx % 2 === 0 ? 'bg-white hover:bg-gray-50/50' : 'bg-gray-50/60 hover:bg-gray-50'}`}
                        >
                          <p className="text-sm text-gray-800 mb-2 leading-relaxed">{item.text}</p>
                          <div className="flex gap-2 flex-wrap">
                            <ResponseBtn value="sim" current={responses[item.id] ?? null} shortcut="S" onClick={() => updateResponse(item.id, responses[item.id] === 'sim' ? null : 'sim')} />
                            <ResponseBtn value="nao" current={responses[item.id] ?? null} shortcut="N" onClick={() => updateResponse(item.id, responses[item.id] === 'nao' ? null : 'nao')} />
                            <ResponseBtn value="as_vezes" current={responses[item.id] ?? null} shortcut="A" onClick={() => updateResponse(item.id, responses[item.id] === 'as_vezes' ? null : 'as_vezes')} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <button onClick={() => setView('results')} className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition shadow">
        Ver Resultados
      </button>
    </div>
  )
}
