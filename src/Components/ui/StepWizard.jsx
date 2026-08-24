import React from 'react';

const StepWizard = ({ steps, currentStep, onStepClick, className = '' }) => {
  return (
    <div className={`flex items-center justify-between w-full relative ${className}`}>
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0" />
      
      {/* Active/Completed Line */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-300 z-0"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isCompleted = index + 1 < currentStep;
        const isActive = index + 1 === currentStep;
        
        let circleClass = 'bg-slate-100 text-slate-400';
        if (isCompleted) circleClass = 'bg-success text-white';
        else if (isActive) circleClass = 'bg-primary text-white';

        return (
          <div key={index} className="relative z-10 flex flex-col items-center">
            <button
              onClick={() => onStepClick && onStepClick(index + 1)}
              disabled={!onStepClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${circleClass} ${onStepClick ? 'cursor-pointer hover:ring-2 ring-offset-2 ring-primary/50' : 'cursor-default'}`}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number || index + 1
              )}
            </button>
            <span className={`absolute top-10 text-xs font-medium whitespace-nowrap ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepWizard;
