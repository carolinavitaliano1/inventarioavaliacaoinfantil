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
        if (payload.eventType === 'DELETE') { setSubscription(null); return }
        const d = payload.new as any
        setSubscription({ plan: d.plan, status: d.status, current_period_end: d.current_period_end })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  const ADMIN_EMAILS = ['carolinavitaliano1@gmail.com']
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email)

  // Trial gratuito de 3 dias a partir da criação da conta — sem barreira de pagamento
  const TRIAL_DAYS = 3
  const createdMs = user?.created_at ? new Date(user.created_at).getTime() : null
  const trialEndsMs = createdMs !== null ? createdMs + TRIAL_DAYS * 24 * 60 * 60 * 1000 : null
  const inTrial = trialEndsMs !== null && Date.now() < trialEndsMs
  const trialDaysLeft = trialEndsMs !== null
    ? Math.max(0, Math.ceil((trialEndsMs - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0

  const hasPaid = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isActive = isAdmin || hasPaid || inTrial

  const createCheckout = async (plan: string): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null
    const res = await supabase.functions.invoke('rapid-worker', {
      body: { plan },
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    return res.data?.url ?? null
  }

  return { subscription, loadingSub, isActive, createCheckout, inTrial, trialDaysLeft, hasPaid }
}
