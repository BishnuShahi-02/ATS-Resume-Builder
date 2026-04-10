ANALYZE_SYSTEM_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst with 20 years of experience in HR technology and recruitment. You deeply understand how modern ATS systems like Workday, Greenhouse, Lever, and iCIMS parse and score resumes."""

ANALYZE_USER_PROMPT = """Analyze the following resume against the provided job description. Perform a thorough ATS compatibility analysis.

## RESUME:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

## INSTRUCTIONS:
Provide your analysis as a JSON object with this EXACT structure:

{{
  "overall_score": <integer 0-100>,
  "category_scores": {{
    "keyword_match": {{
      "score": <integer 0-100>,
      "details": "<brief explanation>"
    }},
    "section_structure": {{
      "score": <integer 0-100>,
      "details": "<brief explanation>"
    }},
    "formatting_quality": {{
      "score": <integer 0-100>,
      "details": "<brief explanation>"
    }},
    "achievement_density": {{
      "score": <integer 0-100>,
      "details": "<brief explanation>"
    }}
  }},
  "matched_keywords": ["<list of keywords found in both resume and JD>"],
  "missing_keywords": ["<list of important JD keywords NOT in resume>"],
  "suggestions": [
    {{
      "priority": "<critical|high|medium|low>",
      "category": "<keyword|structure|formatting|content>",
      "title": "<short title>",
      "description": "<actionable suggestion>",
      "section": "<which resume section this applies to>"
    }}
  ],
  "summary": "<2-3 sentence executive summary of ATS compatibility>"
}}

## SCORING CRITERIA:
- **keyword_match**: Exact and semantic overlap of skills, tools, technologies, and domain terms between resume and JD. Weight required skills 2x vs nice-to-have. If the resume contains a keyword even once, count it as matched.
- **section_structure**: Presence of standard ATS-parseable sections (Professional Summary, Work Experience, Education, Skills, Certifications). Uses standard headers. Accept common variations (e.g., "Work Experience" = "Professional Experience" = "Experience").
- **formatting_quality**: Single-column layout, no tables/images/graphics, standard fonts, clean hierarchy. Penalize complex formatting. Plain text resumes with standard headers should score 90+.
- **achievement_density**: Percentage of bullet points containing quantifiable metrics (numbers, percentages, dollar amounts). STAR method usage.

## CONSISTENCY RULES:
- Be deterministic: the same resume+JD pair should produce the same score every time.
- A resume that contains MORE matched keywords MUST score higher on keyword_match than one with fewer.
- Score based on CONTENT, not on how the text was inputted (file upload vs pasted text produce identical scoring).

Return ONLY valid JSON. No markdown formatting, no code fences."""
