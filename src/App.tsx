import { useState, useEffect, Component } from 'react'
import type { ReactNode } from 'react'
import PortageHome from './components/PortageHome'
import PortageQuestionnaire from './components/PortageQuestionnaire'
import PortageResults from './components/PortageResults'
import PortagePEI from './components/PortagePEI'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import PatientDetail from './components/PatientDetail'
import { usePortageAssessment } from './hooks/usePortageAssessment'
import { usePatients } from './hooks/usePatients'
import { useAuth } from './hooks/useAuth'
import { useSubscription } from './hooks/useSubscription'
import PricingPage from './components/PricingPage'
import Community from './components/Community'
import ProfilePage from './components/ProfilePage'
import SubscriptionPage from './components/SubscriptionPage'
import LandingPage from './components/LandingPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import { Loader2 } from 'lucide-react'

export type View = 'dashboard' | 'home' | 'patient' | 'questionnaire' | 'results' | 'pei' | 'community' | 'profile' | 'subscription'

const ASSESSMENT_VIEWS: View[] = ['questionnaire', 'results', 'pei']

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
  const auth = useAuth()
  const subHook = useSubscription(auth.user)
  const [view, setView] = useState<View>('dashboard')
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null)
  const hook = usePortageAssessment(auth.user?.id ?? null)
  const patientsHook = usePatients(auth.user?.id)

  // pendingNav: when setCurrentId() and setView() are called in the same event,
  // hook.current is stale (reflects pre-update state). We defer navigation until
  // the next render when hook.currentId is updated and hook.current is available.
  const [loginMode, setLoginMode] = useState<'login' | 'signup' | null>(null)
  const [pendingNav, setPendingNav] = useState<View | null>(null)

  // Detect password recovery flow (hash from Supabase magic link)
  const [isRecovery, setIsRecovery] = useState(() => {
    const hash = window.location.hash
    return hash.includes('type=recovery')
  })

  // Detect return from Mercado Pago checkout
  const [checkoutSuccess, setCheckoutSuccess] = useState(() => {
    return new URLSearchParams(window.location.search).get('checkout') === 'success'
  })

  useEffect(() => {
    if (checkoutSuccess) {
      // Clean URL without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete('checkout')
      window.history.replaceState({}, '', url.toString())
    }
  }, [checkoutSuccess])

  useEffect(() => {
    if (pendingNav && hook.currentId) {
      setView(pendingNav)
      setPendingNav(null)
    }
  }, [hook.currentId, pendingNav])

  const safeSetView = (v: View) => {
    if (ASSESSMENT_VIEWS.includes(v) && !hook.current) {
      // currentId may have just been set in the same event batch — defer
      if (hook.currentId) {
        setView(v)
      } else {
        setPendingNav(v)
      }
      return
    }
    setView(v)
  }

  const openPatient = (patientId: string) => {
    setCurrentPatientId(patientId)
    setView('patient')
  }

  if (auth.loading || subHook.loadingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  // Password recovery: user clicked the email link
  if (isRecovery) {
    return (
      <ErrorBoundary>
        <ResetPasswordPage onDone={() => { setIsRecovery(false); window.history.replaceState({}, '', '/') }} />
      </ErrorBoundary>
    )
  }

  if (!auth.user) {
    return (
      <ErrorBoundary>
        {loginMode ? <LoginPage auth={auth} defaultMode={loginMode} /> : <LandingPage onGetStarted={() => setLoginMode('signup')} onLogin={() => setLoginMode('login')} />}
      </ErrorBoundary>
    )
  }

  // Returned from Mercado Pago — show success message and wait for webhook to activate subscription
  if (checkoutSuccess) {
    return (
      <ErrorBoundary>
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 380 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px', color: 'var(--ink)' }}>Pagamento recebido!</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, margin: '0 0 28px' }}>
              Seu acesso será ativado em instantes. Aguarde alguns segundos enquanto confirmamos sua assinatura.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
            <button
              onClick={() => { setCheckoutSuccess(false); window.location.reload() }}
              className="btn btn-primary"
              style={{ padding: '11px 28px', fontSize: 14 }}
            >
              Entrar no app agora
            </button>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (!subHook.isActive) {
    return (
      <ErrorBoundary>
        <PricingPage subHook={subHook} auth={auth} />
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div>
        {view === 'dashboard' && (
          <Dashboard
            hook={hook}
            setView={safeSetView}
            auth={auth}
            patientsHook={patientsHook}
            onOpenPatient={openPatient}
          />
        )}
        {view === 'patient' && currentPatientId && (
          <PatientDetail
            patientId={currentPatientId}
            patientsHook={patientsHook}
            assessmentHook={hook}
            setView={safeSetView}
            onBack={() => setView('dashboard')}
            onPatientNotFound={() => setView('dashboard')}
            auth={auth}
          />
        )}
        {view === 'community' && <Community auth={auth} onBack={() => setView('dashboard')} />}
        {view === 'profile' && <ProfilePage auth={auth} subHook={subHook} onBack={() => setView('dashboard')} onGoSubscription={() => setView('subscription')} />}
        {view === 'subscription' && <SubscriptionPage auth={auth} subHook={subHook} onBack={() => setView('profile')} />}
        {view === 'home' && <PortageHome hook={hook} setView={safeSetView} auth={auth} />}
        {view === 'questionnaire' && <PortageQuestionnaire hook={hook} setView={safeSetView} auth={auth} onBack={() => setView('patient')} />}
        {view === 'results' && <PortageResults hook={hook} setView={safeSetView} auth={auth} onBack={() => setView('patient')} />}
        {view === 'pei' && <PortagePEI hook={hook} setView={safeSetView} auth={auth} onBack={() => setView('patient')} />}
      </div>
    </ErrorBoundary>
  )
}
