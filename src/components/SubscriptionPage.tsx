import { useState } from 'react'
import { ArrowLeft, Check, Loader2, CreditCard, AlertCircle, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react'
import type { useAuth } from '../hooks/useAuth'
import type { useSubscription } from '../hooks/useSubscription'

type AuthHook = ReturnType<typeof useAuth>
type SubHook = ReturnType<typeof useSubscription>
interface Props { auth: AuthHook; subHook: SubHook; onBack: () => void }

const PRICE_TRIMESTRAL = import.meta.env.VITE_STRIPE_PRICE_TRIMESTRAL as string
const PRICE_ANUAL = import.meta.env.VITE_STRIPE_PRICE_ANUAL as string
const STRIPE_PORTAL_URL = (import.meta.env.VITE_STRIPE_PORTAL_URL as string) || 'https://billing.stripe.com/p/login/test_00000'
const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'

const FEATURES = [
  'Gestão ilimitada de pacientes',
  'Questionário Portage completo (5 áreas)',
  'Relatório Word profissional',
  'PEI — Plano de Ensino Individualizado',
  'Gráficos de progressão e radar',
  'Comunidade e tutoriais',
  'Acesso a todas as atualizações',
]

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
    active:    { icon: CheckCircle,  color: 'var(--pos)',     bg: 'var(--pos-bg)',  label: 'Ativa' },
    trialing:  { icon: Clock,        color: 'var(--part)',    bg: 'var(--part-bg)', label: 'Período de teste' },
    canceled:  { icon: XCircle,      color: 'var(--neg)',     bg: 'var(--neg-bg)',  label: 'Cancelada' },
    past_due:  { icon: AlertCircle,  color: 'var(--neg)',     bg: 'var(--neg-bg)',  label: 'Pagamento pendente' },
  }
  const c = cfg[status] ?? { icon: AlertCircle, color: 'var(--ink-3)', bg: 'var(--surface-2)', label: status }
  const Icon = c.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '4px 11px', borderRadius: 99, color: c.color, background: c.bg }}>
      <Icon size={13} /> {c.label}
    </span>
  )
}

export default function SubscriptionPage({ auth, subHook, onBack }: Props) {
  const { user } = auth
  const { subscription, createCheckout } = subHook
  const isAdmin = user?.email === ADMIN_EMAIL
  const [loading, setLoading] = useState<'trimestral' | 'anual' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkout = async (plan: 'trimestral' | 'anual') => {
    const priceId = plan === 'trimestral' ? PRICE_TRIMESTRAL : PRICE_ANUAL
    if (!priceId) { setError('Configuração de preço pendente. Entre em contato com suporte.'); return }
    setLoading(plan); setError(null)
    try {
      const url = await createCheckout(priceId, plan)
      if (url) window.location.href = url
      else setError('Não foi possível iniciar o pagamento. Tente novamente.')
    } catch { setError('Erro ao conectar com o serviço de pagamento.') }
    finally { setLoading(null) }
  }

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const planLabel = subscription?.plan === 'anual' ? 'Anual' : subscription?.plan === 'trimestral' ? 'Trimestral' : null
  const expiresAt = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <div className="shell">
      <div className="topbar">
        <div className="app-frame">
          <div className="topbar-inner">
            <button className="btn btn-ghost btn-sm" onClick={onBack}><ArrowLeft size={14} /> Painel</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Assinatura</span>
            <div style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <div className="app-frame screen" style={{ padding: '28px 24px 80px', maxWidth: 780 }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Assinatura</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: 0 }}>Gerencie seu plano e acesso ao IADI.</p>
        </div>

        {/* status atual */}
        {isAdmin ? (
          <div className="card card-pad" style={{ marginBottom: 20, borderLeft: '3px solid var(--pos)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircle size={22} style={{ color: 'var(--pos)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Acesso Administrativo</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Conta de administrador — acesso completo e permanente sem cobrança.</div>
              </div>
            </div>
          </div>
        ) : subscription ? (
          <div className="card card-pad" style={{ marginBottom: 20, borderLeft: `3px solid ${isActive ? 'var(--pos)' : 'var(--neg)'}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 12 }}>PLANO ATUAL</div>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>{planLabel ?? 'Plano'}</div>
                <StatusBadge status={subscription.status} />
              </div>
              {expiresAt && (
                <div>
                  <div className="micro" style={{ marginBottom: 4 }}>{isActive ? 'Válido até' : 'Expirou em'}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{expiresAt}</div>
                </div>
              )}
            </div>
            {!isActive && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--neg-bg)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--neg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} /> Sua assinatura não está ativa. Renove abaixo para continuar usando o IADI.
              </div>
            )}
            <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <a
                href={STRIPE_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <CreditCard size={13} /> Gerenciar assinatura (mudar cartão, dados de cobrança)
              </a>
              <a
                href={STRIPE_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ textDecoration: 'none', color: 'var(--neg)', borderColor: 'hsl(6 60% 88%)', background: 'var(--neg-bg)' }}
              >
                <XCircle size={13} /> Cancelar assinatura
              </a>
            </div>
          </div>
        ) : (
          <div className="card card-pad" style={{ marginBottom: 20, borderLeft: '3px solid var(--neg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={22} style={{ color: 'var(--neg)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Sem assinatura ativa</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Escolha um plano abaixo para ter acesso completo ao IADI.</div>
              </div>
            </div>
          </div>
        )}

        {/* planos */}
        {!isAdmin && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>{isActive ? 'Planos disponíveis' : 'Escolha seu plano'}</h2>

            {error && (
              <div style={{ marginBottom: 16, padding: '11px 14px', background: 'var(--neg-bg)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--neg)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Trimestral */}
              <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>Trimestral</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em' }}>R$&nbsp;37</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 2 }}>/3 meses</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 3 }}>R$ 12,33 por mês</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {FEATURES.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}>
                      <Check size={13} style={{ color: 'var(--pos)', flexShrink: 0, marginTop: 2 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => checkout('trimestral')} disabled={!!loading}>
                  {loading === 'trimestral' ? <><Loader2 size={14} className="animate-spin" /> Aguarde…</> : isActive && subscription?.plan === 'trimestral' ? <><RefreshCw size={14} /> Renovar</> : 'Assinar trimestral'}
                </button>
              </div>

              {/* Anual — destaque */}
              <div style={{ background: 'var(--primary)', borderRadius: 'var(--r)', padding: 18, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'hsl(44 96% 68%)', color: 'hsl(36 80% 25%)', fontSize: 9.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Melhor valor
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Anual</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: '#fff' }}>R$&nbsp;87</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>/ano</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>R$ 7,25/mês · economize 35%</div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {FEATURES.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>
                      <Check size={13} style={{ color: 'hsl(44 96% 68%)', flexShrink: 0, marginTop: 2 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={{ background: '#fff', color: 'var(--primary-strong)', border: 'none', borderRadius: 'var(--r-sm)', padding: '10px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                  onClick={() => checkout('anual')}
                  disabled={!!loading}
                >
                  {loading === 'anual' ? <><Loader2 size={14} className="animate-spin" /> Aguarde…</> : isActive && subscription?.plan === 'anual' ? <><RefreshCw size={14} /> Renovar</> : 'Assinar anual'}
                </button>
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 18 }}>
              <CreditCard size={12} style={{ display: 'inline', marginRight: 5 }} />
              Pagamento seguro via Stripe · Cancele quando quiser · Sem taxas ocultas
            </p>
          </>
        )}
      </div>
    </div>
  )
}
