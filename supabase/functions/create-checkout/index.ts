import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PLANS: Record<string, { amount: number; frequency: number; label: string }> = {
  trimestral: { amount: 37, frequency: 3, label: 'IADI — Plano Trimestral' },
  anual:      { amount: 87, frequency: 12, label: 'IADI — Plano Anual' },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const body = await req.json()
    const plan = body.plan as string
    const planConfig = PLANS[plan]
    if (!planConfig) return new Response(JSON.stringify({ error: 'Plano inválido' }), { status: 400, headers: corsHeaders })

    const origin = req.headers.get('origin') || 'https://inventarioavaliacaoinfantil.vercel.app'
    const mpToken = Deno.env.get('MP_ACCESS_TOKEN')!

    const mpBody = {
      reason: planConfig.label,
      auto_recurring: {
        frequency: planConfig.frequency,
        frequency_type: 'months',
        transaction_amount: planConfig.amount,
        currency_id: 'BRL',
        free_trial: {
          frequency: 3,
          frequency_type: 'days',
        },
      },
      back_url: `${origin}?checkout=success`,
      payer_email: user.email,
      external_reference: JSON.stringify({ user_id: user.id, plan }),
    }

    const mpRes = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpBody),
    })

    const mpData = await mpRes.json()

    if (!mpRes.ok || !mpData.init_point) {
      console.error('MP error:', JSON.stringify(mpData))
      return new Response(JSON.stringify({ error: mpData.message || 'Erro ao criar assinatura' }), {
        status: 500, headers: corsHeaders,
      })
    }

    return new Response(JSON.stringify({ url: mpData.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    })
  }
})
