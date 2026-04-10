import re
import io
import pdfplumber
from docx import Document


STANDARD_SECTIONS = [
    "professional summary", "summary", "objective", "profile",
    "work experience", "experience", "employment history", "professional experience",
    "education", "academic background",
    "skills", "technical skills", "core competencies",
    "certifications", "certificates", "licenses",
    "projects", "personal projects",
    "awards", "honors", "achievements",
    "publications", "volunteer", "languages",
]


def parse_pdf(file_bytes: bytes) -> str:
    """Extract clean text from a PDF file."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return _clean_text("\n".join(text_parts))


def parse_docx(file_bytes: bytes) -> str:
    """Extract clean text from a DOCX file."""
    doc = Document(io.BytesIO(file_bytes))
    text_parts = []
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text.strip())
    return _clean_text("\n".join(text_parts))


def parse_text(raw_text: str) -> str:
    """Clean and normalize raw text input."""
    return _clean_text(raw_text)


def extract_sections(text: str) -> dict:
    """Identify standard resume sections and their content."""
    lines = text.split("\n")
    sections = {}
    current_section = "header"
    current_content = []

    for line in lines:
        line_lower = line.strip().lower()
        # Check if this line is a section header
        matched_section = None
        for section in STANDARD_SECTIONS:
            if line_lower == section or line_lower.startswith(section + ":"):
                matched_section = section
                break
            # Also match with common decorators like dashes or colons stripped
            cleaned = re.sub(r'[:\-–—|]', '', line_lower).strip()
            if cleaned == section:
                matched_section = section
                break

        if matched_section:
            # Save previous section
            if current_content:
                sections[current_section] = "\n".join(current_content).strip()
            current_section = matched_section
            current_content = []
        else:
            current_content.append(line)

    # Save last section
    if current_content:
        sections[current_section] = "\n".join(current_content).strip()

    return sections


def detect_formatting_issues(text: str) -> list:
    """Detect potential ATS formatting problems."""
    issues = []

    # Check for very short content (might indicate parsing issues)
    if len(text) < 100:
        issues.append("Resume content appears too short — possible parsing error")

    # Check for potential table artifacts
    if text.count("|") > 5:
        issues.append("Detected table-like formatting (pipe characters) — ATS may not parse tables correctly")

    # Check for excessive special characters
    special_count = len(re.findall(r'[★●◆■□▪▸►▶→←↑↓♦♠♣♥]', text))
    if special_count > 3:
        issues.append("Special characters/symbols detected — use standard bullet points instead")

    # Check for missing standard sections (flexible matching with variants)
    text_lower = text.lower()
    essential_checks = [
        (["experience", "work experience", "professional experience", "employment"], "Work Experience"),
        (["education", "academic", "university", "bachelor", "master", "degree"], "Education"),
        (["skills", "technical skills", "core competencies", "technologies"], "Skills"),
    ]
    for variants, section_name in essential_checks:
        if not any(variant in text_lower for variant in variants):
            issues.append(f"Missing standard section: '{section_name}' — ATS expects this section")

    return issues


def count_metrics(text: str) -> dict:
    """Count quantifiable achievements in the resume."""
    # Find numbers, percentages, dollar amounts
    percentages = re.findall(r'\d+%', text)
    dollar_amounts = re.findall(r'\$[\d,]+(?:\.\d+)?(?:\s*(?:M|K|B|million|billion|thousand))?', text, re.IGNORECASE)
    plain_numbers = re.findall(r'\b\d{2,}\b', text)
    time_metrics = re.findall(r'\d+\+?\s*(?:years?|months?|weeks?|days?|hours?)', text, re.IGNORECASE)

    # Count bullet points (lines starting with - or • or *)
    bullets = re.findall(r'(?m)^\s*[-•*▪▸►]\s*.+', text)
    bullets_with_metrics = [b for b in bullets if re.search(r'\d', b)]

    return {
        "total_bullets": len(bullets),
        "bullets_with_metrics": len(bullets_with_metrics),
        "percentage_mentions": len(percentages),
        "dollar_mentions": len(dollar_amounts),
        "time_metrics": len(time_metrics),
        "metric_density": round(len(bullets_with_metrics) / max(len(bullets), 1) * 100, 1),
    }


def _clean_text(text: str) -> str:
    """Normalize whitespace and clean extracted text."""
    # Replace multiple spaces with single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Replace 3+ newlines with 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()
