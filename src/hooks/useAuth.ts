import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password })

  const signOut = () => supabase.auth.signOut()

  const resetPassword = (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://inventarioavaliacaoinfantil.vercel.app',
    })

  return { user, session, loading, signIn, signUp, signOut, resetPassword }
}
