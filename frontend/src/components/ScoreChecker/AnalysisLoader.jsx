export default function AnalysisLoader() {
  const steps = [
    { text: 'Parsing resume content...', delay: 0 },
    { text: 'Extracting keywords & skills...', delay: 1 },
    { text: 'Analyzing job description match...', delay: 2 },
    { text: 'Calculating ATS compatibility score...', delay: 3 },
    { text: 'Generating improvement suggestions...', delay: 4 },
  ];

  return (
    <div className="glass-card-static animate-fade-in" style={{ textAlign: 'center' }}>
      <div style={{ margin: 'var(--space-xl) 0' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto var(--space-lg)' }} />
        <h3 style={{ fontSize: 'var(--font-lg)', marginBottom: 'var(--space-sm)' }}>
          Analyzing Your Resume
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          AI is comparing your resume against the job description
        </p>
      </div>

      <div className="loading-steps">
        {steps.map((step, i) => (
          <div
            key={i}
            className="loading-step active"
            style={{ animationDelay: `${step.delay * 300}ms` }}
          >
            <div className="loading-step-dot" />
            <span className="loading-step-text">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
