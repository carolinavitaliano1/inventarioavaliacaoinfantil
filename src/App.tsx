import { useState } from 'react'
import PortageHome from './components/PortageHome'
import PortageQuestionnaire from './components/PortageQuestionnaire'
import PortageResults from './components/PortageResults'
import PortagePEI from './components/PortagePEI'
import { usePortageAssessment } from './hooks/usePortageAssessment'

export type View = 'home' | 'questionnaire' | 'results' | 'pei'

export default function App() {
  const [view, setView] = useState<View>('home')
  const hook = usePortageAssessment()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {view === 'home' && <PortageHome hook={hook} setView={setView} />}
      {view === 'questionnaire' && <PortageQuestionnaire hook={hook} setView={setView} />}
      {view === 'results' && <PortageResults hook={hook} setView={setView} />}
      {view === 'pei' && <PortagePEI hook={hook} setView={setView} />}
    </div>
  )
}
