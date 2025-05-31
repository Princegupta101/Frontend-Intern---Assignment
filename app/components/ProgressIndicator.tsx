import { useFormStore } from "~/store/formStore";

export default function ProgressIndicator() {
  const { fields, currentStep, setCurrentStep } = useFormStore();

  const steps = Array.from(new Set(fields.map((f) => f.step || 1))).length;

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="flex items-center justify-center mb-6" role="navigation" aria-label="Form step navigation">
      <div className="flex space-x-2">
        {Array.from({ length: steps }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          return (
            <button
              key={step}
              onClick={() => handleStepClick(step)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"}`}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step} of ${steps}`}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
}