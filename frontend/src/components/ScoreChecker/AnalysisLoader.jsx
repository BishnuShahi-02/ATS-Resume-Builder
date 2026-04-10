import { useState, useEffect } from 'react';

const loadingTexts = [
  'Extracting keywords...',
  'Comparing with job description...',
  'Analyzing section structure...',
  'Calculating ATS score...',
];

export default function AnalysisLoader() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-card glass-card-static animate-fade-in">
      <div className="spinner" />
      <h3 className="loading-title">Analyzing your resume...</h3>
      <p className="loading-subtitle">{loadingTexts[textIndex]}</p>
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
