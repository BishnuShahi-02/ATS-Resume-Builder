import { useState } from 'react';
import { useAppState } from '../../context/AppContext';

export default function ResumeForm() {
  const { state, dispatch } = useAppState();
  const { resumeData } = state;
  const [openSections, setOpenSections] = useState({
    personal: true,
    summary: true,
    experience: true,
    education: false,
    skills: false,
    certifications: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (path, value) => {
    const newData = JSON.parse(JSON.stringify(resumeData));
    const keys = path.split('.');
    let obj = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = isNaN(keys[i]) ? keys[i] : parseInt(keys[i]);
      obj = obj[key];
    }
    const lastKey = isNaN(keys[keys.length - 1]) ? keys[keys.length - 1] : parseInt(keys[keys.length - 1]);
    obj[lastKey] = value;
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const addExperience = () => {
    const newData = { ...resumeData };
    newData.experience = [
      ...newData.experience,
      { company: '', title: '', location: '', start_date: '', end_date: '', bullets: [''] },
    ];
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const removeExperience = (index) => {
    const newData = { ...resumeData };
    newData.experience = newData.experience.filter((_, i) => i !== index);
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const addBullet = (expIndex) => {
    const newData = JSON.parse(JSON.stringify(resumeData));
    newData.experience[expIndex].bullets.push('');
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const newData = JSON.parse(JSON.stringify(resumeData));
    newData.experience[expIndex].bullets = newData.experience[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const addEducation = () => {
    const newData = { ...resumeData };
    newData.education = [
      ...newData.education,
      { institution: '', degree: '', field: '', graduation_date: '', gpa: '' },
    ];
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const removeEducation = (index) => {
    const newData = { ...resumeData };
    newData.education = newData.education.filter((_, i) => i !== index);
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const addCertification = () => {
    const newData = { ...resumeData };
    newData.certifications = [
      ...(newData.certifications || []),
      { name: '', issuer: '', date: '' },
    ];
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const removeCertification = (index) => {
    const newData = { ...resumeData };
    newData.certifications = newData.certifications.filter((_, i) => i !== index);
    dispatch({ type: 'SET_RESUME_DATA', payload: newData });
  };

  const SectionHeader = ({ id, title, icon, isOpen }) => (
    <div className="form-section-header" onClick={() => toggleSection(id)}>
      <span className="form-section-title">{icon} {title}</span>
      <span className={`form-section-toggle ${isOpen ? 'open' : ''}`}>▼</span>
    </div>
  );

  return (
    <div className="builder-form-col">
      {/* Personal Info */}
      <div className="form-section">
        <SectionHeader id="personal" title="Personal Information" icon="👤" isOpen={openSections.personal} />
        {openSections.personal && (
          <div className="form-section-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" id="builder-name" placeholder="John Doe" value={resumeData.personal_info.name} onChange={e => updateField('personal_info.name', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" id="builder-email" type="email" placeholder="john@email.com" value={resumeData.personal_info.email} onChange={e => updateField('personal_info.email', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" id="builder-phone" placeholder="+1 (555) 123-4567" value={resumeData.personal_info.phone} onChange={e => updateField('personal_info.phone', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" id="builder-location" placeholder="San Francisco, CA" value={resumeData.personal_info.location} onChange={e => updateField('personal_info.location', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn</label>
                <input className="form-input" id="builder-linkedin" placeholder="linkedin.com/in/johndoe" value={resumeData.personal_info.linkedin} onChange={e => updateField('personal_info.linkedin', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Portfolio / Website</label>
              <input className="form-input" id="builder-portfolio" placeholder="johndoe.com" value={resumeData.personal_info.portfolio} onChange={e => updateField('personal_info.portfolio', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Professional Summary */}
      <div className="form-section">
        <SectionHeader id="summary" title="Professional Summary" icon="📝" isOpen={openSections.summary} />
        {openSections.summary && (
          <div className="form-section-body">
            <div className="form-group">
              <label className="form-label">Write a compelling 3-4 sentence summary</label>
              <textarea className="form-textarea" id="builder-summary" placeholder="Results-driven software engineer with 5+ years of experience..." value={resumeData.professional_summary} onChange={e => updateField('professional_summary', e.target.value)} rows={4} />
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="form-section">
        <SectionHeader id="experience" title="Work Experience" icon="💼" isOpen={openSections.experience} />
        {openSections.experience && (
          <div className="form-section-body">
            {resumeData.experience.map((exp, ei) => (
              <div className="entry-card" key={ei}>
                <div className="entry-header">
                  <span className="entry-number">Experience #{ei + 1}</span>
                  {resumeData.experience.length > 1 && (
                    <button className="entry-remove" onClick={() => removeExperience(ei)}>✕</button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input className="form-input" placeholder="Software Engineer" value={exp.title} onChange={e => updateField(`experience.${ei}.title`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input className="form-input" placeholder="Google" value={exp.company} onChange={e => updateField(`experience.${ei}.company`, e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input className="form-input" placeholder="Jan 2022" value={exp.start_date} onChange={e => updateField(`experience.${ei}.start_date`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input className="form-input" placeholder="Present" value={exp.end_date} onChange={e => updateField(`experience.${ei}.end_date`, e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" placeholder="Mountain View, CA" value={exp.location} onChange={e => updateField(`experience.${ei}.location`, e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bullet Points (use STAR method)</label>
                  {exp.bullets.map((bullet, bi) => (
                    <div key={bi} style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                      <input className="form-input" placeholder="Led a team of 8 engineers to deliver..." value={bullet} onChange={e => updateField(`experience.${ei}.bullets.${bi}`, e.target.value)} style={{ flex: 1 }} />
                      {exp.bullets.length > 1 && (
                        <button className="entry-remove" onClick={() => removeBullet(ei, bi)} style={{ alignSelf: 'center' }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button className="add-entry-btn" onClick={() => addBullet(ei)} style={{ marginTop: 'var(--space-xs)' }}>
                    + Add Bullet Point
                  </button>
                </div>
              </div>
            ))}
            <button className="add-entry-btn" onClick={addExperience}>
              + Add Experience
            </button>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="form-section">
        <SectionHeader id="education" title="Education" icon="🎓" isOpen={openSections.education} />
        {openSections.education && (
          <div className="form-section-body">
            {resumeData.education.map((edu, ei) => (
              <div className="entry-card" key={ei}>
                <div className="entry-header">
                  <span className="entry-number">Education #{ei + 1}</span>
                  {resumeData.education.length > 1 && (
                    <button className="entry-remove" onClick={() => removeEducation(ei)}>✕</button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input className="form-input" placeholder="Bachelor of Science" value={edu.degree} onChange={e => updateField(`education.${ei}.degree`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Field of Study</label>
                    <input className="form-input" placeholder="Computer Science" value={edu.field} onChange={e => updateField(`education.${ei}.field`, e.target.value)} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input className="form-input" placeholder="MIT" value={edu.institution} onChange={e => updateField(`education.${ei}.institution`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Graduation Date</label>
                    <input className="form-input" placeholder="May 2020" value={edu.graduation_date} onChange={e => updateField(`education.${ei}.graduation_date`, e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">GPA (optional)</label>
                  <input className="form-input" placeholder="3.8" value={edu.gpa} onChange={e => updateField(`education.${ei}.gpa`, e.target.value)} />
                </div>
              </div>
            ))}
            <button className="add-entry-btn" onClick={addEducation}>
              + Add Education
            </button>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="form-section">
        <SectionHeader id="skills" title="Skills" icon="⚡" isOpen={openSections.skills} />
        {openSections.skills && (
          <div className="form-section-body">
            <SkillsInput label="Technical Skills" placeholder="Python, JavaScript, React..." skills={resumeData.skills.technical} onChange={val => updateField('skills.technical', val)} />
            <SkillsInput label="Tools & Technologies" placeholder="Docker, AWS, Git..." skills={resumeData.skills.tools} onChange={val => updateField('skills.tools', val)} />
            <SkillsInput label="Soft Skills" placeholder="Leadership, Communication..." skills={resumeData.skills.soft_skills} onChange={val => updateField('skills.soft_skills', val)} />
          </div>
        )}
      </div>

      {/* Certifications */}
      <div className="form-section">
        <SectionHeader id="certifications" title="Certifications" icon="🏅" isOpen={openSections.certifications} />
        {openSections.certifications && (
          <div className="form-section-body">
            {(resumeData.certifications || []).map((cert, ci) => (
              <div className="entry-card" key={ci}>
                <div className="entry-header">
                  <span className="entry-number">Cert #{ci + 1}</span>
                  <button className="entry-remove" onClick={() => removeCertification(ci)}>✕</button>
                </div>
                <div className="form-group">
                  <label className="form-label">Certification Name</label>
                  <input className="form-input" placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateField(`certifications.${ci}.name`, e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Issuing Organization</label>
                    <input className="form-input" placeholder="Amazon Web Services" value={cert.issuer} onChange={e => updateField(`certifications.${ci}.issuer`, e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" placeholder="2024" value={cert.date} onChange={e => updateField(`certifications.${ci}.date`, e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-entry-btn" onClick={addCertification}>
              + Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SkillsInput({ label, placeholder, skills, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInputValue('');
    }
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="tags-input-container">
        {skills.map((skill, i) => (
          <span className="tag" key={i}>
            {skill}
            <button className="tag-remove" onClick={() => removeSkill(i)}>×</button>
          </span>
        ))}
        <input
          className="tags-input"
          placeholder={skills.length === 0 ? placeholder : 'Add more...'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addSkill}
        />
      </div>
    </div>
  );
}
