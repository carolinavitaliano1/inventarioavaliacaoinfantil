import { Activity, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import type { useAuth } from '../hooks/useAuth'

type AuthHook = ReturnType<typeof useAuth>

interface Props {
  auth: AuthHook
  right?: ReactNode
  onLogoClick?: () => void
}

export default function TopBar({ auth, right, onLogoClick }: Props) {
  return (
    <div className="topbar">
      <div className="app-frame topbar-inner">
        <div className="brand" style={{ cursor: onLogoClick ? 'pointer' : 'default' }} onClick={onLogoClick}>
          <div className="brand-mark"><Activity size={19} /></div>
          <div>
            <div className="brand-name">IADI</div>
            <div className="brand-sub hide-sm">Inventário de Avaliação do Desenvolvimento Infantil</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {right}
        <span className="hide-sm" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{auth.user?.email}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => auth.signOut()}>
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  )
}
