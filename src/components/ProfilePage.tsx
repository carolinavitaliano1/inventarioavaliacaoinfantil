import { useState } from 'react'
import { ArrowLeft, User, Mail, Lock, LogOut, CheckCircle, Loader2, AlertCircle, CreditCard } from 'lucide-react'
import AppFooter from './AppFooter'
import { supabase } from '../lib/supabase'
import type { useAuth } from '../hooks/useAuth'
import type { useSubscription } from '../hooks/useSubscription'

type AuthHook = ReturnType<typeof useAuth>
type SubHook = ReturnType<typeof useSubscription>
interface Props { auth: AuthHook; subHook: SubHook; onBack: () => void; onGoSubscription: () => void }

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'

function Field({ label, value, type = 'text', onChange, placeholder }: { label: string; value: string; type?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 5 }}>{label}</div>
      <input className="field" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function ProfilePage({ auth, subHook, onBack, onGoSubscription }: Props) {
  const { user, signOut } = auth
  const { subscription } = subHook
  const isAdmin = user?.email === ADMIN_EMAIL

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: 'As senhas não coincidem.' }); return
    }
    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: 'A senha deve ter pelo menos 6 caracteres.' }); return
    }
    setSavingPw(true); setPwMsg(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPw(false)
    if (error) setPwMsg({ ok: false, text: error.message })
    else { setPwMsg({ ok: true, text: 'Senha alterada com sucesso!' }); setNewPassword(''); setConfirmPassword('') }
  }

  const planLabel = subscription?.plan === 'anual' ? 'Anual' : subscription?.plan === 'trimestral' ? 'Trimestral' : null
  const statusLabel: Record<string, string> = { active: 'Ativa', trialing: 'Período de teste', canceled: 'Cancelada', past_due: 'Pagamento pendente' }

  const initials = user?.email?.split('@')[0].slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="shell">
      <div className="topbar">
        <div className="app-frame">
          <div className="topbar-inner">
            <button className="btn btn-ghost btn-sm" onClick={onBack}><ArrowLeft size={14} /> Painel</button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>Meu Perfil</span>
            <div style={{ flex: 1 }} />
          </div>
        </div>
      </div>

      <div className="app-frame screen" style={{ padding: '28px 24px 80px', maxWidth: 680 }}>

        {/* avatar + info */}
        <div className="card card-pad" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 13, background: 'var(--primary-bg)', color: 'var(--primary-ink)', border: '1px solid var(--primary-line)', display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 600 }}>{user?.email?.split('@')[0]}</span>
              {isAdmin && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-ink)', background: 'var(--primary-bg)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--primary-line)' }}>Admin</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Mail size={13} style={{ color: 'var(--ink-4)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* assinatura resumo */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CreditCard size={16} style={{ color: 'var(--primary-ink)' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Assinatura</span>
          </div>
          {isAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} style={{ color: 'var(--pos)' }} />
              <span style={{ fontSize: 13.5, color: 'var(--pos)', fontWeight: 500 }}>Acesso administrativo — sem cobrança</span>
            </div>
          ) : subscription ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  ['Plano', planLabel ?? '—'],
                  ['Status', statusLabel[subscription.status] ?? subscription.status],
                  ['Validade', subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR') : '—'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="micro" style={{ marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 4, alignSelf: 'flex-start' }} onClick={onGoSubscription}>
                <CreditCard size={13} /> Gerenciar assinatura
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertCircle size={15} style={{ color: 'var(--neg)' }} />
              <span style={{ fontSize: 13.5, color: 'var(--neg)' }}>Sem assinatura ativa</span>
              <button className="btn btn-primary btn-sm" onClick={onGoSubscription}>Ver planos</button>
            </div>
          )}
        </div>

        {/* alterar senha */}
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Lock size={16} style={{ color: 'var(--ink-2)' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Alterar senha</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Nova senha" value={newPassword} type="password" onChange={setNewPassword} placeholder="Mínimo 6 caracteres" />
            <Field label="Confirmar nova senha" value={confirmPassword} type="password" onChange={setConfirmPassword} placeholder="Repita a senha" />
            {pwMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: pwMsg.ok ? 'var(--pos)' : 'var(--neg)' }}>
                {pwMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {pwMsg.text}
              </div>
            )}
            <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={handleChangePassword} disabled={savingPw || !newPassword || !confirmPassword}>
              {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Alterar senha
            </button>
          </div>
        </div>

        {/* conta */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <User size={16} style={{ color: 'var(--ink-2)' }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Conta</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
              <div className="micro" style={{ marginBottom: 3 }}>ID do usuário</div>
              <div className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', wordBreak: 'break-all' }}>{user?.id}</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)' }}>
              <div className="micro" style={{ marginBottom: 3 }}>Membro desde</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</div>
            </div>
            <button
              className="btn btn-sm"
              style={{ alignSelf: 'flex-start', color: 'var(--neg)', borderColor: 'hsl(6 60% 88%)', background: 'var(--neg-bg)', marginTop: 4 }}
              onClick={() => { if (window.confirm('Tem certeza que deseja sair?')) signOut() }}
            >
              <LogOut size={14} /> Sair da conta
            </button>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}
