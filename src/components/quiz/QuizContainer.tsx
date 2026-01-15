import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QuizStep from "./QuizStep";
import EmailCaptureForm from "./EmailCaptureForm";
import WaitlistForm from "./WaitlistForm";
import ProgressIndicator from "./ProgressIndicator";
import CountdownTimer from "./CountdownTimer";
import { Users, Calendar } from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  max_participants: number;
  spots_taken: number;
}

const quizQuestions = [
  {
    question: "Do you have an app idea you've been sitting on?",
    options: [
      { label: "Yes, I've had this idea for a while", value: "idea_existing" },
      { label: "Yes, I have a few ideas actually", value: "idea_multiple" },
      { label: "Not yet, but I want to build something", value: "idea_none" },
    ],
  },
  {
    question: "What's stopped you from building it?",
    options: [
      { label: "I don't know how to code", value: "blocker_code" },
      { label: "I thought it would be too expensive", value: "blocker_cost" },
      { label: "I didn't know where to start", value: "blocker_start" },
      { label: "All of the above", value: "blocker_all" },
    ],
  },
  {
    question: "If you could build a real, working app this week, would you commit 60 minutes a day to make it happen?",
    options: [
      { label: "Yes, I'm ready", value: "commit_ready" },
      { label: "I'd make the time", value: "commit_time" },
      { label: "Let's do this", value: "commit_lets_go" },
    ],
  },
];

const QuizContainer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    fetchActiveCohort();
  }, []);

  const fetchActiveCohort = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cohorts")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (data) setCohort(data);
    } catch (error) {
      console.error("Error fetching cohort:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep - 1] = value;
    setAnswers(newAnswers);

    // Brief delay to show selection, then advance
    setTimeout(() => {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }, 400);
  };

  const handleEmailSubmit = async (data: { firstName: string; email: string }) => {
    if (!cohort) return;
    
    setIsSubmitting(true);
    try {
      // Insert quiz lead
      const { error: leadError } = await supabase.from("quiz_leads").insert({
        first_name: data.firstName,
        email: data.email,
        answer1: answers[0] || "",
        answer2: answers[1] || "",
        answer3: answers[2] || "",
        cohort_id: cohort.id,
      });

      if (leadError) throw leadError;

      // Increment spots taken
      const { error: spotError } = await supabase.rpc("increment_spots_taken", {
        cohort_uuid: cohort.id,
      });

      if (spotError) throw spotError;

      setIsComplete(true);
      toast.success("You're registered! Check your email for next steps.");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (email: string) => {
    if (!cohort) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        email,
        cohort_id: cohort.id,
      });

      if (error) throw error;
      toast.success("You're on the waitlist!");
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsRemaining = cohort ? cohort.max_participants - cohort.spots_taken : 0;
  const isFull = spotsRemaining <= 0;
  const cohortStartDate = cohort ? new Date(cohort.start_date) : new Date();

  const formatCohortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  if (isComplete) {
    return (
      <div className="animate-fade-in text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/30">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-4xl">🚀</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold">
          You're In! Welcome to the Challenge
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Check your inbox for your welcome email and instant access to 
          "50 Profitable AI App Ideas for 2025".
        </p>
        <div className="pt-4">
          <p className="text-sm text-muted-foreground">The challenge starts:</p>
          <p className="text-lg font-display font-bold text-primary">
            {formatCohortDate(cohortStartDate)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Urgency Elements */}
      {cohort && (
        <div className="space-y-4">
          {/* Countdown */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Challenge Starts {formatCohortDate(cohortStartDate)}</span>
            </div>
            <CountdownTimer targetDate={cohortStartDate} />
          </div>

          {/* Spots Remaining */}
          {!isFull && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 w-fit mx-auto">
              <Users className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold">
                <span className="text-secondary">{spotsRemaining}</span>
                <span className="text-muted-foreground"> of {cohort.max_participants} Spots Left</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quiz Card */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border p-6 md:p-8 shadow-card">
        {/* Progress Indicator */}
        {!isFull && (
          <div className="mb-6">
            <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          </div>
        )}

        {/* Waitlist Form (when full) */}
        {isFull && (
          <WaitlistForm
            nextCohortDate="February 2025"
            onSubmit={handleWaitlistSubmit}
            isLoading={isSubmitting}
          />
        )}

        {/* Quiz Steps */}
        {!isFull && (
          <>
            <QuizStep
              question={quizQuestions[0].question}
              options={quizQuestions[0].options}
              selectedValue={answers[0]}
              onSelect={handleAnswerSelect}
              isVisible={currentStep === 1}
            />
            <QuizStep
              question={quizQuestions[1].question}
              options={quizQuestions[1].options}
              selectedValue={answers[1]}
              onSelect={handleAnswerSelect}
              isVisible={currentStep === 2}
            />
            <QuizStep
              question={quizQuestions[2].question}
              options={quizQuestions[2].options}
              selectedValue={answers[2]}
              onSelect={handleAnswerSelect}
              isVisible={currentStep === 3}
            />
            <EmailCaptureForm
              onSubmit={handleEmailSubmit}
              isLoading={isSubmitting}
              isVisible={currentStep === 4}
            />
          </>
        )}
      </div>

      {/* Trust Badges */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Join entrepreneurs from companies like
        </p>
        <div className="flex items-center justify-center gap-6 md:gap-8 opacity-60">
          <span className="text-lg font-display font-bold">Google</span>
          <span className="text-lg font-display font-bold">Shopify</span>
          <span className="text-lg font-display font-bold">Amazon</span>
          <span className="text-lg font-display font-bold hidden md:block">Meta</span>
        </div>
      </div>
    </div>
  );
};

export default QuizContainer;
