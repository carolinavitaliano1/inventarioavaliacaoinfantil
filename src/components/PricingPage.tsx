import { useState } from 'react'
import { Check, Loader2, Activity, LogOut } from 'lucide-react'
import type { useSubscription } from '../hooks/useSubscription'
import type { useAuth } from '../hooks/useAuth'

interface Props {
  subHook: ReturnType<typeof useSubscription>
  auth: ReturnType<typeof useAuth>
}

const FEATURES = [
  'Gestão ilimitada de pacientes',
  'Questionário Portage completo (5 áreas)',
  'Relatório Word profissional',
  'PEI — Plano de Ensino Individualizado',
  'Gráficos de progressão e radar',
  'Acesso a todas as atualizações',
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">IADI</span>
        </div>
        <button
          type="button"
          onClick={() => auth.signOut()}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>

      {/* Hero */}
      <div className="text-center pt-12 pb-8 px-4">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-3">Acesso completo</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">3 dias grátis, sem cobrança</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Experimente o IADI completo por 3 dias. Nenhum valor é cobrado durante o período de teste — cancele antes e não paga nada.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center px-4 pb-8 max-w-2xl mx-auto w-full">

        {/* Trimestral */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-500 mb-1">Trimestral</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-gray-900">R$&nbsp;37</span>
              <span className="text-gray-400 text-sm mb-1">/3 meses</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">3 dias grátis · depois R$ 12,33/mês</p>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => checkout('trimestral')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-700 py-3 rounded-xl font-semibold hover:bg-purple-50 transition disabled:opacity-50"
          >
            {loading === 'trimestral' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Testar grátis · trimestral
          </button>
        </div>

        {/* Anual — destaque */}
        <div className="flex-1 bg-purple-600 rounded-2xl shadow-lg p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Melhor valor
          </div>

          <div className="mb-5">
            <p className="text-sm font-semibold text-purple-200 mb-1">Anual</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold text-white">R$&nbsp;87</span>
              <span className="text-purple-300 text-sm mb-1">/ano</span>
            </div>
            <p className="text-xs text-purple-300 mt-1">3 dias grátis · depois R$ 7,25/mês · economize 35%</p>
          </div>

          <ul className="space-y-2.5 mb-6 flex-1">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-purple-100">
                <Check className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => checkout('anual')}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 py-3 rounded-xl font-bold hover:bg-purple-50 transition disabled:opacity-50 shadow"
          >
            {loading === 'anual' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Testar grátis · anual
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center text-sm text-red-500 px-4 pb-6">{error}</p>
      )}

      <p className="text-center text-xs text-gray-400 pb-8 px-4">
        3 dias grátis · sem cobrança durante o trial · Pagamento seguro via Mercado Pago · Cancele quando quiser
      </p>
    </div>
  )
}
