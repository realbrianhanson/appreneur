import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuizOption {
  label: string;
  value: string;
}

interface QuizStepProps {
  question: string;
  options: QuizOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  isVisible: boolean;
}

const QuizStep = ({ question, options, selectedValue, onSelect, isVisible }: QuizStepProps) => {
  if (!isVisible) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
        {question}
      </h3>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-full p-4 text-left rounded-xl border-2 transition-all duration-300",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? "border-primary bg-primary/10 shadow-glow-primary"
                  : "border-border bg-card/50"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizStep;
