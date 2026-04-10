from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from services.parser import parse_pdf, parse_docx, parse_text
from services.analyzer import analyze_resume

router = APIRouter()


@router.post("/analyze")
async def analyze(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: str = Form(...),
):
    """
    Analyze a resume against a job description for ATS compatibility.
    Accepts either a file upload (PDF/DOCX) or pasted text.
    """
    # Parse resume input
    parsed_resume = None

    if resume_file:
        file_bytes = await resume_file.read()
        filename = resume_file.filename.lower()

        if filename.endswith(".pdf"):
            parsed_resume = parse_pdf(file_bytes)
        elif filename.endswith(".docx"):
            parsed_resume = parse_docx(file_bytes)
        elif filename.endswith(".txt"):
            parsed_resume = parse_text(file_bytes.decode("utf-8"))
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Please upload PDF, DOCX, or TXT.",
            )
    elif resume_text:
        parsed_resume = parse_text(resume_text)
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide either a resume file or resume text.",
        )

    if not parsed_resume or len(parsed_resume.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume content is too short or could not be parsed.",
        )

    if not jd_text or len(jd_text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide a complete JD.",
        )

    # Run analysis
    result = await analyze_resume(parsed_resume, jd_text.strip())
    result["parsed_resume"] = parsed_resume

    return result
