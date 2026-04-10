export default function StepWizard({ currentStep }) {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Analyze' },
    { num: 3, label: 'Optimize' },
  ];

  const getState = (stepNum) => {
    if (currentStep > stepNum) return 'completed';
    if (currentStep === stepNum) return 'active';
    return 'upcoming';
  };

  return (
    <div className="step-wizard-bar">
      <div className="step-wizard">
        {steps.map((step, i) => (
          <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="step-item">
              <div className={`step-circle ${getState(step.num)}`}>
                {currentStep > step.num ? '✓' : step.num}
              </div>
              <span className={`step-label ${getState(step.num)}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`step-connector ${
                  currentStep > step.num ? 'completed' : 'incomplete'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
