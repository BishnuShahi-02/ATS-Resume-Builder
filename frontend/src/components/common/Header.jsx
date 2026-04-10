export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon">R</div>
          <span className="logo-text">ResumeAI</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}>
          <span style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              display: 'inline-block',
              boxShadow: '0 0 6px var(--accent-emerald)',
            }} />
            AI Engine Online
          </span>
        </div>
      </div>
    </header>
  );
}
