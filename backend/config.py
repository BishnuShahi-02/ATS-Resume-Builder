import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

# CORS — allow local dev + production frontend URLs
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add production frontend URL(s) from env — supports comma-separated list
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url:
    for url in _frontend_url.split(","):
        url = url.strip()
        if url:
            ALLOWED_ORIGINS.append(url)

# File upload limits
MAX_FILE_SIZE_MB = 10
SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}
