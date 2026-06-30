import { useState } from 'react'
import { Activity, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { useAuth } from '../hooks/useAuth'

type AuthHook = ReturnType<typeof useAuth>
interface Props { auth: AuthHook }

type Mode = 'login' | 'signup' | 'reset'

export default function LoginPage({ auth }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      if (mode === 'login') {
        const { error } = await auth.signIn(email, password)
        if (error) setMessage({ type: 'error', text: traduzErro(error.message) })
      } else if (mode === 'signup') {
        const { error } = await auth.signUp(email, password)
        if (error) setMessage({ type: 'error', text: traduzErro(error.message) })
        else setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' })
      } else {
        const { error } = await auth.resetPassword(email)
        if (error) setMessage({ type: 'error', text: traduzErro(error.message) })
        else setMessage({ type: 'success', text: 'E-mail de redefinição enviado. Verifique sua caixa de entrada.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Painel esquerdo: marca ────────────────────────────── */}
      <div className="hidden md:flex flex-col justify-between w-[52%] bg-purple-800 p-10 text-white relative overflow-hidden">
        {/* fundo gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-blue-800 opacity-90" />
        <div className="relative z-10 flex flex-col h-full">
          {/* logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none">IADI</p>
              <p className="text-white/60 text-xs leading-none mt-0.5">Avaliação do Desenvolvimento Infantil</p>
            </div>
          </div>

          {/* headline */}
          <div className="my-auto">
            <h1 className="text-3xl font-bold leading-snug mb-4">
              Avaliação clínica do desenvolvimento, de ponta a ponta.
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              Inventário de Avaliação Infantil, idade desenvolvimental por área, progressão entre avaliações e plano de ensino individualizado — em um só lugar.
            </p>
          </div>

          {/* métricas */}
          <div className="flex gap-8 mt-auto mb-6">
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-white/50 text-xs uppercase tracking-wide mt-0.5">Áreas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">0–6</p>
              <p className="text-white/50 text-xs uppercase tracking-wide mt-0.5">Anos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">IAI</p>
              <p className="text-white/50 text-xs uppercase tracking-wide mt-0.5">Método</p>
            </div>
          </div>

          <p className="text-white/40 text-xs">Dados privados, vinculados à conta do profissional.</p>
        </div>
      </div>

      {/* ── Painel direito: formulário ────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* logo mobile */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">IADI</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Entrar na conta' : mode === 'signup' ? 'Criar conta' : 'Redefinir senha'}
          </h2>
          <p className="text-sm text-gray-400 mb-7">
            {mode === 'login' ? 'Acesse o painel de pacientes.' : mode === 'signup' ? 'Crie sua conta profissional.' : 'Enviaremos um link por e-mail.'}
          </p>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail profissional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ana.terapeuta@clinica.com.br"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres</p>
                )}
              </div>
            )}

            {message && (
              <div className={`text-xs p-3 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar e-mail'}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => { setMode('reset'); setMessage(null) }} className="text-purple-500 hover:text-purple-700 block w-full transition">
                  Esqueci minha senha
                </button>
                <button type="button" onClick={() => { setMode('signup'); setMessage(null) }} className="text-gray-400 hover:text-gray-600 block w-full transition">
                  Não tem conta? <span className="font-medium text-purple-600">Criar agora</span>
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button type="button" onClick={() => { setMode('login'); setMessage(null) }} className="text-gray-400 hover:text-gray-600 transition">
                ← Voltar para o login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function traduzErro(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.'
  if (msg.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('Unable to validate email')) return 'E-mail inválido.'
  if (msg.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.'
  return msg
}
