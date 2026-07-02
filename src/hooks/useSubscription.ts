import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Subscription {
  plan: 'trimestral' | 'anual' | null
  status: string
  current_period_end: string | null
}

export function useSubscription(user: User | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSub, setLoadingSub] = useState(true)

  useEffect(() => {
    if (!user) { setSubscription(null); setLoadingSub(false); return }

    const fetch = async () => {
      setLoadingSub(true)
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()
      setSubscription(data ?? null)
      setLoadingSub(false)
    }

    fetch()

    // Ouve mudanças em tempo real (quando webhook atualiza)
    const channel = supabase
      .channel('subscription_changes')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const d = payload.new as any
        setSubscription({ plan: d.plan, status: d.status, current_period_end: d.current_period_end })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const ADMIN_EMAILS = ['carolinavitaliano1@gmail.com']
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email)
  const isActive = isAdmin || subscription?.status === 'active' || subscription?.status === 'trialing'

  const createCheckout = async (priceId: string, plan: string): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null
    const res = await supabase.functions.invoke('rapid-worker', {
      body: { priceId, plan },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    return res.data?.url ?? null
  }

  return { subscription, loadingSub, isActive, createCheckout }
}
