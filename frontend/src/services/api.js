const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function analyzeResume(resumeFile, resumeText, jdText) {
  const formData = new FormData();
  if (resumeFile) {
    formData.append('resume_file', resumeFile);
  }
  if (resumeText) {
    formData.append('resume_text', resumeText);
  }
  formData.append('jd_text', jdText);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Analysis failed');
  }

  return res.json();
}

export async function optimizeResume(resumeFile, resumeText, jdText, customPrompt) {
  const formData = new FormData();
  if (resumeFile) {
    formData.append('resume_file', resumeFile);
  }
  if (resumeText) {
    formData.append('resume_text', resumeText);
  }
  formData.append('jd_text', jdText);
  if (customPrompt) {
    formData.append('custom_prompt', customPrompt);
  }

  const res = await fetch(`${API_BASE}/optimize`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Optimization failed');
  }

  return res.json();
}

export async function getSuggestions(resumeText, jdText, currentScore) {
  const formData = new FormData();
  formData.append('resume_text', resumeText);
  formData.append('jd_text', jdText);
  formData.append('current_score', currentScore);

  const res = await fetch(`${API_BASE}/suggestions`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to get suggestions');
  }

  return res.json();
}

export async function generateHtml(resumeData) {
  const res = await fetch(`${API_BASE}/generate-html`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'HTML generation failed');
  }

  return res.json();
}

export async function generatePdf(resumeData) {
  const res = await fetch(`${API_BASE}/generate-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resumeData),
  });

  if (!res.ok) {
    throw new Error('PDF generation failed');
  }

  return res.blob();
}
