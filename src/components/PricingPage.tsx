import { useState } from 'react'
import { Check, Loader2, Activity, LogOut, ShieldCheck, Lock, CreditCard, RefreshCcw } from 'lucide-react'
import AppFooter from './AppFooter'
import type { useSubscription } from '../hooks/useSubscription'
import type { useAuth } from '../hooks/useAuth'

interface Props {
  subHook: ReturnType<typeof useSubscription>
  auth: ReturnType<typeof useAuth>
}

const FEATURES = [
  'Gestão ilimitada de pacientes',
  'Inventário completo de desenvolvimento (6 áreas)',
  'Relatório Word profissional',
  'PEI — Plano de Ensino Individualizado',
  'Gráficos de progressão e radar',
  'Acesso a todas as atualizações',
]

const TESTIMONIALS = [
  {
    text: 'Em 20 minutos eu tenho o relatório pronto. Antes levava horas montando tudo no Word manualmente.',
    name: 'Fernanda R.',
    role: 'Fonoaudióloga · SP',
  },
  {
    text: 'O PEI integrado economiza muito tempo. Consigo mostrar a evolução para a família de forma visual e clara.',
    name: 'Carla M.',
    role: 'Terapeuta Ocupacional · MG',
  },
  {
    text: 'Uso em consultório e em escola. Os gráficos de progressão fizeram diferença nas reuniões com a equipe.',
    name: 'Juliana P.',
    role: 'Psicóloga · RJ',
  },
]

const SECURITY = [
  { icon: Lock, label: 'Pagamento criptografado' },
  { icon: ShieldCheck, label: 'Dados protegidos' },
  { icon: CreditCard, label: 'Mercado Pago' },
  { icon: RefreshCcw, label: 'Cancele quando quiser' },
]

export default function PricingPage({ subHook, auth }: Props) {
  const [loading, setLoading] = useState<'trimestral' | 'anual' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkout = async (plan: 'trimestral' | 'anual') => {
    setLoading(plan)
    setError(null)
    try {
      const url = await subHook.createCheckout(plan)
      if (url) window.location.href = url
      else setError('Não foi possível iniciar o pagamento. Tente novamente.')
    } catch {
      setError('Erro ao conectar com o serviço de pagamento.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebf0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
            <Activity size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, color: '#111' }}>IADI</span>
        </div>
        <button type="button" onClick={() => auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={14} /> Sair
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 20px 16px' }}>
        <div style={{ display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', padding: '5px 14px', borderRadius: 99, marginBottom: 18 }}>
          Acesso completo
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111', margin: '0 0 14px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          3 dias grátis para experimentar
        </h1>
        <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 440, margin: '0 auto 10px', lineHeight: 1.6 }}>
          Cadastre sua forma de pagamento e explore o IADI completo por 3 dias. <strong style={{ color: '#111' }}>A cobrança só começa no 4º dia</strong> — se cancelar antes, não paga absolutamente nada.
        </p>
      </div>

      {/* Garantia em destaque */}
      <div style={{ maxWidth: 580, margin: '0 auto 32px', padding: '0 20px' }}>
        <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <ShieldCheck size={28} color="#16a34a" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Garantia de 3 dias grátis</div>
            <div style={{ fontSize: 13, color: '#166534', marginTop: 2 }}>
              Sua cobrança só começa no 4º dia. Se cancelar antes, não há qualquer débito. Você escolhe o plano agora e paga só depois que decidir continuar.
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', padding: '0 20px 8px', maxWidth: 720, margin: '0 auto', width: '100%' }}>

        {/* Trimestral */}
        <div style={{ flex: '1 1 280px', maxWidth: 340, background: '#fff', borderRadius: 20, border: '1.5px solid #e5e7eb', boxShadow: '0 2px 16px rgba(0,0,0,.06)', padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Trimestral</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#111' }}>R$&nbsp;37</span>
              <span style={{ color: '#9ca3af', fontSize: 14 }}>/3 meses</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>3 dias grátis · depois R$ 12,33/mês</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: '#374151', alignItems: 'flex-start' }}>
                <Check size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />{f}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => checkout('trimestral')} disabled={!!loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px solid #7c3aed', color: '#6d28d9', background: '#fff', padding: '13px 0', borderRadius: 12, fontWeight: 700, fontSize: 14.5, cursor: 'pointer', transition: 'background .15s' }}>
            {loading === 'trimestral' ? <Loader2 size={16} className="animate-spin" /> : null}
            Começar grátis · trimestral
          </button>
        </div>

        {/* Anual */}
        <div style={{ flex: '1 1 280px', maxWidth: 340, background: 'linear-gradient(145deg, #7c3aed, #5b21b6)', borderRadius: 20, boxShadow: '0 8px 32px rgba(124,58,237,.25)', padding: 28, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#facc15', color: '#78350f', fontSize: 10.5, fontWeight: 800, padding: '4px 11px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Melhor valor
          </div>
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Anual</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>R$&nbsp;87</span>
              <span style={{ color: '#c4b5fd', fontSize: 14 }}>/ano</span>
            </div>
            <p style={{ fontSize: 12.5, color: '#c4b5fd', marginTop: 4 }}>3 dias grátis · depois R$ 7,25/mês · economize 35%</p>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: '#ede9fe', alignItems: 'flex-start' }}>
                <Check size={15} color="#fde68a" style={{ flexShrink: 0, marginTop: 2 }} />{f}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => checkout('anual')} disabled={!!loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', color: '#6d28d9', border: 'none', padding: '13px 0', borderRadius: 12, fontWeight: 800, fontSize: 14.5, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,.12)' }}>
            {loading === 'anual' ? <Loader2 size={16} className="animate-spin" /> : null}
            Começar grátis · anual
          </button>
        </div>
      </div>

      {error && <p style={{ textAlign: 'center', fontSize: 13, color: '#ef4444', padding: '12px 20px 0' }}>{error}</p>}

      {/* Selos de segurança */}
      <div style={{ maxWidth: 600, margin: '28px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {SECURITY.map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, color: '#374151', fontWeight: 500 }}>
              <s.icon size={15} color="#6d28d9" />
              {s.label}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 14 }}>
          Cobrança apenas após os 3 dias de teste · Cancele a qualquer momento pela plataforma
        </p>
      </div>

      {/* Depoimentos */}
      <div style={{ maxWidth: 720, margin: '40px auto 0', padding: '0 20px 56px' }}>
        <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 20 }}>O que dizem quem já usa</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ flex: '1 1 200px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '20px 22px', boxShadow: '0 1px 8px rgba(0,0,0,.04)' }}>
              <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: '0 0 14px' }}>"{t.text}"</p>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111' }}>{t.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
