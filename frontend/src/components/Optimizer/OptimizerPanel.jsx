import { useAppState } from '../../context/AppContext';
import { optimizeResume } from '../../services/api';
import SuggestionCards from './SuggestionCards';

export default function OptimizerPanel() {
  const { state, dispatch } = useAppState();
  const { optimizerResumeText, optimizerJdText, optimizeResult, isOptimizing, optimizeError } = state;

  const canOptimize = optimizerResumeText.trim().length >= 50 && optimizerJdText.trim().length >= 20;

  const handleOptimize = async () => {
    dispatch({ type: 'SET_OPTIMIZING', payload: true });
    try {
      const result = await optimizeResume(null, optimizerResumeText, optimizerJdText);
      dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: result });
    } catch (err) {
      dispatch({ type: 'SET_OPTIMIZE_ERROR', payload: err.message });
    }
  };

  return (
    <div className="page-section">
      <div className="section-header">
        <h2 className="section-title">✨ AI Resume Optimizer</h2>
        <p className="section-subtitle">
          Paste your resume and target JD — AI will rewrite and optimize for maximum ATS score
        </p>
      </div>

      {/* Input Section */}
      <div className="optimizer-input-section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-header-icon blue">📄</div>
              <div>
                <div className="card-title">Your Resume</div>
                <div className="card-subtitle">Paste your current resume text</div>
              </div>
            </div>
            <textarea
              id="optimizer-resume-input"
              className="form-textarea"
              placeholder="Paste your full resume text here..."
              value={optimizerResumeText}
              onChange={(e) => dispatch({ type: 'SET_OPTIMIZER_RESUME_TEXT', payload: e.target.value })}
              rows={12}
            />
          </div>

          <div className="glass-card">
            <div className="card-header">
              <div className="card-header-icon cyan">💼</div>
              <div>
                <div className="card-title">Target Job Description</div>
                <div className="card-subtitle">Paste the JD you&apos;re applying to</div>
              </div>
            </div>
            <textarea
              id="optimizer-jd-input"
              className="form-textarea"
              placeholder="Paste the full job description here..."
              value={optimizerJdText}
              onChange={(e) => dispatch({ type: 'SET_OPTIMIZER_JD_TEXT', payload: e.target.value })}
              rows={12}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            id="optimize-btn"
            className="btn btn-primary btn-lg"
            disabled={!canOptimize || isOptimizing}
            onClick={handleOptimize}
          >
            {isOptimizing ? (
              <>
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Optimizing with AI...
              </>
            ) : (
              <>✨ Optimize Resume</>
            )}
          </button>
        </div>

        {optimizeError && (
          <div className="glass-card-static animate-fade-in" style={{
            borderColor: 'var(--accent-red)',
            background: 'var(--accent-red-dim)',
          }}>
            <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>❌ {optimizeError}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {optimizeResult && !optimizeResult.error && (
        <div className="optimizer-results animate-fade-in-up">
          {/* Changes Made */}
          <div className="optimizer-panel">
            <div className="glass-card-static">
              <div className="card-header">
                <div className="card-header-icon emerald">🔄</div>
                <div>
                  <div className="card-title">Changes Made</div>
                  <div className="card-subtitle">
                    {optimizeResult.changes_made?.length || 0} optimizations applied
                    {optimizeResult.estimated_score_improvement && (
                      <> · Est. +{optimizeResult.estimated_score_improvement} pts</>
                    )}
                  </div>
                </div>
              </div>

              {optimizeResult.changes_made?.map((change, i) => (
                <div key={i} style={{ marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    marginBottom: 'var(--space-xs)',
                  }}>
                    <span className="chip neutral">{change.section}</span>
                    <span style={{
                      fontSize: 'var(--font-xs)',
                      color: 'var(--text-muted)',
                      textTransform: 'capitalize',
                    }}>
                      {change.change_type}
                    </span>
                  </div>

                  {change.original && (
                    <div className="diff-removed">
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-red)' }}>— </span>
                      <span style={{ fontSize: 'var(--font-sm)' }}>{change.original}</span>
                    </div>
                  )}
                  {change.optimized && (
                    <div className="diff-added">
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--accent-emerald)' }}>+ </span>
                      <span style={{ fontSize: 'var(--font-sm)' }}>{change.optimized}</span>
                    </div>
                  )}
                  {change.reason && (
                    <p style={{
                      fontSize: 'var(--font-xs)',
                      color: 'var(--text-muted)',
                      marginTop: 'var(--space-xs)',
                      fontStyle: 'italic',
                    }}>
                      💡 {change.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optimized Resume Preview */}
          <div className="optimizer-panel">
            <div className="glass-card-static">
              <div className="card-header">
                <div className="card-header-icon purple">📋</div>
                <div>
                  <div className="card-title">Optimized Resume</div>
                  <div className="card-subtitle">ATS-optimized version of your resume</div>
                </div>
              </div>

              {optimizeResult.optimized_resume && (
                <div className="resume-preview-frame" style={{ fontSize: '9.5pt' }}>
                  {optimizeResult.optimized_resume.personal_info?.name && (
                    <h1 style={{ fontSize: '16pt' }}>{optimizeResult.optimized_resume.personal_info.name}</h1>
                  )}

                  {optimizeResult.optimized_resume.professional_summary && (
                    <>
                      <h2 style={{ fontSize: '10.5pt' }}>Professional Summary</h2>
                      <p style={{ fontSize: '9.5pt' }}>{optimizeResult.optimized_resume.professional_summary}</p>
                    </>
                  )}

                  {optimizeResult.optimized_resume.experience?.map((exp, i) => (
                    <div key={i}>
                      {i === 0 && <h2 style={{ fontSize: '10.5pt' }}>Work Experience</h2>}
                      <div className="role-line">
                        <h3 style={{ fontSize: '10pt' }}>{exp.title}</h3>
                        <span className="dates-text" style={{ fontSize: '8.5pt' }}>
                          {exp.start_date} – {exp.end_date}
                        </span>
                      </div>
                      <div className="company-text" style={{ fontSize: '9pt' }}>{exp.company}</div>
                      <ul style={{ paddingLeft: 16 }}>
                        {exp.bullets?.map((b, bi) => (
                          <li key={bi} style={{ fontSize: '9pt' }}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {optimizeResult.optimized_resume.skills && (
                    <>
                      <h2 style={{ fontSize: '10.5pt' }}>Skills</h2>
                      {optimizeResult.optimized_resume.skills.technical?.length > 0 && (
                        <div style={{ fontSize: '9pt' }}>
                          <strong>Technical:</strong> {optimizeResult.optimized_resume.skills.technical.join(' · ')}
                        </div>
                      )}
                      {optimizeResult.optimized_resume.skills.tools?.length > 0 && (
                        <div style={{ fontSize: '9pt' }}>
                          <strong>Tools:</strong> {optimizeResult.optimized_resume.skills.tools.join(' · ')}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
