import { useState, useCallback, useEffect } from 'react'
import rawItems from '../portageData.json'
import type { PortageItem, ResponseType, StudentInfo, Assessment } from '../types'
import { supabase } from '../lib/supabase'

export const portageItems: PortageItem[] = rawItems as PortageItem[]

function rowToAssessment(row: Record<string, unknown>): Assessment {
  return {
    id: row.id as string,
    childId: row.child_id as string,
    studentInfo: row.student_info as StudentInfo,
    responses: (row.responses ?? {}) as Record<string, ResponseType>,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export function usePortageAssessment(userId: string | null) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (!userId) { setAssessments([]); setSynced(false); return }

    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setAssessments(data ? data.map(rowToAssessment) : [])
        setSynced(true)
      })
  }, [userId])

  const current = assessments.find(a => a.id === currentId) ?? null

  const upsertRemote = useCallback(async (a: Assessment) => {
    if (!userId) return
    await supabase.from('assessments').upsert({
      id: a.id,
      child_id: a.childId,
      user_id: userId,
      student_info: a.studentInfo,
      responses: a.responses,
      updated_at: new Date().toISOString(),
    })
  }, [userId])

  const createAssessment = useCallback((info: StudentInfo, explicitChildId?: string): string => {
    const id = `a_${crypto.randomUUID()}`
    const childId = explicitChildId ?? `c_${(info.name + info.birthDate).toLowerCase().replace(/\W/g, '_')}`
    const a: Assessment = {
      id, childId, studentInfo: info, responses: {},
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    }
    setAssessments(prev => [...prev, a])
    setCurrentId(id)
    upsertRemote(a)
    return id
  }, [upsertRemote])

  const reAssess = useCallback((sourceId: string): string => {
    const id = `a_${crypto.randomUUID()}`
    setAssessments(prev => {
      const source = prev.find(a => a.id === sourceId)
      if (!source) return prev
      const newInfo: StudentInfo = { ...source.studentInfo, date: new Date().toLocaleDateString('pt-BR') }
      const a: Assessment = {
        id, childId: source.childId, studentInfo: newInfo, responses: {},
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      upsertRemote(a)
      return [...prev, a]
    })
    setCurrentId(id)
    return id
  }, [upsertRemote])

  const updateResponse = useCallback((itemId: string, response: ResponseType) => {
    setAssessments(prev => {
      const next = prev.map(a => a.id === currentId
        ? { ...a, responses: { ...a.responses, [itemId]: response }, updatedAt: new Date().toISOString() }
        : a)
      const updated = next.find(a => a.id === currentId)
      if (updated) upsertRemote(updated)
      return next
    })
  }, [currentId, upsertRemote])

  const batchUpdateResponses = useCallback((itemIds: string[], response: ResponseType) => {
    setAssessments(prev => {
      const next = prev.map(a => {
        if (a.id !== currentId) return a
        const newResponses = { ...a.responses }
        for (const id of itemIds) newResponses[id] = response
        return { ...a, responses: newResponses, updatedAt: new Date().toISOString() }
      })
      const updated = next.find(a => a.id === currentId)
      if (updated) upsertRemote(updated)
      return next
    })
  }, [currentId, upsertRemote])

  const deleteAssessment = useCallback((id: string) => {
    setAssessments(prev => prev.filter(a => a.id !== id))
    if (currentId === id) setCurrentId(null)
    if (userId) supabase.from('assessments').delete().eq('id', id)
  }, [currentId, userId])

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

  const getSiblingAssessments = useCallback((assessmentId: string): Assessment[] => {
    const source = assessments.find(a => a.id === assessmentId)
    if (!source) return []
    return assessments
      .filter(a => a.childId === source.childId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }, [assessments])

  return {
    assessments, current, currentId, setCurrentId, synced,
    createAssessment, reAssess, updateResponse, batchUpdateResponses,
    deleteAssessment, getAreaStats, getItemsByResponse, getProgress, getSiblingAssessments,
  }
}

export type AssessmentHook = ReturnType<typeof usePortageAssessment>
