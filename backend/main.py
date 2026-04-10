from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import ALLOWED_ORIGINS
from routers import analyze, optimize

app = FastAPI(
    title="ATS Resume Optimizer",
    description="AI-powered ATS score checker and resume optimizer",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(optimize.router, prefix="/api/v1", tags=["Optimization"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ATS Resume Optimizer"}
