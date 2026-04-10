import { useAppState } from '../../context/AppContext';

export default function JDInput() {
  const { state, dispatch } = useAppState();

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-header-icon cyan">💼</div>
        <div>
          <div className="card-title">Job Description</div>
          <div className="card-subtitle">Paste the target job description</div>
        </div>
      </div>

      <textarea
        id="jd-text-input"
        className="form-textarea"
        style={{ minHeight: 160 }}
        placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
        value={state.jdText}
        onChange={(e) => dispatch({ type: 'SET_JD_TEXT', payload: e.target.value })}
        rows={8}
      />

      <div style={{ marginTop: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
          {state.jdText.length > 0 ? `${state.jdText.length} characters` : 'Min. 20 characters'}
        </span>
      </div>
    </div>
  );
}
