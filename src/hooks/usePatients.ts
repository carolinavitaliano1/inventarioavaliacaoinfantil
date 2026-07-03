import { useState, useCallback, useEffect } from 'react'
import type { Patient } from '../types'
import { supabase } from '../lib/supabase'

function rowToPatient(row: Record<string, unknown>): Patient {
  return {
    id: row.id as string,
    name: row.name as string,
    birthDate: row.birth_date as string,
    diagnosis: (row.diagnosis as string) ?? '',
    responsibleName: (row.responsible_name as string) ?? '',
    photoBase64: row.photo_base64 as string | undefined,
    createdAt: row.created_at as string,
  }
}

export function usePatients(userId?: string | null) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setPatients([]); setLoading(false); return }

    setLoading(true)
    supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setPatients(data ? data.map(rowToPatient) : [])
        setLoading(false)
      })

    const channel = supabase
      .channel('patients_changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'patients',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPatients(prev => [...prev, rowToPatient(payload.new as Record<string, unknown>)])
        } else if (payload.eventType === 'UPDATE') {
          setPatients(prev => prev.map(p => p.id === (payload.new as any).id ? rowToPatient(payload.new as Record<string, unknown>) : p))
        } else if (payload.eventType === 'DELETE') {
          setPatients(prev => prev.filter(p => p.id !== (payload.old as any).id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const createPatient = useCallback(async (data: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
    const id = `p_${Date.now()}`
    const { data: row, error } = await supabase
      .from('patients')
      .insert({
        id,
        user_id: userId,
        name: data.name,
        birth_date: data.birthDate,
        diagnosis: data.diagnosis,
        responsible_name: data.responsibleName,
        photo_base64: data.photoBase64 ?? null,
      })
      .select()
      .single()

    if (error) throw error
    const p = rowToPatient(row)
    setPatients(prev => prev.some(x => x.id === p.id) ? prev : [...prev, p])
    return p
  }, [userId])

  const updatePatient = useCallback(async (id: string, data: Partial<Omit<Patient, 'id' | 'createdAt'>>) => {
    const update: Record<string, unknown> = {}
    if (data.name !== undefined) update.name = data.name
    if (data.birthDate !== undefined) update.birth_date = data.birthDate
    if (data.diagnosis !== undefined) update.diagnosis = data.diagnosis
    if (data.responsibleName !== undefined) update.responsible_name = data.responsibleName
    if (data.photoBase64 !== undefined) update.photo_base64 = data.photoBase64

    await supabase.from('patients').update(update).eq('id', id)
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }, [])

  const deletePatient = useCallback(async (id: string) => {
    await supabase.from('patients').delete().eq('id', id)
    setPatients(prev => prev.filter(p => p.id !== id))
  }, [])

  const getPatient = useCallback((id: string) => {
    return patients.find(p => p.id === id) ?? null
  }, [patients])

  return { patients, loading, createPatient, updatePatient, deletePatient, getPatient }
}

export type PatientsHook = ReturnType<typeof usePatients>
