import { useState } from "react";
import { Button } from "@/components/ui/button";
import { COMMUNITY_URL } from "@/lib/constants";
import {
  Rocket,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Download,
} from "lucide-react";

interface OnboardingWizardProps {
  firstName: string;
  cohortStartDate?: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: <Rocket className="w-10 h-10 text-primary" />,
    emoji: "🚀",
    title: "Welcome to the Challenge!",
  },
  {
    icon: <BookOpen className="w-10 h-10 text-accent" />,
    emoji: "📚",
    title: "Download Your Free PDF",
  },
  {
    icon: <Users className="w-10 h-10 text-secondary" />,
    emoji: "💬",
    title: "Join the Community",
  },
  {
    icon: <CheckCircle2 className="w-10 h-10 text-green-500" />,
    emoji: "✅",
    title: "You're All Set!",
  },
];

const OnboardingWizard = ({
  firstName,
  cohortStartDate,
  onComplete,
}: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => next();

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Card content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              {steps[step].icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center">
            {steps[step].title} {steps[step].emoji}
          </h2>

          {/* Step content */}
          <div className="text-center space-y-4">
            {step === 0 && (
              <>
                <p className="text-muted-foreground">
                  Hey {firstName}! You're officially registered for the Appreneur
                  Challenge.
                </p>
                <p className="text-muted-foreground">
                  Here's how to get the most out of the next 5 days:
                </p>
                <Button onClick={next} size="lg" className="w-full">
                  Let's Go
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <p className="text-muted-foreground">
                  Your first bonus is ready:{" "}
                  <span className="text-foreground font-semibold">
                    "50 Profitable AI App Ideas for 2026"
                  </span>
                </p>
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    // TODO: Link to actual PDF resource
                    window.open("#", "_blank");
                  }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={next} size="lg" className="w-full">
                  Downloaded — Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button
                  onClick={skip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  I'll get it later
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-muted-foreground">
                  Connect with 500+ other Appreneurs building apps without code.
                  Share ideas, get feedback, and stay accountable.
                </p>
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full"
                  onClick={() => window.open(COMMUNITY_URL, "_blank")}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Open Community
                </Button>
                <Button onClick={next} size="lg" className="w-full">
                  Joined — Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button
                  onClick={skip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  I'll join later
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-muted-foreground">
                  {cohortStartDate
                    ? `The challenge starts ${cohortStartDate}. When it does, Day 1 will unlock right here on your dashboard.`
                    : "When the challenge starts, Day 1 will unlock right here on your dashboard."}
                </p>
                <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Each day you'll:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Watch the training video</li>
                    <li>Complete the action checklist</li>
                    <li>Unlock the next day</li>
                  </ol>
                </div>
                <Button onClick={onComplete} size="lg" className="w-full">
                  Go to My Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-primary" : i < step ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { OnboardingWizard };
