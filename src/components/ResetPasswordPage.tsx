import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, Activity } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage({ onDone }: { onDone: () => void }) {
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd !== confirm) { setError('As senhas não coincidem.'); return }
    if (pwd.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.updateUser({ password: pwd })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    // Sign out so the user logs in fresh with the new password
    await supabase.auth.signOut()
    setTimeout(onDone, 2000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Activity size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)', letterSpacing: '-0.02em' }}>IADI</span>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: '36px 32px', boxShadow: '0 4px 24px hsl(220 25% 20% / .07)' }}>
          {done ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <CheckCircle2 size={44} color="var(--pos)" />
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>Senha redefinida!</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>Senha salva! Entre com sua nova senha.</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Nova senha</h2>
              <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '0 0 26px' }}>Digite e confirme sua nova senha de acesso.</p>

              {error && (
                <div style={{ marginBottom: 16, padding: '10px 12px', background: 'var(--neg-bg)', border: '1px solid hsl(6 60% 88%)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--neg)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Nova senha</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'flex' }}><Lock size={16} /></span>
                    <input className="field" type={show ? 'text' : 'password'} style={{ paddingLeft: 34, paddingRight: 38 }} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" required />
                    <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--ink-4)', padding: 0, display: 'flex', cursor: 'pointer' }}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Confirmar senha</div>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'flex' }}><Lock size={16} /></span>
                    <input className="field" type={show ? 'text' : 'password'} style={{ paddingLeft: 34 }} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '11px', fontSize: 14, marginTop: 4 }} disabled={loading}>
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Salvar nova senha
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
