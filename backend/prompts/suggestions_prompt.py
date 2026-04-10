SUGGESTIONS_SYSTEM_PROMPT = """You are a career coach and ATS expert. You provide specific, actionable resume improvement suggestions categorized by priority and impact."""

SUGGESTIONS_USER_PROMPT = """Based on the ATS analysis results, provide detailed improvement suggestions for this resume.

## RESUME:
{resume_text}

## JOB DESCRIPTION:
{jd_text}

## CURRENT ATS SCORE:
{current_score}

## INSTRUCTIONS:
Return a JSON array of suggestions, each with this structure:

{{
  "suggestions": [
    {{
      "priority": "<critical|high|medium|low>",
      "category": "<keyword|structure|formatting|content|skills>",
      "title": "<concise action title>",
      "description": "<detailed description of what to change and why>",
      "example_before": "<example of current text>",
      "example_after": "<example of improved text>",
      "estimated_impact": "<how many score points this could add>"
    }}
  ]
}}

Provide 5-10 suggestions ordered by priority (critical first).
Return ONLY valid JSON. No markdown formatting, no code fences."""
