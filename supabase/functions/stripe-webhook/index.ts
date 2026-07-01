import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }

  const upsertSub = async (sub: Stripe.Subscription) => {
    const userId = sub.metadata?.supabase_user_id
    if (!userId) return

    const priceId = sub.items.data[0]?.price.id
    const plan = sub.metadata?.plan ?? (sub.items.data[0]?.price.recurring?.interval_count === 3 ? 'trimestral' : 'anual')

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      stripe_price_id: priceId,
      plan,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.CheckoutSession
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        await upsertSub(sub)
      }
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await upsertSub(event.data.object as Stripe.Subscription)
      break
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await supabase.from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', invoice.subscription as string)
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
