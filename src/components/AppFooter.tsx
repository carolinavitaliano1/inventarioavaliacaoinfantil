export default function AppFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Dúvidas ou suporte:</span>
      <a href="mailto:prof.carolgurgel@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-3)', textDecoration: 'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        prof.carolgurgel@gmail.com
      </a>
      <a href="https://www.instagram.com/institutoprofcarolgurgel/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--ink-3)', textDecoration: 'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
        @institutoprofcarolgurgel
      </a>
    </footer>
  )
}
