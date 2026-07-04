import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Valida a assinatura HMAC-SHA256 enviada pelo Mercado Pago no header x-signature
async function validateMpSignature(req: Request, rawBody: string): Promise<boolean> {
  const secret = Deno.env.get('MP_WEBHOOK_SECRET')
  if (!secret) return true // sem segredo configurado, aceita (modo dev)

  const sigHeader = req.headers.get('x-signature')
  const reqId = req.headers.get('x-request-id') ?? ''
  if (!sigHeader) return false

  // Formato: "ts=...,v1=..."
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${new URL(req.url).searchParams.get('data.id') ?? ''};request-id:${reqId};ts:${ts};`
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hex === v1
}

serve(async (req) => {
  try {
    const rawBody = await req.text()

    // Validar assinatura do MP (ignora se MP_WEBHOOK_SECRET não estiver setado)
    const valid = await validateMpSignature(req, rawBody)
    if (!valid) {
      console.warn('mp-webhook: assinatura inválida')
      return new Response('forbidden', { status: 403 })
    }

    const body = JSON.parse(rawBody)
    const { type, data } = body

    if (type !== 'preapproval') {
      return new Response('ok', { status: 200 })
    }

    const mpToken = Deno.env.get('MP_ACCESS_TOKEN')!
    const preapprovalId = data?.id
    if (!preapprovalId) return new Response('ok', { status: 200 })

    // Nunca confia no body direto — busca os dados no MP para verificar
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
      headers: { 'Authorization': `Bearer ${mpToken}` },
    })
    if (!mpRes.ok) return new Response('ok', { status: 200 })
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
