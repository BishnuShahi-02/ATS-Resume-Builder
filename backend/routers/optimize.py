from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from typing import Optional
from services.parser import parse_pdf, parse_docx, parse_text
from services.optimizer import optimize_resume, get_suggestions
from services.generator import generate_resume_html, generate_pdf_bytes

router = APIRouter()


@router.post("/optimize")
async def optimize(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: str = Form(...),
    custom_prompt: Optional[str] = Form(None),
):
    """Optimize a resume for a specific job description using AI."""
    parsed_resume = await _parse_resume_input(resume_file, resume_text)

    if not jd_text or len(jd_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Job description is too short.")

    result = await optimize_resume(
        parsed_resume,
        jd_text.strip(),
        custom_prompt=custom_prompt.strip() if custom_prompt else None,
    )
    return result


@router.post("/suggestions")
async def suggestions(
    resume_text: str = Form(...),
    jd_text: str = Form(...),
    current_score: int = Form(0),
):
    """Get detailed improvement suggestions for a resume."""
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short.")

    result = await get_suggestions(resume_text.strip(), jd_text.strip(), current_score)
    return result


@router.post("/generate-pdf")
async def generate_pdf(
    resume_data: dict = None,
):
    """Generate an ATS-friendly PDF from structured resume data."""
    if not resume_data:
        raise HTTPException(status_code=400, detail="Resume data is required.")

    html = generate_resume_html(resume_data)
    pdf_bytes = generate_pdf_bytes(html)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=optimized_resume.pdf"},
    )


@router.post("/generate-html")
async def generate_html(resume_data: dict):
    """Generate ATS-friendly HTML preview from structured resume data."""
    if not resume_data:
        raise HTTPException(status_code=400, detail="Resume data is required.")

    html = generate_resume_html(resume_data)
    return {"html": html}


async def _parse_resume_input(
    resume_file: Optional[UploadFile], resume_text: Optional[str]
) -> str:
    """Parse resume from file or text input."""
    if resume_file:
        file_bytes = await resume_file.read()
        filename = resume_file.filename.lower()

        if filename.endswith(".pdf"):
            return parse_pdf(file_bytes)
        elif filename.endswith(".docx"):
            return parse_docx(file_bytes)
        elif filename.endswith(".txt"):
            return parse_text(file_bytes.decode("utf-8"))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
    elif resume_text:
        return parse_text(resume_text)
    else:
        raise HTTPException(status_code=400, detail="Provide a resume file or text.")
