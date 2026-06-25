import { useState, useCallback } from 'react'
import rawItems from '../portageData.json'
import type { PortageItem, ResponseType, StudentInfo, Assessment } from '../types'

export const portageItems: PortageItem[] = rawItems as PortageItem[]

const STORAGE_KEY = 'portage_assessments'

function load(): Assessment[] {
  try {
    const data: Assessment[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    // Retrocompatibilidade: assessments antigos sem childId recebem um derivado de nome+data
    return data.map(a => a.childId ? a : {
      ...a,
      childId: `c_${(a.studentInfo.name + a.studentInfo.birthDate).toLowerCase().replace(/\W/g, '_')}`,
    })
  } catch { return [] }
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
    const childId = `c_${(info.name + info.birthDate).toLowerCase().replace(/\W/g, '_')}`
    const a: Assessment = { id, childId, studentInfo: info, responses: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    setAssessments(prev => { const next = [...prev, a]; save(next); return next })
    setCurrentId(id)
    return id
  }, [])

  // Reavaliação: nova avaliação com os mesmos dados da criança, data atual, respostas zeradas
  const reAssess = useCallback((sourceId: string): string => {
    const id = `a_${Date.now()}`
    setAssessments(prev => {
      const source = prev.find(a => a.id === sourceId)
      if (!source) return prev
      const newInfo: StudentInfo = {
        ...source.studentInfo,
        date: new Date().toLocaleDateString('pt-BR'),
      }
      const a: Assessment = {
        id,
        childId: source.childId,
        studentInfo: newInfo,
        responses: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const next = [...prev, a]
      save(next)
      return next
    })
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

  const batchUpdateResponses = useCallback((itemIds: string[], response: ResponseType) => {
    setAssessments(prev => {
      const next = prev.map(a => {
        if (a.id !== currentId) return a
        const newResponses = { ...a.responses }
        for (const id of itemIds) newResponses[id] = response
        return { ...a, responses: newResponses, updatedAt: new Date().toISOString() }
      })
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

  // Retorna todas as avaliações da mesma criança (mesmo childId), ordenadas por data
  const getSiblingAssessments = useCallback((assessmentId: string): Assessment[] => {
    const source = assessments.find(a => a.id === assessmentId)
    if (!source) return []
    return assessments
      .filter(a => a.childId === source.childId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [assessments])

  return {
    assessments, current, currentId, setCurrentId,
    createAssessment, reAssess, updateResponse, batchUpdateResponses,
    deleteAssessment, getAreaStats, getItemsByResponse, getProgress, getSiblingAssessments,
  }
}

export type AssessmentHook = ReturnType<typeof usePortageAssessment>
