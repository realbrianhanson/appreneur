import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface QuizOption {
  label: string;
  value: string;
}

interface QuizStepProps {
  question: string;
  options: QuizOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  stepNumber: number;
  totalSteps: number;
  onBack?: () => void;
}

const QuizStep = forwardRef<HTMLHeadingElement, QuizStepProps>(function QuizStep(
  { question, options, selectedValue, onSelect, stepNumber, totalSteps, onBack },
  headingRef
) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow font-mono text-xs tracking-[0.2em]">
          <span className="text-primary">
            QUESTION {String(stepNumber).padStart(2, "0")}
          </span>
          <span className="text-muted-foreground">
            {" "}/ {String(totalSteps).padStart(2, "0")}
          </span>
        </span>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono tracking-wider"
          >
            ← BACK
          </button>
        )}
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight tracking-tight outline-none"
      >
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "group w-full p-5 text-left rounded-xl border transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
                isSelected
                  ? "border-primary bg-gradient-to-r from-primary/15 to-accent/10 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)]"
                  : "border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.04]"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={cn(
                    "font-medium transition-colors",
                    isSelected ? "text-foreground" : "text-foreground/90"
                  )}
                >
                  {option.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-white/20 group-hover:border-primary/50"
                  )}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-background" />
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default QuizStep;
