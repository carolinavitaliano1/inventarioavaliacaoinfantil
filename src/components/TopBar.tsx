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
        <a href="mailto:prof.carolgurgel@gmail.com" title="Suporte por e-mail" className="hide-sm" style={{ display: 'flex', alignItems: 'center', color: 'var(--ink-4)', transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-4)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </a>
        <a href="https://www.instagram.com/institutoprofcarolgurgel/" target="_blank" rel="noopener noreferrer" title="Instagram" className="hide-sm" style={{ display: 'flex', alignItems: 'center', color: 'var(--ink-4)', transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--primary)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--ink-4)'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        </a>
        <span className="hide-sm" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{auth.user?.email}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => auth.signOut()}>
          <LogOut size={14} /> Sair
        </button>
      </div>
    </div>
  )
}
