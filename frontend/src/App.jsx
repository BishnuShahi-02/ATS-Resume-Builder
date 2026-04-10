import { useRef, useEffect } from 'react';
import { AppProvider, useAppState } from './context/AppContext';
import Header from './components/common/Header';
import TabNav from './components/common/TabNav';
import ResumeUpload from './components/ScoreChecker/ResumeUpload';
import JDInput from './components/ScoreChecker/JDInput';
import ScoreDisplay from './components/ScoreChecker/ScoreDisplay';
import AnalysisLoader from './components/ScoreChecker/AnalysisLoader';
import ResumeForm from './components/Builder/ResumeForm';
import ResumePreview from './components/Builder/ResumePreview';
import TemplateSelector from './components/Builder/TemplateSelector';
import { analyzeResume } from './services/api';

function HeroSection() {
  return (
    <section className="hero-section animate-fade-in">
      <h1 className="hero-title">
        Land More Interviews with <span className="hero-gradient">AI-Powered</span> Resumes
      </h1>
      <p className="hero-subtitle">
        Check your ATS score, get AI optimization, and build pixel-perfect resumes — all in one place.
      </p>
      <div className="hero-steps">
        <div className="hero-step">
          <span className="hero-step-icon">📄</span> Upload Resume
        </div>
        <span className="hero-step-arrow">→</span>
        <div className="hero-step">
          <span className="hero-step-icon">🤖</span> AI Analysis
        </div>
        <span className="hero-step-arrow">→</span>
        <div className="hero-step">
          <span className="hero-step-icon">✨</span> Optimized Resume
        </div>
      </div>
    </section>
  );
}

function AppContent() {
  const { state, dispatch } = useAppState();
  const resultsRef = useRef(null);

  const canAnalyze = (
    (state.inputMode === 'file' && state.resumeFile) ||
    (state.inputMode === 'text' && state.resumeText.trim().length >= 50)
  ) && state.jdText.trim().length >= 20;

  // Auto-scroll to results when analysis starts or completes
  useEffect(() => {
    if ((state.isAnalyzing || state.analysisResult) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [state.isAnalyzing, state.analysisResult]);

  const handleAnalyze = async () => {
    dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
    dispatch({ type: 'SET_OPTIMIZE_ERROR', payload: null });
    dispatch({ type: 'SET_ANALYZING', payload: true });
    try {
      const result = await analyzeResume(
        state.inputMode === 'file' ? state.resumeFile : null,
        state.inputMode === 'text' ? state.resumeText : null,
        state.jdText,
      );
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
    } catch (err) {
      dispatch({ type: 'SET_ANALYSIS_ERROR', payload: err.message });
    }
  };

  return (
    <>
      <Header />
      <main className="app-container">
        <HeroSection />
        <TabNav />

        {/* ====================== SCORE CHECKER & OPTIMIZER ====================== */}
        {state.activeTab === 'checker' && (
          <div className="page-section animate-fade-in">
            {/* Inputs — Side by Side */}
            <div className="checker-inputs">
              <ResumeUpload />
              <JDInput />
            </div>

            {/* Analyze Button */}
            <div className="checker-actions">
              <button
                id="analyze-btn"
                className="btn btn-primary btn-lg"
                style={{ minWidth: 280 }}
                disabled={!canAnalyze || state.isAnalyzing}
                onClick={handleAnalyze}
              >
                {state.isAnalyzing ? (
                  <>
                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    Analyzing...
                  </>
                ) : (
                  <>📊 Analyze ATS Score</>
                )}
              </button>

              {state.analysisError && (
                <div className="glass-card-static animate-fade-in" style={{
                  borderColor: 'var(--accent-red)',
                  background: 'var(--accent-red-dim)',
                  maxWidth: 500,
                }}>
                  <p style={{ color: 'var(--accent-red)', fontWeight: 600, textAlign: 'center' }}>
                    ❌ {state.analysisError}
                  </p>
                </div>
              )}
            </div>

            {/* Results — Full Width */}
            {state.isAnalyzing ? (
              <div className="checker-results-full" ref={resultsRef}>
                <AnalysisLoader />
              </div>
            ) : state.analysisResult ? (
              <div className="checker-results-full" ref={resultsRef}>
                <ScoreDisplay result={state.analysisResult} />
              </div>
            ) : null}
          </div>
        )}

        {/* ====================== RESUME BUILDER ====================== */}
        {state.activeTab === 'builder' && (
          <div className="page-section animate-fade-in">
            <TemplateSelector />

            <div className="builder-layout">
              <ResumeForm />
              <ResumePreview />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
