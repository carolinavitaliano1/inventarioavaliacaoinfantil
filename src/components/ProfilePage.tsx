import { useState, useEffect } from 'react'
import { ArrowLeft, User, Mail, Lock, LogOut, CheckCircle, Loader2, AlertCircle, CreditCard, Users, Phone, RefreshCw } from 'lucide-react'
import AppFooter from './AppFooter'
import { supabase } from '../lib/supabase'
import type { useAuth } from '../hooks/useAuth'
import type { useSubscription } from '../hooks/useSubscription'

type AuthHook = ReturnType<typeof useAuth>
type SubHook = ReturnType<typeof useSubscription>
interface Props { auth: AuthHook; subHook: SubHook; onBack: () => void; onGoSubscription: () => void }

const ADMIN_EMAIL = 'carolinavitaliano1@gmail.com'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:    { label: 'Ativa',              color: 'var(--pos)' },
  trialing:  { label: 'Teste (3 dias)',      color: 'hsl(38 90% 45%)' },
  canceled:  { label: 'Cancelada',           color: 'var(--neg)' },
  past_due:  { label: 'Pagamento pendente',  color: 'var(--neg)' },
  inactive:  { label: 'Sem assinatura',      color: 'var(--ink-4)' },
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  plan: string | null
  subscription_status: string | null
  current_period_end: string | null
  whatsapp: string | null
}

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

  const [tab, setTab] = useState<'perfil' | 'usuarios'>('perfil')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Admin users list
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [search, setSearch] = useState('')

  const fetchUsers = async () => {
    setLoadingUsers(true)
    const { data, error } = await supabase.rpc('get_all_users_for_admin')
    setLoadingUsers(false)
    if (!error && data) setAdminUsers(data as AdminUser[])
  }

  useEffect(() => {
    if (isAdmin && tab === 'usuarios') fetchUsers()
  }, [isAdmin, tab])

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

  const filtered = adminUsers.filter(u =>
    !search || u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.whatsapp ?? '').includes(search)
  )

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

      <div className="app-frame screen" style={{ padding: '28px 24px 80px', maxWidth: 760 }}>

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

        {/* tabs — só admin vê "Usuários" */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
            {([['perfil', 'Meu Perfil', User], ['usuarios', 'Usuários', Users]] as const).map(([key, label, Icon]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13.5, fontWeight: tab === key ? 600 : 400,
                background: 'none', border: 'none', cursor: 'pointer', color: tab === key ? 'var(--primary-ink)' : 'var(--ink-3)',
                borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1,
              }}>
                <Icon size={14} />{label}
              </button>
            ))}
          </div>
        )}

        {/* ── TAB: PERFIL ── */}
        {tab === 'perfil' && (
          <>
            {/* assinatura */}
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
          </>
        )}

        {/* ── TAB: USUÁRIOS (admin only) ── */}
        {tab === 'usuarios' && isAdmin && (
          <div className="card card-pad">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} style={{ color: 'var(--primary-ink)' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Todos os usuários</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 99, padding: '2px 8px' }}>{adminUsers.length}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="field"
                  style={{ padding: '6px 10px', fontSize: 13, width: 200 }}
                  placeholder="Buscar por e-mail..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" onClick={fetchUsers} disabled={loadingUsers}>
                  {loadingUsers ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: 40 }}><Loader2 size={22} className="animate-spin" style={{ color: 'var(--primary)' }} /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.length === 0 && <p style={{ fontSize: 13, color: 'var(--ink-4)', textAlign: 'center', padding: 24 }}>Nenhum usuário encontrado.</p>}
                {filtered.map(u => {
                  const st = STATUS_LABEL[u.subscription_status ?? 'inactive'] ?? STATUS_LABEL['inactive']
                  return (
                    <div key={u.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
                      {/* avatar */}
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--primary-bg)', color: 'var(--primary-ink)', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                        {u.email.slice(0, 2).toUpperCase()}
                      </div>
                      {/* info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 600, wordBreak: 'break-all' }}>{u.email}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: `color-mix(in srgb, ${st.color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${st.color} 30%, transparent)`, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                            {st.label}
                          </span>
                          {u.plan && <span style={{ fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface-2)', border: '1px solid var(--line)', padding: '2px 8px', borderRadius: 99 }}>{u.plan === 'anual' ? 'Anual' : 'Trimestral'}</span>}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 7 }}>
                          <a href={`mailto:${u.email}`} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--ink-3)', textDecoration: 'none' }}>
                            <Mail size={12} />{u.email}
                          </a>
                          {u.whatsapp && (
                            <a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'hsl(142 60% 38%)', textDecoration: 'none' }}>
                              <Phone size={12} />{u.whatsapp}
                            </a>
                          )}
                          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                            Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          {u.last_sign_in_at && (
                            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                              Último acesso: {new Date(u.last_sign_in_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {u.current_period_end && (
                            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                              Validade: {new Date(u.current_period_end).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  )
}
