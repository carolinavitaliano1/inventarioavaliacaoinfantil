import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, Activity, CheckCircle2, ArrowRight } from 'lucide-react'
import type { useAuth } from '../hooks/useAuth'

type AuthHook = ReturnType<typeof useAuth>
type Mode = 'login' | 'signup' | 'reset'
interface Props { auth: AuthHook; defaultMode?: Mode }

const SIGNUP_STEPS = [
  { n: '1', title: 'Crie sua conta gratuitamente', desc: 'Basta e-mail e senha. Sem cartão de crédito para começar.' },
  { n: '2', title: 'Escolha seu plano', desc: 'Trimestral (R$ 37 / 3 meses) ou Anual (R$ 87 / ano). Cancele quando quiser.' },
  { n: '3', title: 'Comece a avaliar', desc: 'Cadastre pacientes, aplique o inventário e gere laudos em minutos.' },
]

const SIGNUP_BENEFITS = [
  '589 habilidades em 6 áreas · 0–6 anos',
  'Idade desenvolvimental automática por área',
  'Gráficos de radar e progressão entre avaliações',
  'PEI — Plano de Ensino Individualizado',
  'Relatório Word profissional com um clique',
  'Dados privados, vinculados à sua conta',
]

const LOGIN_STATS = [
  ['6', 'áreas avaliadas'],
  ['589', 'habilidades'],
  ['0–6', 'anos de cobertura'],
]

export default function LoginPage({ auth, defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setInfo('')
    try {
      if (mode === 'login') {
        const { error: err } = await auth.signIn(email, pwd)
        if (err) setError(err.message)
      } else if (mode === 'signup') {
        const { error: err } = await auth.signUp(email, pwd)
        if (err) setError(err.message)
        else setInfo('Verifique seu e-mail para confirmar o cadastro.')
      } else {
        const { error: err } = await auth.resetPassword(email)
        if (err) setError(err.message)
        else setInfo('Link de redefinição enviado para o seu e-mail.')
      }
    } finally { setLoading(false) }
  }

  const title = { login: 'Entrar na conta', signup: 'Criar conta', reset: 'Redefinir senha' }[mode]
  const sub = { login: 'Acesse o painel de pacientes.', signup: 'Comece a avaliar em minutos.', reset: 'Enviaremos um link de redefinição.' }[mode]
  const btnLabel = { login: 'Entrar', signup: 'Criar conta', reset: 'Enviar link' }[mode]

  return (
    <>
      <style>{`
        .login-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 100vh;
        }
        .login-left {
          background: linear-gradient(160deg, var(--primary-strong), hsl(230 52% 28%));
          color: #fff;
          padding: 52px 56px;
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          overflow: hidden;
        }
        .login-right {
          display: grid;
          place-items: center;
          padding: 40px 24px;
          background: var(--surface);
        }
        .login-step {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .login-step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: grid;
          place-items: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .login-benefit {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13.5px;
          opacity: 0.9;
          line-height: 1.4;
        }
        /* mobile: stack vertically, hide left panel on very small screens */
        @media (max-width: 860px) {
          .login-grid {
            grid-template-columns: 1fr;
          }
          .login-left {
            padding: 36px 28px 40px;
          }
        }
        @media (max-width: 480px) {
          .login-left {
            padding: 28px 20px 32px;
          }
          .login-right {
            padding: 32px 16px;
          }
        }
      `}</style>
      <div className="login-grid">

        {/* ── Left panel ── */}
        <div className="login-left">
          <div style={{ position: 'absolute', inset: 0, opacity: 0.45, background: 'radial-gradient(700px 400px at 90% -10%, rgba(255,255,255,0.13), transparent 60%)' }} />

          {/* Logo */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 44 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center' }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>IADI</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>Inventário de Avaliação do Desenvolvimento Infantil</div>
            </div>
          </div>

          {mode === 'signup' ? (
            /* ── SIGNUP: passo a passo + benefícios ── */
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                Tudo que você precisa para avaliar com precisão.
              </h1>
              <p style={{ fontSize: 14, opacity: 0.8, margin: '0 0 32px', lineHeight: 1.55 }}>
                Crie sua conta agora e comece a usar em minutos — sem burocracia.
              </p>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 36 }}>
                {SIGNUP_STEPS.map(s => (
                  <div key={s.n} className="login-step">
                    <div className="login-step-num">{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{s.title}</div>
                      <div style={{ fontSize: 13, opacity: 0.78, lineHeight: 1.45 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginBottom: 24 }} />

              {/* Benefits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {SIGNUP_BENEFITS.map(b => (
                  <div key={b} className="login-benefit">
                    <CheckCircle2 size={15} style={{ flexShrink: 0, opacity: 0.9 }} />
                    {b}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── LOGIN / RESET: headline + stats ── */
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 420 }}>
              <h1 style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                Avaliação clínica do desenvolvimento, de ponta a ponta.
              </h1>
              <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, margin: '0 0 36px' }}>
                Inventário completo, idade desenvolvimental por área, progressão entre avaliações e PEI — em um só lugar.
              </p>
              <div style={{ display: 'flex', gap: 28 }}>
                {LOGIN_STATS.map(([n, l]) => (
                  <div key={l}>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: 11.5, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ position: 'relative', fontSize: 11.5, opacity: 0.6, marginTop: 40 }}>
            Dados privados, vinculados à conta do profissional.
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div className="login-right">
          <div style={{ width: '100%', maxWidth: 360 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 4px' }}>{title}</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 13.5, margin: '0 0 26px' }}>{sub}</p>

            {error && <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--neg-bg)', border: '1px solid hsl(6 60% 88%)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--neg)' }}>{error}</div>}
            {info && <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--primary-bg)', border: '1px solid var(--primary-line)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--primary-ink)' }}>{info}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>E-mail profissional</div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'flex' }}><Mail size={16} /></span>
                  <input className="field" type="email" style={{ paddingLeft: 34 }} value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com.br" required />
                </div>
              </div>
              {mode !== 'reset' && (
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Senha</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'flex' }}><Lock size={16} /></span>
                    <input className="field" type={show ? 'text' : 'password'} style={{ paddingLeft: 34, paddingRight: 38 }} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-4)', padding: 0, display: 'flex' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ padding: '11px', fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }} disabled={loading}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                {btnLabel}
              </button>
            </form>

            <div style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              {mode === 'login' && <>
                <button onClick={() => { setMode('reset'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--primary-ink)', fontWeight: 500, cursor: 'pointer' }}>Esqueci minha senha</button>
                <button onClick={() => { setMode('signup'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
                  Não tem conta? <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>Criar agora</span>
                </button>
              </>}
              {mode !== 'login' && <button onClick={() => { setMode('login'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>← Voltar para o login</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
