import { useRef, useEffect, useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { optimizeResume } from '../../services/api';
import AnimatedGauge from '../common/AnimatedGauge';

export default function ScoreDisplay({ result }) {
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
    summary = '',
    metrics = {},
    parsed_resume = '',
  } = result;

  const { optimizeResult, isOptimizing, optimizeError } = state;

  const getBarColor = (score) => {
    if (score >= 70) return 'var(--gradient-score-high)';
    if (score >= 40) return 'var(--gradient-score-mid)';
    return 'var(--gradient-score-low)';
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--accent-emerald)';
    if (score >= 40) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  const categoryLabels = {
    keyword_match: { label: 'Keyword Match', icon: '🔑' },
    section_structure: { label: 'Section Structure', icon: '📋' },
    formatting_quality: { label: 'Formatting Quality', icon: '✨' },
    achievement_density: { label: 'Achievement Density', icon: '📈' },
  };

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

  // Auto-scroll to optimization loading/results
  useEffect(() => {
    if ((isOptimizing || optimizeResult) && optimizeRef.current) {
      setTimeout(() => {
        optimizeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [isOptimizing, optimizeResult]);

  const handleDownloadPDF = () => {
    if (!optimizeResult?.optimized_resume) return;

    const pdfStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; padding: 0.5in 0.6in; }
  h1 { font-size: 18pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .contact, .preview-contact { font-size: 9pt; color: #555; margin-bottom: 12px; }
  h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1.5px solid #333; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px; }
  h3 { font-size: 10.5pt; font-weight: 600; margin-bottom: 1px; }
  .role-line { display: flex; justify-content: space-between; align-items: baseline; }
  .dates, .dates-text { font-size: 9pt; color: #555; }
  .company, .company-text { font-size: 9.5pt; color: #444; font-style: italic; margin-bottom: 3px; }
  .tech { font-size: 9pt; color: #555; font-style: italic; margin-bottom: 2px; }
  .desc { font-size: 9.5pt; margin-bottom: 3px; }
  ul { padding-left: 18px; margin-bottom: 6px; }
  li { font-size: 9.5pt; margin-bottom: 2px; }
  .skills-line { font-size: 9.5pt; margin-bottom: 3px; }
  .cert { font-size: 9.5pt; margin-bottom: 3px; }
  @media print { body { padding: 0.4in 0.5in; } }
  @page { margin: 0; size: letter; }`;

    let bodyContent = '';

    // If user has been editing, use the live DOM content from the preview
    if (previewRef.current) {
      bodyContent = previewRef.current.innerHTML;
    } else {
      // Fallback: build from structured data
      const r = optimizeResult.optimized_resume;
      const info = r.personal_info || {};
      const contactParts = [info.email, info.phone, info.location, info.linkedin, info.portfolio].filter(Boolean);
      bodyContent = `
        ${info.name ? `<h1>${info.name}</h1>` : ''}
        ${contactParts.length ? `<div class="contact">${contactParts.join(' | ')}</div>` : ''}
        ${r.professional_summary ? `<h2>Professional Summary</h2><p style="font-size:9.5pt;margin-bottom:6px">${r.professional_summary}</p>` : ''}
        ${r.experience?.length ? `<h2>Work Experience</h2>${r.experience.map(exp => `
          <div class="role-line"><h3>${exp.title || ''}</h3><span class="dates">${exp.start_date || ''} – ${exp.end_date || ''}</span></div>
          <div class="company">${exp.company || ''}${exp.location ? ', ' + exp.location : ''}</div>
          ${exp.bullets?.length ? '<ul>' + exp.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>' : ''}
        `).join('')}` : ''}
        ${r.projects?.length ? `<h2>Projects</h2>${r.projects.map(p => `
          <h3>${p.name || ''}</h3>
          ${p.technologies ? `<div class="tech">${p.technologies}</div>` : ''}
          ${p.description ? `<div class="desc">${p.description}</div>` : ''}
          ${p.bullets?.length ? '<ul>' + p.bullets.map(b => `<li>${b}</li>`).join('') + '</ul>' : ''}
        `).join('')}` : ''}
        ${r.education?.length ? `<h2>Education</h2>${r.education.map(edu => `
          <div class="role-line"><h3>${edu.degree || ''}${edu.field ? ' in ' + edu.field : ''}</h3><span class="dates">${edu.graduation_date || ''}</span></div>
          <div class="company">${edu.institution || ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}</div>
        `).join('')}` : ''}
        ${r.skills ? `<h2>Skills</h2>
          ${r.skills.technical?.length ? `<div class="skills-line"><strong>Technical:</strong> ${r.skills.technical.join(', ')}</div>` : ''}
          ${r.skills.tools?.length ? `<div class="skills-line"><strong>Tools:</strong> ${r.skills.tools.join(', ')}</div>` : ''}
          ${r.skills.soft_skills?.length ? `<div class="skills-line"><strong>Soft Skills:</strong> ${r.skills.soft_skills.join(', ')}</div>` : ''}
        ` : ''}
        ${r.certifications?.length ? `<h2>Certifications</h2>${r.certifications.map(c => `
          <div class="cert"><strong>${c.name}</strong>${c.issuer ? ' — ' + c.issuer : ''}${c.date ? ' (' + c.date + ')' : ''}</div>
        `).join('')}` : ''}`;
    }

    const r = optimizeResult.optimized_resume;
    const title = r.personal_info?.name || 'Resume';
    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title} — Optimized Resume</title>
<style>${pdfStyles}</style>
</head><body>${bodyContent}</body></html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 300);
    };
  };

  return (
    <div className="animate-fade-in-up">
      {/* ═══ Score Dashboard — Gauge + Category Bars Horizontal ═══ */}
      <div className="glass-card-static">
        <div className="score-dashboard">
          <div className="score-dashboard-gauge">
            <AnimatedGauge score={overall_score} />
          </div>
          <div className="score-dashboard-bars">
            {Object.entries(category_scores).map(([key, data]) => {
              const info = categoryLabels[key] || { label: key, icon: '📌' };
              const score = data?.score ?? 0;
              return (
                <div className="progress-bar-container" key={key}>
                  <div className="progress-bar-header">
                    <span className="progress-bar-label">
                      {info.icon} {info.label}
                    </span>
                    <span className="progress-bar-value" style={{ color: getScoreColor(score) }}>
                      {score}%
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${score}%`,
                        background: getBarColor(score),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {summary && (
          <div className="score-summary-text">{summary}</div>
        )}
      </div>

      {/* ═══ Details Grid — Keywords + Metrics + Suggestions ═══ */}
      <div className="score-details-grid">
        {/* Left Column — Keywords + Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Keywords */}
          <div className="glass-card-static">
            <div className="card-header">
              <div className="card-header-icon emerald">🔑</div>
              <div className="card-title">Keyword Analysis</div>
            </div>

            {matched_keywords.length > 0 && (
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: 'var(--accent-emerald)',
                  marginBottom: 'var(--space-sm)',
                }}>
                  ✅ Matched ({matched_keywords.length})
                </h4>
                <div className="chips-container">
                  {matched_keywords.map((kw, i) => (
                    <span key={i} className="chip matched">✓ {kw}</span>
                  ))}
                </div>
              </div>
            )}

            {missing_keywords.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: 'var(--accent-red)',
                  marginBottom: 'var(--space-sm)',
                }}>
                  ❌ Missing ({missing_keywords.length})
                </h4>
                <div className="chips-container">
                  {missing_keywords.map((kw, i) => (
                    <span key={i} className="chip missing">✗ {kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metrics */}
          {metrics && metrics.total_bullets > 0 && (
            <div className="glass-card-static">
              <div className="card-header">
                <div className="card-header-icon amber">📈</div>
                <div className="card-title">Resume Metrics</div>
              </div>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-value">{metrics.total_bullets}</div>
                  <div className="metric-label">Total Bullets</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.bullets_with_metrics}</div>
                  <div className="metric-label">With Metrics</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.metric_density}%</div>
                  <div className="metric-label">Metric Density</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Suggestions */}
        <div className="glass-card-static">
          <div className="card-header">
            <div className="card-header-icon blue">💡</div>
            <div className="card-title">Improvement Suggestions</div>
          </div>

          {suggestions.length > 0 ? suggestions.map((s, i) => (
            <div className="suggestion-card" key={i}>
              <span className={`suggestion-priority priority-${s.priority}`}>
                {s.priority}
              </span>
              <div className="suggestion-title">{s.title}</div>
              <div className="suggestion-desc">{s.description}</div>
              {s.section && (
                <div className="suggestion-section">
                  📌 Section: {s.section}
                </div>
              )}
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              No suggestions — your resume looks great!
            </p>
          )}
        </div>
      </div>

      {/* ═══ Optimize CTA ═══ */}
      {!optimizeResult && (
        <div className="glass-card-static optimize-cta" style={{ textAlign: 'center', padding: 'var(--space-2xl)', marginTop: 'var(--space-lg)' }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-md)' }}>✨</div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
            Ready to optimize?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', maxWidth: 420, margin: '0 auto var(--space-md)' }}>
            AI will rewrite your resume based on the {suggestions.filter(s => s.priority === 'critical' || s.priority === 'high').length} critical/high-priority issues
            and {missing_keywords.length} missing keywords found above.
          </p>

          {/* Custom Prompt Toggle */}
          <div style={{ marginBottom: 'var(--space-lg)', maxWidth: 520, margin: '0 auto var(--space-lg)' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: 'var(--font-xs)', padding: 'var(--space-xs) var(--space-md)' }}
              onClick={() => setShowCustomPrompt(!showCustomPrompt)}
            >
              {showCustomPrompt ? '▼' : '▶'} Custom Instructions (optional)
            </button>
            {showCustomPrompt && (
              <div style={{ marginTop: 'var(--space-sm)', textAlign: 'left' }}>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: 80, fontSize: 'var(--font-sm)' }}
                  placeholder="e.g., Add my AWS Solutions Architect certification, emphasize leadership experience, include my GitHub projects..." 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                  These instructions will be sent to the AI alongside the standard optimization.
                </p>
              </div>
            )}
          </div>

          <button
            id="optimize-btn"
            className="btn btn-primary btn-lg"
            disabled={isOptimizing}
            onClick={handleOptimize}
          >
            {isOptimizing ? (
              <>
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Optimizing with AI...
              </>
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
      )}

      {/* ═══ Optimization Loading ═══ */}
      {isOptimizing && (
        <div ref={optimizeRef} className="glass-card-static animate-fade-in" style={{ textAlign: 'center', padding: 'var(--space-2xl)', marginTop: 'var(--space-lg)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto var(--space-lg)' }} />
          <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-sm)' }}>
            Optimizing Your Resume
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            AI is rewriting your resume to fix ATS issues and incorporate missing keywords...
          </p>
        </div>
      )}

      {/* ═══ Optimization Results ═══ */}
      {optimizeResult && !optimizeResult.error && (
        <>
          <div ref={optimizeRef} className="glass-card-static animate-fade-in-up" style={{ borderColor: 'var(--accent-emerald)', borderWidth: 2, marginTop: 'var(--space-lg)' }}>
            <div className="card-header">
              <div className="card-header-icon emerald">🔄</div>
              <div>
                <div className="card-title">Optimization Complete</div>
                <div className="card-subtitle">
                  {optimizeResult.changes_made?.length || 0} changes applied
                  {optimizeResult.estimated_score_improvement && (
                    <> · Estimated +{optimizeResult.estimated_score_improvement} pts</>
                  )}
                </div>
              </div>
            </div>

            {optimizeResult.changes_made?.map((change, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-lg)' }}>
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

          {/* Optimized Resume Preview */}
          <div className="glass-card-static animate-fade-in-up" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div className="card-header-icon purple">📋</div>
                <div className="card-title">Optimized Resume</div>
              </div>
              <button
                className={`btn ${isEditing ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-xs)', padding: 'var(--space-xs) var(--space-md)' }}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '✓ Done Editing' : '✏️ Edit Resume'}
              </button>
            </div>

            {isEditing && (
              <div style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--accent-blue-dim)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-md)',
                fontSize: 'var(--font-xs)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}>
                ✏️ Edit mode is ON — click any text below to edit. Changes will be included in the PDF download.
              </div>
            )}

            {optimizeResult.optimized_resume && (
              <div
                ref={previewRef}
                className="resume-preview-frame"
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                style={{
                  fontSize: '9.5pt',
                  outline: isEditing ? '2px solid var(--accent-blue)' : 'none',
                  cursor: isEditing ? 'text' : 'default',
                }}
              >
                {optimizeResult.optimized_resume.personal_info?.name && (
                  <h1 style={{ fontSize: '16pt' }}>{optimizeResult.optimized_resume.personal_info.name}</h1>
                )}

                {(() => {
                  const info = optimizeResult.optimized_resume.personal_info || {};
                  const parts = [info.email, info.phone, info.location, info.linkedin].filter(Boolean);
                  return parts.length > 0 ? (
                    <div className="preview-contact">{parts.join(' | ')}</div>
                  ) : null;
                })()}

                {optimizeResult.optimized_resume.professional_summary && (
                  <>
                    <h2 style={{ fontSize: '10.5pt' }}>Professional Summary</h2>
                    <p style={{ fontSize: '9.5pt', marginBottom: 8 }}>{optimizeResult.optimized_resume.professional_summary}</p>
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
                    <div className="company-text" style={{ fontSize: '9pt' }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </div>
                    <ul style={{ paddingLeft: 16 }}>
                      {exp.bullets?.map((b, bi) => (
                        <li key={bi} style={{ fontSize: '9pt' }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {optimizeResult.optimized_resume.education?.map((edu, i) => (
                  <div key={i}>
                    {i === 0 && <h2 style={{ fontSize: '10.5pt' }}>Education</h2>}
                    <div className="role-line">
                      <h3 style={{ fontSize: '10pt' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                      <span className="dates-text" style={{ fontSize: '8.5pt' }}>{edu.graduation_date}</span>
                    </div>
                    <div className="company-text" style={{ fontSize: '9pt' }}>
                      {edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                ))}

                {optimizeResult.optimized_resume.projects?.length > 0 && (
                  <>
                    <h2 style={{ fontSize: '10.5pt' }}>Projects</h2>
                    {optimizeResult.optimized_resume.projects.map((proj, i) => (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div className="role-line">
                          <h3 style={{ fontSize: '10pt' }}>{proj.name}</h3>
                        </div>
                        {proj.technologies && (
                          <div style={{ fontSize: '9pt', color: '#555', fontStyle: 'italic', marginBottom: 2 }}>
                            {proj.technologies}
                          </div>
                        )}
                        {proj.description && (
                          <div style={{ fontSize: '9pt', marginBottom: 4 }}>{proj.description}</div>
                        )}
                        {proj.bullets?.length > 0 && (
                          <ul style={{ paddingLeft: 16 }}>
                            {proj.bullets.map((b, bi) => (
                              <li key={bi} style={{ fontSize: '9pt' }}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {optimizeResult.optimized_resume.skills && (
                  <>
                    <h2 style={{ fontSize: '10.5pt' }}>Skills</h2>
                    {optimizeResult.optimized_resume.skills.technical?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 4 }}>
                        <strong>Technical:</strong> {optimizeResult.optimized_resume.skills.technical.join(' · ')}
                      </div>
                    )}
                    {optimizeResult.optimized_resume.skills.tools?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 4 }}>
                        <strong>Tools:</strong> {optimizeResult.optimized_resume.skills.tools.join(' · ')}
                      </div>
                    )}
                    {optimizeResult.optimized_resume.skills.soft_skills?.length > 0 && (
                      <div style={{ fontSize: '9pt', marginBottom: 4 }}>
                        <strong>Soft Skills:</strong> {optimizeResult.optimized_resume.skills.soft_skills.join(' · ')}
                      </div>
                    )}
                  </>
                )}

                {optimizeResult.optimized_resume.certifications?.length > 0 && (
                  <>
                    <h2 style={{ fontSize: '10.5pt' }}>Certifications</h2>
                    {optimizeResult.optimized_resume.certifications.map((cert, i) => (
                      <div key={i} style={{ fontSize: '9pt', marginBottom: 4 }}>
                        <strong>{cert.name}</strong>
                        {cert.issuer ? ` — ${cert.issuer}` : ''}
                        {cert.date ? ` (${cert.date})` : ''}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleDownloadPDF}
            >
              📥 Download as PDF
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null })}
            >
              🔄 Re-optimize
            </button>
          </div>
        </>
      )}

      {/* Optimize error (when result failed) */}
      {optimizeResult?.error && (
        <div className="glass-card-static" style={{ borderColor: 'var(--accent-red)', marginTop: 'var(--space-lg)' }}>
          <p style={{ color: 'var(--accent-red)', fontWeight: 600 }}>❌ {optimizeResult.error}</p>
          {optimizeResult.details && (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-sm)' }}>
              {optimizeResult.details}
            </p>
          )}
          <button
            className="btn btn-secondary"
            style={{ marginTop: 'var(--space-md)' }}
            onClick={() => {
              dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
              dispatch({ type: 'SET_OPTIMIZE_ERROR', payload: null });
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
