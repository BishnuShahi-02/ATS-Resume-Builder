import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-3.1-flash-lite-preview"

# CORS — allow local dev + production frontend URL from env
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add production frontend URL if set (e.g., https://resume-ai.vercel.app)
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url:
    ALLOWED_ORIGINS.append(_frontend_url)

# File upload limits
MAX_FILE_SIZE_MB = 10
SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}
