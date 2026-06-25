import { useState, Component } from 'react'
import type { ReactNode } from 'react'
import PortageHome from './components/PortageHome'
import PortageQuestionnaire from './components/PortageQuestionnaire'
import PortageResults from './components/PortageResults'
import PortagePEI from './components/PortagePEI'
import { usePortageAssessment } from './hooks/usePortageAssessment'

export type View = 'home' | 'questionnaire' | 'results' | 'pei'

// ErrorBoundary global: evita tela branca em erros de render
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="font-semibold text-gray-800 mb-2">Ocorreu um erro inesperado.</p>
          <p className="text-sm text-gray-500 mb-6">Seus dados estão salvos. Recarregue a página para continuar.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Recarregar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const hook = usePortageAssessment()

  // Se current é null e estamos em uma view que precisa dele, volta para home
  const safeSetView = (v: View) => {
    if ((v === 'questionnaire' || v === 'results' || v === 'pei') && !hook.current) {
      setView('home')
      return
    }
    setView(v)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {view === 'home' && <PortageHome hook={hook} setView={safeSetView} />}
        {view === 'questionnaire' && <PortageQuestionnaire hook={hook} setView={safeSetView} />}
        {view === 'results' && <PortageResults hook={hook} setView={safeSetView} />}
        {view === 'pei' && <PortagePEI hook={hook} setView={safeSetView} />}
      </div>
    </ErrorBoundary>
  )
}
