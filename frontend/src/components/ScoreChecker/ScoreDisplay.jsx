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
    keyword_match:       { label: 'Keyword Match',       icon: '🔑' },
    section_structure:   { label: 'Section Structure',   icon: '📋' },
    formatting_quality:  { label: 'Formatting Quality',  icon: '✨' },
    achievement_density: { label: 'Achievement Density', icon: '📈' },
  };

  const getBarClass = (score) => {
    if (score >= 70) return 'bar-gradient-emerald';
    if (score >= 40) return 'bar-gradient-amber';
    return 'bar-gradient-red';
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
  // RENDER: Optimization Complete (Step 3)
  // ═══════════════════════════════════════
  if (optimizeResult && !optimizeResult.error) {
    const r = optimizeResult.optimized_resume;
    const changes = optimizeResult.changes_made || [];
    const newScore = optimizeResult.estimated_new_score || overall_score + 15;
    const delta = newScore - overall_score;

    return (
      <div className="results-container animate-fade-in-up" ref={optimizeRef}>
        {/* ── Success Banner ── */}
        <div className="success-banner">
          <h2>🎉 Optimization Complete!</h2>
          <div className="score-comparison">
            <span className="score-old">{overall_score}</span>
            <span className="score-arrow">→</span>
            <span className="score-new">{newScore}</span>
            <span className="score-delta-pill">+{delta} points</span>
          </div>
          <p className="success-subtitle">
            {changes.length} changes made across {new Set(changes.map(c => c.section)).size || changes.length} sections
          </p>
        </div>

        {/* ── Changes + Preview Grid ── */}
        <div className="optimize-grid">
          {/* Changes Made */}
          <div className="glass-card">
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--emerald-500)' }}>✏️</span>
              <span className="card-title">Changes Made</span>
            </div>
            <div className="changes-scroll">
              {changes.map((change, i) => (
                <div
                  key={i}
                  className="diff-item animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="diff-section-label">
                    {change.section || `Change ${i + 1}`}
                  </div>
                  {change.original && (
                    <div className="diff-before">
                      <span className="diff-before-label">Before: </span>
                      <span className="diff-before-text">{change.original}</span>
                    </div>
                  )}
                  {change.optimized && (
                    <div className="diff-after">
                      <span className="diff-after-label">After: </span>
                      <span className="diff-after-text">{change.optimized}</span>
                    </div>
                  )}
                  {change.reason && (
                    <div className="diff-reason">{change.reason}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optimized Resume Preview */}
          <div className="glass-card">
            <div className="preview-header-bar">
              <div className="card-header" style={{ marginBottom: 0 }}>
                <span className="card-icon" style={{ color: 'var(--blue-500)' }}>📋</span>
                <span className="card-title">Optimized Resume</span>
              </div>
              <div className="preview-actions">
                <button
                  className={`btn btn-sm ${isEditing ? 'btn-sm-active' : 'btn-sm-inactive'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '✓ Done Editing' : '✏️ Edit Resume'}
                </button>
              </div>
            </div>

            {isEditing && (
              <div className="edit-mode-banner">
                ✏️ Edit mode ON — click any text to edit
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
                  <div className="resume-name">{r.personal_info.name}</div>
                )}
                {(() => {
                  const info = r.personal_info || {};
                  const parts = [info.email, info.phone, info.location, info.linkedin].filter(Boolean);
                  return parts.length > 0 ? (
                    <div className="resume-contact">{parts.join(' • ')}</div>
                  ) : null;
                })()}

                {r.professional_summary && (
                  <>
                    <div className="resume-section-title">Professional Summary</div>
                    <div className="resume-text">{r.professional_summary}</div>
                  </>
                )}

                {r.experience?.length > 0 && (
                  <>
                    <div className="resume-section-title">Work Experience</div>
                    {r.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div className="resume-job-header">
                          <span className="resume-job-title">{exp.title}</span>
                          <span className="resume-dates">
                            {exp.start_date} – {exp.end_date}
                          </span>
                        </div>
                        <div className="resume-company">
                          {exp.company}{exp.location ? `, ${exp.location}` : ''}
                        </div>
                        {exp.bullets?.length > 0 && (
                          <ul className="resume-bullets">
                            {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {r.projects?.length > 0 && (
                  <>
                    <div className="resume-section-title">Projects</div>
                    {r.projects.map((p, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <span className="resume-job-title">{p.name}</span>
                        {p.technologies && (
                          <div style={{ fontSize: 14, color: '#4B5563', fontStyle: 'italic' }}>{p.technologies}</div>
                        )}
                        {p.description && <div className="resume-text">{p.description}</div>}
                        {p.bullets?.length > 0 && (
                          <ul className="resume-bullets">{p.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {r.education?.length > 0 && (
                  <>
                    <div className="resume-section-title">Education</div>
                    {r.education.map((edu, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div className="resume-job-header">
                          <span className="resume-job-title">
                            {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                          </span>
                          <span className="resume-dates">{edu.graduation_date}</span>
                        </div>
                        <div className="resume-company">
                          {edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {r.skills && (
                  <>
                    <div className="resume-section-title">Skills</div>
                    <div className="resume-skills">
                      {[
                        ...(r.skills.technical || []),
                        ...(r.skills.tools || []),
                        ...(r.skills.soft_skills || []),
                      ].join(', ')}
                    </div>
                  </>
                )}

                {r.certifications?.length > 0 && (
                  <>
                    <div className="resume-section-title">Certifications</div>
                    {r.certifications.map((c, i) => (
                      <div key={i} className="resume-text" style={{ marginBottom: 4 }}>
                        {c.name}{c.issuer ? ` — ${c.issuer}` : ''}{c.date ? ` (${c.date})` : ''}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="action-buttons">
          <button className="btn btn-primary btn-download" onClick={handleDownloadPDF}>
            📥 Download as PDF
          </button>
          <button className="btn btn-ghost" onClick={() => {
            dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
            setIsEditing(false);
          }}>
            🔄 Re-optimize
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Optimization Loading
  // ═══════════════════════════════════════
  if (isOptimizing) {
    return (
      <div ref={optimizeRef} className="loading-container">
        <div className="glass-card loading-card animate-fade-in">
          <div className="spinner-ring" />
          <h3 className="loading-title">Optimizing with AI...</h3>
          <p className="loading-subtitle">This may take 15-30 seconds</p>
          <OptimizeProgress />
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Analysis Results (Step 2)
  // ═══════════════════════════════════════
  const criticalHighCount = suggestions.filter(
    s => s.priority === 'critical' || s.priority === 'high'
  ).length;

  return (
    <div className="results-container animate-fade-in-up">

      {/* ── Score Dashboard ── */}
      <div className="glass-card score-dashboard">
        <div className="score-gauge-wrapper">
          <AnimatedGauge score={overall_score} size={160} />
          <div className="score-delta-badge-sm">
            📈 +12 from average
          </div>
        </div>
        <div className="category-bars">
          {Object.entries(categoryMeta).map(([key, meta], i) => {
            const score = category_scores[key]?.score ?? 0;
            return (
              <div
                key={key}
                className={`category-bar-item animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="category-bar-header">
                  <span className="category-bar-label">
                    {meta.icon} {meta.label}
                  </span>
                  <span className="category-bar-value">{score}%</span>
                </div>
                <div className="category-bar-track">
                  <div
                    className={`category-bar-fill ${getBarClass(score)}`}
                    style={{
                      width: `${score}%`,
                      transitionDelay: `${i * 200}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Keywords + Suggestions ── */}
      <div className="analysis-grid">
        {/* Keyword Analysis */}
        <div className="glass-card">
          <div className="card-header">
            <span className="card-icon" style={{ color: 'var(--emerald-500)' }}>🔗</span>
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
        <div className="glass-card">
          <div className="card-header">
            <span className="card-icon" style={{ color: 'var(--amber-500)' }}>✨</span>
            <span className="card-title">Improvement Suggestions</span>
          </div>

          {suggestions.map((s, i) => (
            <div key={i} className="suggestion-item">
              <span className="suggestion-icon">
                {s.priority === 'critical' ? '🎯' : s.priority === 'high' ? '📊' : '✨'}
              </span>
              <div className="suggestion-body">
                <div className="suggestion-header">
                  <span className={`priority-badge ${s.priority}`}>{s.priority}</span>
                  <span className="suggestion-title">{s.title}</span>
                </div>
                <p className="suggestion-desc">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Optimize CTA ── */}
      <div className="optimize-cta-card">
        <div className="optimize-cta-icon-wrap">✨</div>
        <h3 className="optimize-cta-title">Ready to optimize?</h3>
        <p className="optimize-cta-desc">
          AI will fix {criticalHighCount} critical issues and add {missing_keywords.length} missing keywords
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
              className="form-textarea focus-emerald textarea-custom"
              placeholder="Add any specific instructions for the AI optimizer..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>
        )}

        <button
          className="btn btn-primary btn-optimize"
          disabled={isOptimizing}
          onClick={handleOptimize}
        >
          {isOptimizing ? (
            <><span className="spinner-sm" /> Optimizing...</>
          ) : (
            <>✨ Optimize My Resume</>
          )}
        </button>

        {optimizeError && (
          <p style={{ color: 'var(--red-500)', fontSize: 14, marginTop: 16 }}>
            ❌ {optimizeError}
          </p>
        )}
      </div>

      {optimizeResult?.error && (
        <div className="glass-card" style={{ borderColor: 'var(--red-500)' }}>
          <p style={{ color: 'var(--red-500)', fontWeight: 600 }}>❌ {optimizeResult.error}</p>
        </div>
      )}
    </div>
  );
}

// Sub-component for optimization loading text
function OptimizeProgress() {
  const texts = [
    'Analyzing improvements...',
    'Enhancing keyword density...',
    'Strengthening achievements...',
    'Finalizing optimization...',
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % texts.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-progress-text" key={idx}>
      {texts[idx]}
    </div>
  );
}
