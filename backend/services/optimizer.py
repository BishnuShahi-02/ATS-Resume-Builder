import json
import traceback
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL
from prompts.optimize_prompt import OPTIMIZE_SYSTEM_PROMPT, OPTIMIZE_USER_PROMPT
from prompts.suggestions_prompt import SUGGESTIONS_SYSTEM_PROMPT, SUGGESTIONS_USER_PROMPT


def _get_client():
    """Initialize and return the Gemini client."""
    return genai.Client(api_key=GEMINI_API_KEY)


def _parse_json_response(response_text: str) -> dict:
    """Parse JSON from Gemini response, handling code fences."""
    text = response_text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group())
        raise


async def optimize_resume(resume_text: str, jd_text: str, custom_prompt: str = None) -> dict:
    """Generate an AI-optimized version of the resume tailored to the JD."""
    client = _get_client()

    prompt = OPTIMIZE_USER_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text,
    )

    # Append custom user instructions if provided
    if custom_prompt:
        prompt += f"\n\n## ADDITIONAL USER INSTRUCTIONS:\nThe user has provided these specific instructions. Follow them carefully while still applying all optimization rules above:\n{custom_prompt}"

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=OPTIMIZE_SYSTEM_PROMPT,
                temperature=0.4,
            ),
        )
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Optimization error: {e}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        return {
            "error": "Failed to optimize resume. Please check your API key and try again.",
            "details": str(e),
        }


async def get_suggestions(resume_text: str, jd_text: str, current_score: int) -> dict:
    """Generate detailed improvement suggestions."""
    client = _get_client()

    prompt = SUGGESTIONS_USER_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text,
        current_score=current_score,
    )

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SUGGESTIONS_SYSTEM_PROMPT,
                temperature=0.4,
            ),
        )
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Suggestions error: {e}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        return {
            "suggestions": [
                {
                    "priority": "critical",
                    "category": "system",
                    "title": "API Error",
                    "description": f"Failed to generate suggestions: {str(e)}",
                    "example_before": "",
                    "example_after": "",
                    "estimated_impact": "0",
                }
            ]
        }
