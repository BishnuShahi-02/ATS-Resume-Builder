# ResumeAI — ATS Score Checker & Resume Optimizer

AI-powered ATS (Applicant Tracking System) score checker and resume builder. Optimize your resume for maximum ATS compatibility and land more interviews.

## Features

- **📊 ATS Score Checker** — Upload your resume (PDF/DOCX/text) and paste a job description to get a detailed ATS compatibility score (0-100) with keyword analysis, formatting quality checks, and actionable suggestions.
- **📝 Resume Builder** — Build an ATS-friendly resume from scratch with a structured form, live preview, and 3 clean templates (Classic, Modern, Technical).
- **✨ AI Optimizer** — Paste your resume and target JD, and AI will rewrite your resume for maximum ATS score with a diff view showing every change and its rationale.

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | Vite + React 18, Vanilla CSS (dark glassmorphism) |
| Backend | FastAPI (Python 3.11+) |
| AI Engine | Google Gemini API (gemini-2.0-flash) |
| PDF Parsing | PyMuPDF + python-docx |
| PDF Generation | WeasyPrint |

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Project Structure

```
RESUME/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Environment config
│   ├── requirements.txt        # Python dependencies
│   ├── routers/
│   │   ├── analyze.py          # POST /api/v1/analyze
│   │   └── optimize.py         # POST /api/v1/optimize, /suggestions, /generate-pdf
│   ├── services/
│   │   ├── parser.py           # PDF/DOCX/text parsing + section detection
│   │   ├── analyzer.py         # ATS scoring engine (rule-based + Gemini AI)
│   │   ├── optimizer.py        # AI resume rewriting + suggestions
│   │   └── generator.py        # ATS-friendly HTML/PDF generation
│   └── prompts/
│       ├── analyze_prompt.py   # ATS analysis prompt template
│       ├── optimize_prompt.py  # Resume optimization prompt
│       └── suggestions_prompt.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app with tab routing
│   │   ├── index.css           # Dark glassmorphism design system
│   │   ├── context/AppContext.jsx
│   │   ├── services/api.js     # Backend API client
│   │   └── components/
│   │       ├── common/         # Header, TabNav, AnimatedGauge, LoadingShimmer
│   │       ├── ScoreChecker/   # ResumeUpload, JDInput, ScoreDisplay, AnalysisLoader
│   │       ├── Builder/        # ResumeForm, ResumePreview, TemplateSelector
│   │       └── Optimizer/      # OptimizerPanel, SuggestionCards
│   └── index.html
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| GET | `/health` | Health check |
| POST | `/api/v1/analyze` | Analyze resume vs JD for ATS score |
| POST | `/api/v1/optimize` | AI-optimize resume for target JD |
| POST | `/api/v1/suggestions` | Get improvement suggestions |
| POST | `/api/v1/generate-pdf` | Generate ATS-friendly PDF |
| POST | `/api/v1/generate-html` | Generate ATS-friendly HTML preview |

## License

MIT
