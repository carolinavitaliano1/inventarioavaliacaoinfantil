import { useState, useRef, useEffect } from 'react'
import { FileDown, Loader2, ChevronDown } from 'lucide-react'

interface ExportAction {
  label: string
  onClick: () => void
  loading?: boolean
  primary?: boolean
}

interface Props {
  actions: ExportAction[]
  /** 'topbar' = compact dropdown for small spaces; 'block' = full-width grid buttons */
  variant?: 'topbar' | 'block'
  disabled?: boolean
}

/** Compact dropdown for topbar — shows one button that opens a menu */
function TopbarDropdown({ actions, disabled }: { actions: ExportAction[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const anyLoading = actions.some(a => a.loading)

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-subtle btn-sm"
        onClick={() => setOpen(o => !o)}
        disabled={disabled || anyLoading}
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {anyLoading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
        Exportar
        <ChevronDown size={12} style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 999,
          background: 'var(--surface-1, #fff)', border: '1px solid var(--border, #E2E8F0)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 160, overflow: 'hidden',
        }}>
          {actions.map((a, i) => (
            <button
              key={i}
              className="btn"
              disabled={a.loading}
              onClick={() => { a.onClick(); setOpen(false) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 0,
                borderBottom: i < actions.length - 1 ? '1px solid var(--border, #E2E8F0)' : 'none',
                fontWeight: a.primary ? 700 : 400,
                color: a.primary ? 'var(--brand, #2F64A0)' : 'var(--ink-1, #2D3748)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {a.loading ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Full-width grid of export buttons for use inside a card */
function BlockButtons({ actions, disabled }: { actions: ExportAction[]; disabled?: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 8,
    }}>
      {actions.map((a, i) => (
        <button
          key={i}
          className={a.primary ? 'btn btn-primary' : 'btn btn-ghost'}
          style={{ padding: '11px 14px', justifyContent: 'center', width: '100%' }}
          onClick={a.onClick}
          disabled={disabled || a.loading}
        >
          {a.loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
          {a.label}
        </button>
      ))}
    </div>
  )
}

export default function ExportButtons({ actions, variant = 'block', disabled }: Props) {
  if (variant === 'topbar') return <TopbarDropdown actions={actions} disabled={disabled} />
  return <BlockButtons actions={actions} disabled={disabled} />
}
