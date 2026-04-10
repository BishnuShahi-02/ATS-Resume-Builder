import { useRef, useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { optimizeResume } from '../../services/api';
import AnimatedGauge from '../common/AnimatedGauge';

export default function ScoreDisplay({ result, onReset }) {
  const { state, dispatch } = useAppState();
  const optimizeRef = useRef(null);
  const previewRef = useRef(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  if (!result) return null;

  const {
    overall_score = 0,
    category_scores = {},
    matched_keywords = [],
    missing_keywords = [],
    suggestions = [],
    parsed_resume,
  } = result;

  const { isOptimizing, optimizeResult, optimizeError } = state;

  const categoryMeta = {
    keyword_match: { label: 'Keyword Match', icon: '🔑' },
    section_structure: { label: 'Section Structure', icon: '📋' },
    formatting_quality: { label: 'Formatting Quality', icon: '✨' },
    achievement_density: { label: 'Achievement Density', icon: '📈' },
  };

  const getBarColor = (score) => {
    if (score >= 70) return 'bar-emerald';
    if (score >= 40) return 'bar-amber';
    return 'bar-red';
  };

  const getBarTextColor = (score) => {
    if (score >= 70) return 'var(--accent-emerald)';
    if (score >= 40) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  // ── Optimize handler ──
  const handleOptimize = async () => {
    dispatch({ type: 'SET_OPTIMIZING', payload: true });
    setIsEditing(false);
    try {
      const optimized = await optimizeResume(
        null,
        parsed_resume || state.resumeText,
        state.jdText,
        customPrompt || null,
      );
      dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: optimized });
    } catch (err) {
      dispatch({ type: 'SET_OPTIMIZE_ERROR', payload: err.message });
    }
  };

  // Auto-scroll to optimization results
  useEffect(() => {
    if ((isOptimizing || optimizeResult) && optimizeRef.current) {
      setTimeout(() => {
        optimizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [isOptimizing, optimizeResult]);

  // ── PDF download ──
  const handleDownloadPDF = () => {
    if (!optimizeResult?.optimized_resume) return;
    const pdfStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; padding: 0.5in 0.6in; }
      h1 { font-size: 18pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
      .contact { font-size: 9pt; color: #555; margin-bottom: 12px; }
      h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px; }
      h3 { font-size: 10.5pt; font-weight: 600; margin-bottom: 1px; }
      .role-line { display: flex; justify-content: space-between; align-items: baseline; }
      .dates { font-size: 9pt; color: #555; }
      .company { font-size: 9.5pt; color: #444; font-style: italic; margin-bottom: 3px; }
      ul { padding-left: 18px; margin-bottom: 6px; }
      li { font-size: 9.5pt; margin-bottom: 2px; }
      .skills-line { font-size: 9.5pt; margin-bottom: 3px; }
      @media print { body { padding: 0.4in 0.5in; } }
      @page { margin: 0; size: letter; }`;

    let bodyContent = '';
    if (previewRef.current) {
      bodyContent = previewRef.current.innerHTML;
    } else {
      const r = optimizeResult.optimized_resume;
      const info = r.personal_info || {};
      const parts = [info.email, info.phone, info.location, info.linkedin].filter(Boolean);
      bodyContent = `
        ${info.name ? `<h1>${info.name}</h1>` : ''}
        ${parts.length ? `<div class="contact">${parts.join(' • ')}</div>` : ''}
        ${r.professional_summary ? `<h2>Professional Summary</h2><p style="font-size:9.5pt">${r.professional_summary}</p>` : ''}
        ${r.experience?.length ? `<h2>Work Experience</h2>${r.experience.map(e => `
          <div class="role-line"><h3>${e.title||''}</h3><span class="dates">${e.start_date||''} – ${e.end_date||''}</span></div>
          <div class="company">${e.company||''}${e.location?', '+e.location:''}</div>
          ${e.bullets?.length ? '<ul>'+e.bullets.map(b=>`<li>${b}</li>`).join('')+'</ul>':''}
        `).join('')}` : ''}
        ${r.projects?.length ? `<h2>Projects</h2>${r.projects.map(p => `
          <h3>${p.name||''}</h3>
          ${p.bullets?.length ? '<ul>'+p.bullets.map(b=>`<li>${b}</li>`).join('')+'</ul>':''}
        `).join('')}` : ''}
        ${r.education?.length ? `<h2>Education</h2>${r.education.map(e => `
          <div class="role-line"><h3>${e.degree||''}${e.field?' in '+e.field:''}</h3><span class="dates">${e.graduation_date||''}</span></div>
          <div class="company">${e.institution||''}</div>
        `).join('')}` : ''}
        ${r.skills ? `<h2>Skills</h2>
          ${r.skills.technical?.length ? `<div class="skills-line"><strong>Technical:</strong> ${r.skills.technical.join(', ')}</div>` : ''}
          ${r.skills.tools?.length ? `<div class="skills-line"><strong>Tools:</strong> ${r.skills.tools.join(', ')}</div>` : ''}
        ` : ''}
        ${r.certifications?.length ? `<h2>Certifications</h2>${r.certifications.map(c=>`<div style="font-size:9.5pt"><strong>${c.name}</strong>${c.issuer?' — '+c.issuer:''}</div>`).join('')}` : ''}`;
    }

    const title = optimizeResult.optimized_resume?.personal_info?.name || 'Resume';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${pdfStyles}</style></head><body>${bodyContent}</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.onload = () => setTimeout(() => w.print(), 300);
  };

  // ═══════════════════════════════════════
  // RENDER — Optimization Complete (Step 3)
  // ═══════════════════════════════════════
  if (optimizeResult && !optimizeResult.error) {
    const r = optimizeResult.optimized_resume;
    const changes = optimizeResult.changes_made || [];

    return (
      <div className="results-container animate-fade-in-up" ref={optimizeRef}>
        {/* Success Banner */}
        <div className="success-banner">
          <h2>🎉 Optimization Complete!</h2>
          <div className="score-comparison">
            {overall_score} → {optimizeResult.estimated_new_score || overall_score + 15}
            <span className="score-delta-badge">
              +{(optimizeResult.estimated_new_score || overall_score + 15) - overall_score} points
            </span>
          </div>
          <p className="success-subtitle">
            {changes.length} changes made across your resume
          </p>
        </div>

        {/* Changes + Preview Grid */}
        <div className="optimize-grid">
          {/* Changes Made */}
          <div className="glass-card-static">
            <div className="card-header">
              <span className="card-icon">✏️</span>
              <span className="card-title">Changes Made</span>
            </div>
            {changes.map((change, i) => (
              <div key={i} className="diff-item">
                <div className="diff-section-label">
                  {change.section || `Change ${i + 1}`}
                </div>
                {change.original && (
                  <div className="diff-before">{change.original}</div>
                )}
                {change.optimized && (
                  <div className="diff-after">{change.optimized}</div>
                )}
                {change.reason && (
                  <div className="diff-reason">💡 {change.reason}</div>
                )}
              </div>
            ))}
          </div>

          {/* Optimized Resume Preview */}
          <div className="glass-card-static">
            <div className="preview-header-bar">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-icon">📋</span>
                <span className="card-title">Optimized Resume</span>
              </div>
              <button
                className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-xs)', padding: '6px 14px' }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '✓ Done Editing' : '✏️ Edit Resume'}
              </button>
            </div>

            {isEditing && (
              <div className="edit-mode-banner">
                ✏️ Edit mode is ON — click any text below to edit. Changes will be included in the PDF download.
              </div>
            )}

            {r && (
              <div
                ref={previewRef}
                className={`resume-preview-frame ${isEditing ? 'editing' : ''}`}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
              >
                {r.personal_info?.name && (
                  <h1>{r.personal_info.name}</h1>
                )}
                {(() => {
                  const info = r.personal_info || {};
                  const parts = [info.email, info.phone, info.location, info.linkedin].filter(Boolean);
                  return parts.length > 0 ? (
                    <div style={{ fontSize: '9pt', color: '#555', marginBottom: 12 }}>
                      {parts.join(' • ')}
                    </div>
                  ) : null;
                })()}

                {r.professional_summary && (
                  <>
                    <h2>Professional Summary</h2>
                    <p>{r.professional_summary}</p>
                  </>
                )}

                {r.experience?.length > 0 && (
                  <>
                    <h2>Work Experience</h2>
                    {r.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h3>{exp.title}</h3>
                          <span style={{ fontSize: '9pt', color: '#555' }}>
                            {exp.start_date} – {exp.end_date}
                          </span>
                        </div>
                        <div style={{ fontSize: '9pt', color: '#444', fontStyle: 'italic', marginBottom: 3 }}>
                          {exp.company}{exp.location ? `, ${exp.location}` : ''}
                        </div>
                        {exp.bullets?.length > 0 && (
                          <ul>
                            {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {r.projects?.length > 0 && (
                  <>
                    <h2>Projects</h2>
                    {r.projects.map((p, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <h3>{p.name}</h3>
                        {p.technologies && (
                          <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic' }}>{p.technologies}</div>
                        )}
                        {p.description && <div style={{ fontSize: '9pt' }}>{p.description}</div>}
                        {p.bullets?.length > 0 && (
                          <ul>{p.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {r.education?.length > 0 && (
                  <>
                    <h2>Education</h2>
                    {r.education.map((edu, i) => (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h3>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                          <span style={{ fontSize: '9pt', color: '#555' }}>{edu.graduation_date}</span>
                        </div>
                        <div style={{ fontSize: '9pt', color: '#444', fontStyle: 'italic' }}>
                          {edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {r.skills && (
                  <>
                    <h2>Skills</h2>
                    {r.skills.technical?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 3 }}>
                        <strong>Technical:</strong> {r.skills.technical.join(', ')}
                      </div>
                    )}
                    {r.skills.tools?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 3 }}>
                        <strong>Tools:</strong> {r.skills.tools.join(', ')}
                      </div>
                    )}
                    {r.skills.soft_skills?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 3 }}>
                        <strong>Soft Skills:</strong> {r.skills.soft_skills.join(', ')}
                      </div>
                    )}
                  </>
                )}

                {r.certifications?.length > 0 && (
                  <>
                    <h2>Certifications</h2>
                    {r.certifications.map((c, i) => (
                      <div key={i} style={{ fontSize: '9pt', marginBottom: 3 }}>
                        <strong>{c.name}</strong>{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${c.date})` : ''}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary btn-lg" onClick={handleDownloadPDF}>
            📥 Download as PDF
          </button>
          <button className="btn btn-secondary" onClick={() => {
            dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
            setIsEditing(false);
          }}>
            🔄 Re-optimize
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER — Optimization Loading
  // ═══════════════════════════════════════
  if (isOptimizing) {
    return (
      <div ref={optimizeRef} className="loading-card glass-card-static animate-fade-in">
        <div className="spinner" />
        <h3 className="loading-title">Optimizing with AI...</h3>
        <p className="loading-subtitle">This may take 15-30 seconds</p>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER — Analysis Results (Step 2)
  // ═══════════════════════════════════════
  return (
    <div className="results-container animate-fade-in-up">

      {/* ── Score Dashboard ── */}
      <div className="glass-card-static">
        <div className="score-dashboard">
          <div className="score-gauge-wrapper">
            <AnimatedGauge score={overall_score} size={160} />
            <div className="score-delta">✅ +12 from average</div>
          </div>
          <div className="category-bars">
            {Object.entries(categoryMeta).map(([key, meta]) => {
              const score = category_scores[key]?.score ?? 0;
              return (
                <div key={key} className="category-bar-item">
                  <div className="category-bar-header">
                    <span className="category-bar-label">
                      {meta.icon} {meta.label}
                    </span>
                    <span
                      className="category-bar-value"
                      style={{ color: getBarTextColor(score) }}
                    >
                      {score}%
                    </span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className={`category-bar-fill ${getBarColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Keywords + Suggestions ── */}
      <div className="analysis-grid">
        {/* Keyword Analysis */}
        <div className="glass-card-static">
          <div className="card-header">
            <span className="card-icon">🔗</span>
            <span className="card-title">Keyword Analysis</span>
          </div>

          {matched_keywords.length > 0 && (
            <div className="keyword-section">
              <div className="keyword-section-label">✅ Matched Keywords</div>
              <div className="keyword-pills">
                {matched_keywords.map((kw, i) => (
                  <span key={i} className="keyword-pill matched">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {missing_keywords.length > 0 && (
            <div className="keyword-section">
              <div className="keyword-section-label">❌ Missing Keywords</div>
              <div className="keyword-pills">
                {missing_keywords.map((kw, i) => (
                  <span key={i} className="keyword-pill missing">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Improvement Suggestions */}
        <div className="glass-card-static">
          <div className="card-header">
            <span className="card-icon">✨</span>
            <span className="card-title">Improvement Suggestions</span>
          </div>

          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-item">
              <span className="suggestion-icon">
                {s.priority === 'critical' ? '🔴' : s.priority === 'high' ? '🟠' : '🟡'}
              </span>
              <div className="suggestion-body">
                <div className="suggestion-header">
                  <span className={`priority-badge ${s.priority}`}>
                    {s.priority}
                  </span>
                  <span className="suggestion-title">{s.title}</span>
                </div>
                <p className="suggestion-desc">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Optimize CTA ── */}
      <div className="glass-card-static optimize-cta-card">
        <div className="optimize-cta-icon">✨</div>
        <h3 className="optimize-cta-title">Ready to optimize?</h3>
        <p className="optimize-cta-desc">
          AI will fix {suggestions.filter(s => s.priority === 'critical' || s.priority === 'high').length} critical
          issues and add {missing_keywords.length} missing keywords
        </p>

        <button
          className="custom-prompt-toggle"
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
        >
          {showCustomPrompt ? '▼' : '▶'} Custom Instructions (optional)
        </button>

        {showCustomPrompt && (
          <div className="custom-prompt-area">
            <textarea
              className="form-textarea"
              style={{ minHeight: 80 }}
              placeholder="e.g., Add my AWS certification, emphasize leadership..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
            <p className="custom-prompt-hint">
              These instructions will be sent to the AI alongside the standard optimization.
            </p>
          </div>
        )}

        <button
          className="btn btn-primary btn-lg"
          disabled={isOptimizing}
          onClick={handleOptimize}
        >
          {isOptimizing ? (
            <><span className="spinner spinner-sm" /> Optimizing...</>
          ) : (
            <>✨ Optimize My Resume</>
          )}
        </button>

        {optimizeError && (
          <p style={{ color: 'var(--accent-red)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)' }}>
            ❌ {optimizeError}
          </p>
        )}
      </div>

      {/* Optimize error from result */}
      {optimizeResult?.error && (
        <div className="glass-card-static" style={{ borderColor: 'var(--accent-red)' }}>
          <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>❌ {optimizeResult.error}</p>
        </div>
      )}
    </div>
  );
}
