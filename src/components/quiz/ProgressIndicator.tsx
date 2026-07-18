import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps }: ProgressIndicatorProps) => {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep}
      aria-label={`Question ${currentStep} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            index + 1 === currentStep
              ? "w-8 bg-primary"
              : index + 1 < currentStep
              ? "w-2 bg-primary/60"
              : "w-2 bg-border"
          )}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
