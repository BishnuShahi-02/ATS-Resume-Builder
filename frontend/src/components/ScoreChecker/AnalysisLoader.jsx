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
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-container">
      <div className="glass-card loading-card animate-fade-in">
        <div className="spinner-ring" />
        <h3 className="loading-title">Analyzing your resume...</h3>
        <div className="loading-progress-text" key={textIndex}>
          {loadingTexts[textIndex]}
        </div>
        <div className="loading-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
