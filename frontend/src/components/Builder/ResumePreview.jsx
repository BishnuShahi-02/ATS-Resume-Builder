import { useAppState } from '../../context/AppContext';

export default function ResumePreview() {
  const { state } = useAppState();
  const { resumeData, selectedTemplate } = state;
  const { personal_info, professional_summary, experience, education, skills, certifications } = resumeData;

  const hasContent = personal_info.name || professional_summary || experience.some(e => e.title || e.company);

  const contactParts = [
    personal_info.email,
    personal_info.phone,
    personal_info.location,
    personal_info.linkedin,
    personal_info.portfolio,
  ].filter(Boolean);

  // Template-based accent color
  const accentColor = selectedTemplate === 'modern' ? '#3b82f6' :
                      selectedTemplate === 'technical' ? '#06b6d4' : '#333';

  return (
    <div className="builder-preview-col">
      <div className="glass-card-static" style={{ padding: 'var(--space-md)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-md)',
        }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            📄 Live Preview
          </span>
          <span style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--text-muted)',
            textTransform: 'capitalize',
          }}>
            {selectedTemplate} template
          </span>
        </div>

        <div className="resume-preview-frame">
          {!hasContent ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: '#999',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <p style={{ fontSize: '11pt', fontWeight: 500 }}>Start filling the form</p>
              <p style={{ fontSize: '9pt', marginTop: 4 }}>Your resume preview will appear here</p>
            </div>
          ) : (
            <>
              {/* Name */}
              {personal_info.name && <h1>{personal_info.name}</h1>}

              {/* Contact */}
              {contactParts.length > 0 && (
                <div className="preview-contact">{contactParts.join(' | ')}</div>
              )}

              {/* Summary */}
              {professional_summary && (
                <>
                  <h2 style={{ borderColor: accentColor }}>Professional Summary</h2>
                  <p style={{ fontSize: '10pt', marginBottom: 8 }}>{professional_summary}</p>
                </>
              )}

              {/* Experience */}
              {experience.some(e => e.title || e.company) && (
                <>
                  <h2 style={{ borderColor: accentColor }}>Work Experience</h2>
                  {experience.map((exp, i) => (
                    (exp.title || exp.company) && (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div className="role-line">
                          <h3>{exp.title}</h3>
                          <span className="dates-text">
                            {exp.start_date}{exp.start_date && exp.end_date ? ' – ' : ''}{exp.end_date}
                          </span>
                        </div>
                        {exp.company && (
                          <div className="company-text">
                            {exp.company}{exp.location ? `, ${exp.location}` : ''}
                          </div>
                        )}
                        {exp.bullets.some(b => b.trim()) && (
                          <ul>
                            {exp.bullets.map((b, bi) => (
                              b.trim() && <li key={bi}>{b}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  ))}
                </>
              )}

              {/* Education */}
              {education.some(e => e.degree || e.institution) && (
                <>
                  <h2 style={{ borderColor: accentColor }}>Education</h2>
                  {education.map((edu, i) => (
                    (edu.degree || edu.institution) && (
                      <div key={i} style={{ marginBottom: 6 }}>
                        <div className="role-line">
                          <h3>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                          <span className="dates-text">{edu.graduation_date}</span>
                        </div>
                        <div className="company-text">
                          {edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                        </div>
                      </div>
                    )
                  ))}
                </>
              )}

              {/* Skills */}
              {(skills.technical.length > 0 || skills.tools.length > 0 || skills.soft_skills.length > 0) && (
                <>
                  <h2 style={{ borderColor: accentColor }}>Skills</h2>
                  {skills.technical.length > 0 && (
                    <div className="skills-line"><strong>Technical:</strong> {skills.technical.join(' · ')}</div>
                  )}
                  {skills.tools.length > 0 && (
                    <div className="skills-line"><strong>Tools:</strong> {skills.tools.join(' · ')}</div>
                  )}
                  {skills.soft_skills.length > 0 && (
                    <div className="skills-line"><strong>Soft Skills:</strong> {skills.soft_skills.join(' · ')}</div>
                  )}
                </>
              )}

              {/* Certifications */}
              {certifications && certifications.length > 0 && certifications.some(c => c.name) && (
                <>
                  <h2 style={{ borderColor: accentColor }}>Certifications</h2>
                  {certifications.map((cert, i) => (
                    cert.name && (
                      <div key={i} style={{ fontSize: '10pt', marginBottom: 4 }}>
                        <strong>{cert.name}</strong>
                        {cert.issuer ? ` — ${cert.issuer}` : ''}
                        {cert.date ? ` (${cert.date})` : ''}
                      </div>
                    )
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
