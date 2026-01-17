import { StepConfig } from '@/lib/types';

interface StepperIndicatorProps {
  currentStep: number;
}

const steps: StepConfig[] = [
  { number: 1, label: 'Customer Information' },
  { number: 2, label: 'Trade Details' },
  { number: 3, label: 'Payment Information' },
  { number: 4, label: 'Payout Details' },
];

export function StepperIndicator({ currentStep }: StepperIndicatorProps) {
  return (
    <div className="bg-bg-muted border border-border-custom  p-4 md:p-6 lg:p-8">
      {/* Desktop/Tablet Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const showLine = index < steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle and Label */}
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-colors shrink-0"
                  style={{
                    backgroundColor: isActive ? 'var(--status-info)' : isCompleted ? 'var(--brand-primary)' : '#e6e7ea',
                    color: isActive || isCompleted ? '#ffffff' : '#e6e7ea',
                  }}
                >
                  {step.number}
                </div>
                <span
                  className="text-sm lg:text-base font-bold whitespace-nowrap hidden lg:inline"
                  style={{
                    color: isActive ? 'var(--status-info)' : '#9aa0a6',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {showLine && (
                <div className="flex-1 mx-2 lg:mx-4">
                  <div className="h-0.5 bg-border-custom" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Compact Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2 mb-4">
          {steps.map((step) => {
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div
                key={step.number}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                style={{
                  backgroundColor: isActive ? 'var(--status-info)' : isCompleted ? 'var(--brand-primary)' : '#e6e7ea',
                  color: isActive || isCompleted ? '#ffffff' : '#e6e7ea',
                }}
              >
                {step.number}
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <span className="text-sm font-bold" style={{ color: 'var(--status-info)' }}>
            {steps[currentStep - 1].label}
          </span>
        </div>
      </div>
    </div>
  );
}