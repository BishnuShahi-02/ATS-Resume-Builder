import json
import traceback
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL
from prompts.analyze_prompt import ANALYZE_SYSTEM_PROMPT, ANALYZE_USER_PROMPT
from services.parser import extract_sections, detect_formatting_issues, count_metrics


def _get_client():
    """Initialize and return the Gemini client."""
    return genai.Client(api_key=GEMINI_API_KEY)


async def analyze_resume(resume_text: str, jd_text: str) -> dict:
    """
    Perform comprehensive ATS analysis of a resume against a job description.
    Combines rule-based analysis with Gemini AI semantic analysis.
    """
    # Step 1: Rule-based pre-analysis
    sections = extract_sections(resume_text)
    formatting_issues = detect_formatting_issues(resume_text)
    metrics = count_metrics(resume_text)

    # Step 2: AI-powered semantic analysis via Gemini
    ai_analysis = await _get_ai_analysis(resume_text, jd_text)

    # Step 3: Merge rule-based and AI results
    result = _merge_analysis(ai_analysis, sections, formatting_issues, metrics)

    return result


async def _get_ai_analysis(resume_text: str, jd_text: str) -> dict:
    """Get AI-powered analysis from Gemini."""
    client = _get_client()

    prompt = ANALYZE_USER_PROMPT.format(
        resume_text=resume_text,
        jd_text=jd_text,
    )

    # Retry logic for rate limiting
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=ANALYZE_SYSTEM_PROMPT,
                    temperature=0.1,
                ),
            )
            response_text = response.text.strip()

            # Clean potential markdown code fences
            if response_text.startswith("```"):
                # Remove first line (```json or ```)
                response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text.rsplit("```", 1)[0]
            response_text = response_text.strip()

            return json.loads(response_text)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Raw response: {response_text[:500]}")
            # Fallback: try to extract JSON from response
            try:
                import re
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    return json.loads(json_match.group())
            except Exception:
                pass
            return _fallback_analysis(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            error_str = str(e)
            print(f"Gemini API error (attempt {attempt + 1}/{max_retries}): {e}")
            # Retry on rate limit (429) errors
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if attempt < max_retries - 1:
                    import asyncio
                    wait_time = (attempt + 1) * 10  # 10s, 20s, 30s
                    print(f"Rate limited. Waiting {wait_time}s before retry...")
                    await asyncio.sleep(wait_time)
                    continue
                return _fallback_analysis(
                    "Gemini API rate limit exceeded. Please wait a minute and try again. "
                    "The free tier allows 15 requests/minute."
                )
            print(f"Full traceback:\n{traceback.format_exc()}")
            return _fallback_analysis(error_str)

    return _fallback_analysis("Max retries exceeded")


def _merge_analysis(ai_analysis: dict, sections: dict, formatting_issues: list, metrics: dict) -> dict:
    """Merge AI analysis with rule-based checks for comprehensive results."""
    result = ai_analysis.copy()

    # Enhance formatting score with rule-based issues
    if formatting_issues:
        result.setdefault("formatting_issues", [])
        result["formatting_issues"].extend(formatting_issues)

        # Adjust formatting score based on detected issues (mild penalty)
        if "category_scores" in result and "formatting_quality" in result["category_scores"]:
            penalty = min(len(formatting_issues) * 5, 15)
            current = result["category_scores"]["formatting_quality"]["score"]
            result["category_scores"]["formatting_quality"]["score"] = max(0, current - penalty)

    # Add metrics data
    result["metrics"] = metrics

    # Add detected sections info
    result["detected_sections"] = list(sections.keys())

    # Recalculate overall score as weighted average
    if "category_scores" in result:
        scores = result["category_scores"]
        weights = {
            "keyword_match": 0.40,
            "section_structure": 0.15,
            "formatting_quality": 0.15,
            "achievement_density": 0.30,
        }
        weighted_sum = sum(
            scores.get(cat, {}).get("score", 50) * weight
            for cat, weight in weights.items()
        )
        result["overall_score"] = round(weighted_sum)

    return result


def _fallback_analysis(error_msg: str = "") -> dict:
    """Return a fallback analysis when AI is unavailable."""
    description = f"Gemini API error: {error_msg}" if error_msg else "Gemini API key is missing or invalid. Please set GEMINI_API_KEY in your .env file."
    return {
        "overall_score": 0,
        "category_scores": {
            "keyword_match": {"score": 0, "details": "AI analysis unavailable — check API key"},
            "section_structure": {"score": 0, "details": "AI analysis unavailable"},
            "formatting_quality": {"score": 0, "details": "AI analysis unavailable"},
            "achievement_density": {"score": 0, "details": "AI analysis unavailable"},
        },
        "matched_keywords": [],
        "missing_keywords": [],
        "suggestions": [
            {
                "priority": "critical",
                "category": "system",
                "title": "API Configuration Required",
                "description": description,
                "section": "system",
            }
        ],
        "summary": f"Unable to perform AI analysis. {description}",
    }
