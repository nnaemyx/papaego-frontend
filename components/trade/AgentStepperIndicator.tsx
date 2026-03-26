interface AgentStepperIndicatorProps {
    currentStep: number;
}

const AGENT_STEPS = [
    { number: 1, label: "Customer Information" },
    { number: 2, label: "Rate Details" },
];

export function AgentStepperIndicator({ currentStep }: AgentStepperIndicatorProps) {
    return (
        <div className="bg-bg-muted border border-border-custom p-4 md:p-6 lg:p-8">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-center gap-8 max-w-xl mx-auto">
                {AGENT_STEPS.map((step, index) => {
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;
                    const showLine = index < AGENT_STEPS.length - 1;

                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-colors shrink-0"
                                    style={{
                                        backgroundColor: isActive
                                            ? "var(--status-info)"
                                            : isCompleted
                                            ? "var(--brand-primary)"
                                            : "#e6e7ea",
                                        color:
                                            isActive || isCompleted ? "#ffffff" : "#9aa0a6",
                                    }}
                                >
                                    {step.number}
                                </div>
                                <span
                                    className="text-sm lg:text-base font-bold whitespace-nowrap hidden lg:inline"
                                    style={{
                                        color: isActive ? "var(--status-info)" : "#9aa0a6",
                                    }}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {showLine && (
                                <div className="flex-1 mx-2 lg:mx-4">
                                    <div className="h-0.5 bg-border-custom" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile */}
            <div className="md:hidden">
                <div className="flex items-center justify-center gap-4 mb-3">
                    {AGENT_STEPS.map((step) => {
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;
                        return (
                            <div
                                key={step.number}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                                style={{
                                    backgroundColor: isActive
                                        ? "var(--status-info)"
                                        : isCompleted
                                        ? "var(--brand-primary)"
                                        : "#e6e7ea",
                                    color:
                                        isActive || isCompleted ? "#ffffff" : "#9aa0a6",
                                }}
                            >
                                {step.number}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center">
                    <span
                        className="text-sm font-bold"
                        style={{ color: "var(--status-info)" }}
                    >
                        {AGENT_STEPS[currentStep - 1]?.label}
                    </span>
                </div>
            </div>
        </div>
    );
}
