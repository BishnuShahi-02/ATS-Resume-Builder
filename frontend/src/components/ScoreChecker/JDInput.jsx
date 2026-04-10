import { useAppState } from '../../context/AppContext';

export default function JDInput() {
  const { state, dispatch } = useAppState();

  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="card-icon">📋</span>
        <span className="card-title">Job Description</span>
      </div>

      <textarea
        className="form-textarea"
        placeholder="Paste the full job description here including requirements, responsibilities, and qualifications..."
        value={state.jdText}
        onChange={(e) => dispatch({ type: 'SET_JD_TEXT', payload: e.target.value })}
      />
      <div className="input-hint">Min. 20 characters</div>
    </div>
  );
}
