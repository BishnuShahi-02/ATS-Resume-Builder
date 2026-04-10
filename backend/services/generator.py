import io


ATS_RESUME_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.6in 0.75in;
}

h1 {
    font-size: 20pt;
    font-weight: 700;
    color: #111;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.contact-info {
    font-size: 10pt;
    color: #444;
    margin-bottom: 16px;
}

.contact-info span {
    margin-right: 12px;
}

h2 {
    font-size: 12pt;
    font-weight: 700;
    color: #111;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1.5px solid #333;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 8px;
}

h3 {
    font-size: 11pt;
    font-weight: 600;
    color: #222;
    margin-bottom: 2px;
}

.role-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2px;
}

.role-header .dates {
    font-size: 10pt;
    color: #555;
    font-weight: 400;
    white-space: nowrap;
}

.company {
    font-size: 10.5pt;
    color: #444;
    font-style: italic;
    margin-bottom: 4px;
}

ul {
    padding-left: 18px;
    margin-bottom: 8px;
}

li {
    margin-bottom: 3px;
    font-size: 10.5pt;
    line-height: 1.45;
}

.skills-list {
    list-style: none;
    padding: 0;
}

.skills-list li {
    display: inline;
}

.skills-list li:not(:last-child)::after {
    content: " · ";
    color: #999;
}

.edu-entry {
    margin-bottom: 6px;
}

.cert-entry {
    margin-bottom: 4px;
}
"""


def generate_resume_html(resume_data: dict) -> str:
    """Convert structured resume data to ATS-friendly HTML."""
    info = resume_data.get("personal_info", {})
    summary = resume_data.get("professional_summary", "")
    experience = resume_data.get("experience", [])
    education = resume_data.get("education", [])
    skills = resume_data.get("skills", {})
    certifications = resume_data.get("certifications", [])

    # Build contact line
    contact_parts = []
    if info.get("email"):
        contact_parts.append(f'<span>{info["email"]}</span>')
    if info.get("phone"):
        contact_parts.append(f'<span>{info["phone"]}</span>')
    if info.get("location"):
        contact_parts.append(f'<span>{info["location"]}</span>')
    if info.get("linkedin"):
        contact_parts.append(f'<span>{info["linkedin"]}</span>')
    if info.get("portfolio"):
        contact_parts.append(f'<span>{info["portfolio"]}</span>')

    contact_html = " | ".join([p.replace("<span>", "").replace("</span>", "") for p in contact_parts])

    # Build experience section
    exp_html = ""
    for job in experience:
        bullets = "".join(f"<li>{b}</li>" for b in job.get("bullets", []))
        exp_html += f"""
        <div class="experience-entry">
            <div class="role-header">
                <h3>{job.get('title', '')}</h3>
                <span class="dates">{job.get('start_date', '')} – {job.get('end_date', '')}</span>
            </div>
            <div class="company">{job.get('company', '')}{', ' + job.get('location', '') if job.get('location') else ''}</div>
            <ul>{bullets}</ul>
        </div>"""

    # Build education section
    edu_html = ""
    for edu in education:
        gpa_str = f" | GPA: {edu['gpa']}" if edu.get("gpa") else ""
        edu_html += f"""
        <div class="edu-entry">
            <div class="role-header">
                <h3>{edu.get('degree', '')} in {edu.get('field', '')}</h3>
                <span class="dates">{edu.get('graduation_date', '')}</span>
            </div>
            <div class="company">{edu.get('institution', '')}{gpa_str}</div>
        </div>"""

    # Build skills section
    skills_html = ""
    for category, skill_list in skills.items():
        if skill_list:
            label = category.replace("_", " ").title()
            items = " · ".join(skill_list)
            skills_html += f"<p><strong>{label}:</strong> {items}</p>"

    # Build certifications section
    cert_html = ""
    for cert in certifications:
        cert_html += f"""
        <div class="cert-entry">
            <strong>{cert.get('name', '')}</strong> — {cert.get('issuer', '')} ({cert.get('date', '')})
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{info.get('name', 'Resume')}</title>
    <style>{ATS_RESUME_CSS}</style>
</head>
<body>
    <h1>{info.get('name', '')}</h1>
    <div class="contact-info">{contact_html}</div>

    {"<h2>Professional Summary</h2><p>" + summary + "</p>" if summary else ""}

    {"<h2>Work Experience</h2>" + exp_html if experience else ""}

    {"<h2>Education</h2>" + edu_html if education else ""}

    {"<h2>Skills</h2>" + skills_html if skills else ""}

    {"<h2>Certifications</h2>" + cert_html if certifications else ""}
</body>
</html>"""

    return html


def generate_pdf_bytes(html_content: str) -> bytes:
    """Convert HTML to PDF bytes using WeasyPrint."""
    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except ImportError:
        # Fallback: return HTML as bytes if WeasyPrint is not available
        return html_content.encode("utf-8")
    except Exception as e:
        print(f"PDF generation error: {e}")
        return html_content.encode("utf-8")
