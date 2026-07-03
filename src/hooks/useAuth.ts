import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRecovery, setIsRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true)
      }
      if (event === 'USER_UPDATED') {
        setIsRecovery(false)
        // Clean hash from URL after password update
        window.history.replaceState({}, '', window.location.pathname)
      }
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

  const clearRecovery = () => setIsRecovery(false)

  return { user, session, loading, isRecovery, signIn, signUp, signOut, resetPassword, clearRecovery }
}
