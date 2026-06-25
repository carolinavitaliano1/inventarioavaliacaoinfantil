import { useState } from 'react'
import { ClipboardList, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">IADI</h1>
          <p className="text-sm font-semibold text-purple-700 mt-0.5">Inventário de Avaliação do Desenvolvimento Infantil</p>
          <p className="text-xs text-gray-400 mt-1">Avaliação da Idade Desenvolvimental</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-purple-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Redefinir senha'}
          </h2>

          <form onSubmit={handle} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[11px] text-gray-400 mt-1">Mínimo de 6 caracteres</p>
                )}
              </div>
            )}

            {message && (
              <div className={`text-xs p-3 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar e-mail'}
            </button>
          </form>

          <div className="mt-4 space-y-2 text-center text-xs">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => { setMode('reset'); setMessage(null) }} className="text-purple-500 hover:text-purple-700 block w-full">
                  Esqueci minha senha
                </button>
                <button type="button" onClick={() => { setMode('signup'); setMessage(null) }} className="text-gray-500 hover:text-gray-700 block w-full">
                  Não tem conta? <span className="font-medium text-purple-600">Criar conta</span>
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'reset') && (
              <button type="button" onClick={() => { setMode('login'); setMessage(null) }} className="text-gray-500 hover:text-gray-700">
                ← Voltar para o login
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Seus dados são privados e vinculados à sua conta.
        </p>
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
