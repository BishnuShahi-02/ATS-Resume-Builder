export default function StepWizard({ currentStep }) {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Analyze' },
    { num: 3, label: 'Optimize' },
  ];

  return (
    <div className="step-wizard">
      {steps.map((step, i) => (
        <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
          <div className="step-item">
            <div
              className={`step-circle ${
                currentStep > step.num ? 'completed' :
                currentStep === step.num ? 'active' : ''
              }`}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={`step-label ${
                currentStep > step.num ? 'completed' :
                currentStep === step.num ? 'active' : ''
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`step-connector ${currentStep > step.num ? 'completed' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}
