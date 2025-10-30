import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const TripWizard = ({ steps, currentStep, onStepChange, children }) => {
  const handlePrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => stepNumber <= currentStep && onStepChange(stepNumber)}
                disabled={stepNumber > currentStep}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-aurora-teal text-frost-white shadow-aurora scale-110'
                    : isCompleted
                    ? 'bg-success-green text-frost-white'
                    : 'bg-frost-white/10 text-stone-grey'
                } ${stepNumber <= currentStep ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
              >
                {isCompleted ? (
                  <Check size={20} />
                ) : (
                  <Icon size={20} />
                )}

                {/* Pulse animation for active step */}
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-aurora-teal animate-ping opacity-30" />
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-semibold ${
                  isActive || isCompleted ? 'text-frost-white' : 'text-stone-grey'
                }`}>
                  {step.name}
                </p>
                {step.description && (
                  <p className="text-xs text-stone-grey mt-0.5">{step.description}</p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`h-0.5 transition-all duration-500 ${
                    isCompleted ? 'bg-success-green' : 'bg-frost-white/20'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-deep-ocean rounded-card p-6">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-button transition-all ${
            currentStep === 1
              ? 'bg-frost-white/5 text-stone-grey cursor-not-allowed'
              : 'bg-frost-white/10 text-frost-white hover:bg-frost-white/20'
          }`}
        >
          <ChevronLeft size={20} />
          <span>Previous</span>
        </button>

        <div className="text-center">
          <span className="text-stone-grey text-sm">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className={`flex items-center space-x-2 px-4 py-2 rounded-button transition-all ${
            currentStep === steps.length
              ? 'bg-frost-white/5 text-stone-grey cursor-not-allowed'
              : 'bg-aurora-teal text-frost-white hover:bg-aurora-teal/80'
          }`}
        >
          <span>Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TripWizard;