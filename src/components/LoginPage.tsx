import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Loader2, Activity } from 'lucide-react'
import type { useAuth } from '../hooks/useAuth'

type AuthHook = ReturnType<typeof useAuth>
type Mode = 'login' | 'signup' | 'reset'
interface Props { auth: AuthHook; defaultMode?: Mode }

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
        .login-grid { display: grid; grid-template-columns: 1.05fr 1fr; min-height: 100vh; }
        @media (max-width: 720px) { .login-grid { grid-template-columns: 1fr; } .login-left { display: none !important; } }
      `}</style>
      <div className="login-grid">
        <div className="login-left" style={{
          background: 'linear-gradient(160deg, var(--primary-strong), hsl(230 52% 30%))',
          color: '#fff', padding: '56px 60px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: 'radial-gradient(700px 400px at 90% -10%, rgba(255,255,255,0.13), transparent 60%)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center' }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>IADI</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>Avaliação do Desenvolvimento Infantil</div>
            </div>
          </div>
          <div style={{ position: 'relative', maxWidth: 420 }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
              Avaliação clínica do desenvolvimento, de ponta a ponta.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.85, margin: 0 }}>
              Inventário de Avaliação Infantil, idade desenvolvimental por área,
              progressão entre avaliações e plano de ensino individualizado — em um só lugar.
            </p>
            <div style={{ display: 'flex', gap: 28, marginTop: 36 }}>
              {[['5', 'áreas'], ['0–6', 'anos'], ['IAI', 'método']].map(([n, l]) => (
                <div key={l}>
                  <div className="mono" style={{ fontSize: 24, fontWeight: 600 }}>{n}</div>
                  <div style={{ fontSize: 11.5, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', fontSize: 11.5, opacity: 0.7 }}>Dados privados, vinculados à conta do profissional.</div>
        </div>

        <div style={{ display: 'grid', placeItems: 'center', padding: 40, background: 'var(--surface)' }}>
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
              <button type="submit" className="btn btn-primary" style={{ padding: '11px', fontSize: 14, marginTop: 4 }} disabled={loading}>
                {loading && <Loader2 size={15} className="animate-spin" />}
                {btnLabel}
              </button>
            </form>

            <div style={{ marginTop: 20, fontSize: 13, color: 'var(--ink-3)', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
              {mode === 'login' && <>
                <button onClick={() => { setMode('reset'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--primary-ink)', fontWeight: 500 }}>Esqueci minha senha</button>
                <button onClick={() => { setMode('signup'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--ink-3)' }}>
                  Não tem conta? <span style={{ color: 'var(--primary-ink)', fontWeight: 600 }}>Criar agora</span>
                </button>
              </>}
              {mode !== 'login' && <button onClick={() => { setMode('login'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--ink-3)' }}>← Voltar para o login</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
