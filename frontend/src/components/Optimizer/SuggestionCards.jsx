export default function SuggestionCards({ suggestions = [] }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="glass-card-static">
      <div className="card-header">
        <div className="card-header-icon amber">💡</div>
        <div>
          <div className="card-title">Improvement Suggestions</div>
          <div className="card-subtitle">{suggestions.length} suggestions to boost your score</div>
        </div>
      </div>

      {suggestions.map((s, i) => (
        <div className="suggestion-card" key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span className={`suggestion-priority priority-${s.priority}`}>
              {s.priority}
            </span>
            {s.category && (
              <span className="chip neutral">{s.category}</span>
            )}
          </div>
          <div className="suggestion-title">{s.title}</div>
          <div className="suggestion-desc">{s.description}</div>

          {(s.example_before || s.example_after) && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              {s.example_before && (
                <div className="diff-removed">
                  <span style={{ fontSize: 'var(--font-xs)' }}>{s.example_before}</span>
                </div>
              )}
              {s.example_after && (
                <div className="diff-added">
                  <span style={{ fontSize: 'var(--font-xs)' }}>{s.example_after}</span>
                </div>
              )}
            </div>
          )}

          {s.estimated_impact && (
            <div style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--accent-emerald)',
              marginTop: 'var(--space-xs)',
            }}>
              📈 Estimated impact: +{s.estimated_impact} points
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
