import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackingParams, getStoredTrackingParams } from "@/hooks/useTrackingParams";
import { sendWelcomeEmail } from "@/lib/email";
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
  is_accepting_registrations: boolean;
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Capture tracking params from URL
  useTrackingParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [nextCohort, setNextCohort] = useState<Cohort | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    setIsLoading(true);
    try {
      // Fetch active cohort accepting registrations
      const { data: activeCohort, error: activeError } = await supabase
        .from("cohorts")
        .select("*")
        .eq("is_active", true)
        .eq("is_accepting_registrations", true)
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (activeError) throw activeError;
      
      if (activeCohort) {
        setCohort(activeCohort as Cohort);
      } else {
        // No active cohort accepting registrations, fetch next upcoming one
        const { data: upcoming, error: upcomingError } = await supabase
          .from("cohorts")
          .select("*")
          .eq("is_active", true)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();
          
        if (upcomingError) throw upcomingError;
        if (upcoming) {
          setNextCohort(upcoming as Cohort);
        }
      }
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

  const handleEmailSubmit = async (data: { firstName: string; email: string; password: string; phone?: string }) => {
    if (!cohort) return;
    
    setIsSubmitting(true);
    
    try {
      // Get tracking params
      const trackingParams = getStoredTrackingParams();
      
      // Step 1: Check if spots are available using atomic reservation
      const { data: spotReserved, error: spotError } = await supabase.rpc(
        "reserve_cohort_spot",
        { p_cohort_id: cohort.id }
      );

      if (spotError) {
        console.error("Error reserving spot:", spotError);
        throw new Error("Failed to reserve your spot. Please try again.");
      }

      if (!spotReserved) {
        // Cohort is full, redirect to waitlist
        toast.error("This cohort just filled up! Adding you to the waitlist.");
        await handleWaitlistSubmit(data.email, data.firstName, data.phone);
        return;
      }

      // Step 2: Create user account with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            phone: data.phone || null,
          },
        },
      });

      if (signUpError) {
        // If user already exists, try to sign them in with magic link
        if (signUpError.message.includes("already registered")) {
          const { error: magicLinkError } = await supabase.auth.signInWithOtp({
            email: data.email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          
          if (magicLinkError) throw magicLinkError;
          
          setIsComplete(true);
          toast.success("Welcome back! Check your email for the login link.");
          return;
        }
        throw signUpError;
      }

      // Step 3: Update profile with additional data (trigger creates basic profile)
      if (authData.user) {
        // Wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            phone: data.phone || null,
            cohort_id: cohort.id,
            quiz_answers: {
              answer1: answers[0],
              answer2: answers[1],
              answer3: answers[2],
            },
            utm_source: trackingParams.utm_source,
            utm_medium: trackingParams.utm_medium,
            utm_campaign: trackingParams.utm_campaign,
            utm_content: trackingParams.utm_content,
            fb_ad_id: trackingParams.fb_ad_id,
            fb_adset_id: trackingParams.fb_adset_id,
            fb_campaign_id: trackingParams.fb_campaign_id,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't fail registration if profile update fails
        }

        // Step 4: Initialize user progress (Day 1 unlocked)
        const { error: progressError } = await supabase.rpc(
          "initialize_user_progress",
          { p_user_id: authData.user.id }
        );

        if (progressError) {
          console.error("Error initializing progress:", progressError);
          // Don't fail registration if progress init fails
        }

        // Step 5: Store quiz lead for tracking (backup)
        await supabase.from("quiz_leads").insert({
          first_name: data.firstName,
          email: data.email,
          answer1: answers[0] || "",
          answer2: answers[1] || "",
          answer3: answers[2] || "",
          cohort_id: cohort.id,
        });

        // Step 6: Track funnel event
        await supabase.from("funnel_events").insert({
          session_id: sessionStorage.getItem("session_id") || crypto.randomUUID(),
          user_id: authData.user.id,
          event_type: "registration_complete",
          event_data: {
            cohort_id: cohort.id,
            quiz_answers: answers,
          },
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          fb_ad_id: trackingParams.fb_ad_id,
        });

        // Step 7: Send welcome email
        const cohortStartDate = new Date(cohort.start_date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        
        sendWelcomeEmail(data.email, data.firstName, cohortStartDate).catch(err => {
          console.error("Error sending welcome email:", err);
          // Don't fail registration if email fails
        });
      }

      setIsComplete(true);
      toast.success("You're registered! Check your email for next steps.");
      
      // Redirect to VIP offer page after a short delay
      setTimeout(() => {
        navigate("/vip-offer");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaitlistSubmit = async (email: string, firstName?: string, phone?: string) => {
    const targetCohortId = nextCohort?.id || cohort?.id;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        email,
        first_name: firstName || null,
        phone: phone || null,
        target_cohort_id: targetCohortId,
      });

      if (error) throw error;
      
      // Track waitlist event
      const trackingParams = getStoredTrackingParams();
      await supabase.from("funnel_events").insert({
        session_id: sessionStorage.getItem("session_id") || crypto.randomUUID(),
        event_type: "waitlist_joined",
        event_data: { target_cohort_id: targetCohortId },
        utm_source: trackingParams.utm_source,
        utm_medium: trackingParams.utm_medium,
        utm_campaign: trackingParams.utm_campaign,
        utm_content: trackingParams.utm_content,
        fb_ad_id: trackingParams.fb_ad_id,
      });
      
      toast.success("You're on the waitlist! We'll notify you when spots open.");
    } catch (error) {
      console.error("Error joining waitlist:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const spotsRemaining = cohort ? cohort.max_participants - cohort.spots_taken : 0;
  const isFull = !cohort || spotsRemaining <= 0 || !cohort.is_accepting_registrations;
  const cohortStartDate = cohort ? new Date(cohort.start_date) : (nextCohort ? new Date(nextCohort.start_date) : new Date());

  const formatCohortDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // If user is already authenticated, show different message
  if (isAuthenticated) {
    return (
      <div className="animate-fade-in text-center space-y-6 p-8 rounded-2xl bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/30">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-display font-bold">
          Welcome Back!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You're already registered for the challenge.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

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
          "50 Profitable AI App Ideas for 2026".
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
    <div id="quiz-section" className="space-y-6">
      {/* Urgency Elements */}
      {(cohort || nextCohort) && (
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
          {!isFull && cohort && (
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
            nextCohortDate={nextCohort ? formatCohortDate(new Date(nextCohort.start_date)) : "Coming Soon"}
            onSubmit={(email) => handleWaitlistSubmit(email)}
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
