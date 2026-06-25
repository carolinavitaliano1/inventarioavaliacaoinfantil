import { useState, useCallback } from 'react'
import type { Patient } from '../types'

const KEY = 'portage_patients'

function load(): Patient[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function save(data: Patient[]) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(load)

  const createPatient = useCallback((data: Omit<Patient, 'id' | 'createdAt'>): Patient => {
    const p: Patient = { ...data, id: `p_${Date.now()}`, createdAt: new Date().toISOString() }
    setPatients(prev => { const next = [...prev, p]; save(next); return next })
    return p
  }, [])

  const updatePatient = useCallback((id: string, data: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
    setPatients(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data } : p)
      save(next)
      return next
    })
  }, [])

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => { const next = prev.filter(p => p.id !== id); save(next); return next })
  }, [])

  const getPatient = useCallback((id: string) => {
    return patients.find(p => p.id === id) ?? null
  }, [patients])

  return { patients, createPatient, updatePatient, deletePatient, getPatient }
}

export type PatientsHook = ReturnType<typeof usePatients>
