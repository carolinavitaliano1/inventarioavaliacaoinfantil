import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()
    const { type, data } = body

    if (type !== 'preapproval') {
      return new Response('ok', { status: 200 })
    }

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN')!
    const preapprovalId = data?.id
    if (!preapprovalId) return new Response('ok', { status: 200 })

    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    })
    const sub = await mpRes.json()

    if (!sub.external_reference) return new Response('ok', { status: 200 })

    let ref: { user_id: string; plan: string }
    try { ref = JSON.parse(sub.external_reference) } catch { return new Response('ok', { status: 200 }) }

    const statusMap: Record<string, string> = {
      authorized: 'active',
      pending:    'trialing',
      paused:     'canceled',
      cancelled:  'canceled',
    }
    const status = statusMap[sub.status] ?? sub.status

    const endDate = sub.auto_recurring?.end_date
      ? new Date(sub.auto_recurring.end_date).toISOString()
      : null

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    await supabase.from('subscriptions').upsert({
      user_id: ref.user_id,
      plan: ref.plan,
      status,
      mp_preapproval_id: preapprovalId,
      current_period_end: endDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response('error', { status: 500 })
  }
})
