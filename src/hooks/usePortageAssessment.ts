import { useState, useCallback } from 'react'
import rawItems from '../portageData.json'
import type { PortageItem, ResponseType, StudentInfo, Assessment } from '../types'

export const portageItems: PortageItem[] = rawItems as PortageItem[]

const STORAGE_KEY = 'portage_assessments'

function load(): Assessment[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function save(data: Assessment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function usePortageAssessment() {
  const [assessments, setAssessments] = useState<Assessment[]>(load)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const current = assessments.find(a => a.id === currentId) ?? null

  const createAssessment = useCallback((info: StudentInfo): string => {
    const id = `a_${Date.now()}`
    const a: Assessment = { id, studentInfo: info, responses: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setAssessments(prev => { const next = [...prev, a]; save(next); return next })
    setCurrentId(id)
    return id
  }, [])

  const updateResponse = useCallback((itemId: string, response: ResponseType) => {
    setAssessments(prev => {
      const next = prev.map(a => a.id === currentId ? { ...a, responses: { ...a.responses, [itemId]: response }, updatedAt: new Date().toISOString() } : a)
      save(next)
      return next
    })
  }, [currentId])

  const deleteAssessment = useCallback((id: string) => {
    setAssessments(prev => { const next = prev.filter(a => a.id !== id); save(next); return next })
    if (currentId === id) setCurrentId(null)
  }, [currentId])

  const getAreaStats = useCallback((assessmentId?: string) => {
    const a = assessmentId ? assessments.find(x => x.id === assessmentId) : current
    if (!a) return {}
    const stats: Record<string, { sim: number; nao: number; av: number; total: number }> = {}
    for (const item of portageItems) {
      if (!stats[item.area]) stats[item.area] = { sim: 0, nao: 0, av: 0, total: 0 }
      stats[item.area].total++
      const r = a.responses[item.id]
      if (r === 'sim') stats[item.area].sim++
      else if (r === 'nao') stats[item.area].nao++
      else if (r === 'as_vezes') stats[item.area].av++
    }
    return stats
  }, [assessments, current])

  const getItemsByResponse = useCallback((response: ResponseType): PortageItem[] => {
    if (!current) return []
    return portageItems.filter(i => current.responses[i.id] === response)
  }, [current])

  const getProgress = useCallback(() => {
    if (!current) return 0
    const answered = Object.values(current.responses).filter(v => v !== null).length
    return Math.round((answered / portageItems.length) * 100)
  }, [current])

  return { assessments, current, currentId, setCurrentId, createAssessment, updateResponse, deleteAssessment, getAreaStats, getItemsByResponse, getProgress }
}

export type AssessmentHook = ReturnType<typeof usePortageAssessment>
