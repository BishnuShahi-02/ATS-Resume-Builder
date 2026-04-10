import { useRef, useEffect } from 'react';
import { useAppState } from './context/AppContext';
import { analyzeResume } from './services/api';
import Header from './components/common/Header';
import StepWizard from './components/common/StepWizard';
import ResumeUpload from './components/ScoreChecker/ResumeUpload';
import JDInput from './components/ScoreChecker/JDInput';
import AnalysisLoader from './components/ScoreChecker/AnalysisLoader';
import ScoreDisplay from './components/ScoreChecker/ScoreDisplay';

export default function App() {
  const { state, dispatch } = useAppState();
  const resultsRef = useRef(null);

  const {
    resumeFile,
    resumeText,
    jdText,
    inputMode,
    isAnalyzing,
    analysisResult,
    analysisError,
    optimizeResult,
  } = state;

  // Determine current step
  const getCurrentStep = () => {
    if (optimizeResult) return 3;
    if (analysisResult || isAnalyzing) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  // Can we analyze?
  const hasResume = inputMode === 'file' ? !!resumeFile : resumeText.trim().length > 0;
  const hasJD = jdText.trim().length >= 20;
  const canAnalyze = hasResume && hasJD && !isAnalyzing;

  const handleAnalyze = async () => {
    dispatch({ type: 'SET_ANALYZING', payload: true });
    dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
    try {
      const result = await analyzeResume(
        inputMode === 'file' ? resumeFile : null,
        inputMode === 'text' ? resumeText : null,
        jdText,
      );
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
    } catch (err) {
      dispatch({ type: 'SET_ANALYSIS_ERROR', payload: err.message });
    }
  };

  // Auto-scroll to results
  useEffect(() => {
    if ((analysisResult || isAnalyzing) && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [analysisResult, isAnalyzing]);

  // Reset to step 1
  const handleReset = () => {
    dispatch({ type: 'SET_ANALYSIS_RESULT', payload: null });
    dispatch({ type: 'SET_OPTIMIZE_RESULT', payload: null });
    dispatch({ type: 'SET_ANALYZING', payload: false });
  };

  return (
    <>
      <Header />
      <div className="navbar-spacer" />
      <StepWizard currentStep={currentStep} />

      <div className="main-content">
        {/* ═══ Step 1: Input ═══ */}
        {currentStep === 1 && (
          <div className="input-section animate-fade-in">
            <div className="input-grid">
              <ResumeUpload />
              <JDInput />
            </div>

            <div className="cta-container">
              <button
                className="btn btn-primary btn-analyze"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <><span className="spinner-sm" /> Analyzing...</>
                ) : (
                  <>🎯 Analyze ATS Score →</>
                )}
              </button>
            </div>

            {analysisError && (
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <p style={{ color: 'var(--red-500)', fontSize: 14 }}>
                  ❌ {analysisError}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 2: Loading / Results ═══ */}
        <div ref={resultsRef}>
          {isAnalyzing && currentStep === 2 && (
            <AnalysisLoader />
          )}

          {analysisResult && !isAnalyzing && currentStep === 2 && (
            <ScoreDisplay result={analysisResult} onReset={handleReset} />
          )}
        </div>

        {/* ═══ Step 3: Optimization Results ═══ */}
        {currentStep === 3 && analysisResult && (
          <ScoreDisplay result={analysisResult} onReset={handleReset} />
        )}
      </div>
    </>
  );
}
