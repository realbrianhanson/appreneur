import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackingParams, getStoredTrackingParams } from "@/hooks/useTrackingParams";
import { sendWelcomeEmail } from "@/lib/email";
import { fireWebhook } from "@/lib/webhooks";
import {
  trackQuizComplete,
  trackRegistrationComplete as trackRegistrationCompleteAnalytics,
} from "@/lib/analytics";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import QuizStep from "./QuizStep";
import EmailCaptureForm from "./EmailCaptureForm";
import { Check } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Move focus to the new step's heading on every step change so
  // keyboard/screen-reader users aren't dropped back to <body>.
  useEffect(() => {
    // Wait for the enter animation before focusing so it doesn't jump.
    const t = setTimeout(() => {
      stepHeadingRef.current?.focus();
    }, 350);
    return () => clearTimeout(t);
  }, [currentStep]);

  const [direction, setDirection] = useState(1);

  // Warm-traffic fast lane: ?direct=1 skips the 3 questions and jumps to registration.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("direct") === "1") {
        setCurrentStep(4);
      }
    } catch {}
  }, []);

  // Fire funnel_events "quiz_started" once when the first answer is picked.
  const quizStartedRef = useRef(false);
  const trackQuizStarted = async () => {
    if (quizStartedRef.current) return;
    quizStartedRef.current = true;
    try {
      const trackingParams = getStoredTrackingParams();
      const sessionId =
        sessionStorage.getItem("session_id") || crypto.randomUUID();
      sessionStorage.setItem("session_id", sessionId);
      await supabase.from("funnel_events").insert({
        session_id: sessionId,
        event_type: "quiz_started",
        event_data: {},
        utm_source: trackingParams.utm_source,
        utm_medium: trackingParams.utm_medium,
        utm_campaign: trackingParams.utm_campaign,
        utm_content: trackingParams.utm_content,
        fb_ad_id: trackingParams.fb_ad_id,
      });
    } catch (err) {
      console.error("quiz_started track error", err);
    }
  };

  const handleAnswerSelect = (value: string) => {
    if (currentStep === 1) {
      void trackQuizStarted();
    }
    const newAnswers = [...answers];
    newAnswers[currentStep - 1] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < 4) {
        setDirection(1);
        setCurrentStep(currentStep + 1);
        // On leaving question 3 (moving to the registration form), fire the
        // quiz_completed funnel event and analytics.
        if (currentStep === 3) {
          void trackQuizCompletedEvent(newAnswers);
        }
      }
    }, 300);
  };

  const trackQuizCompletedEvent = async (finalAnswers: (string | null)[]) => {
    try {
      const trackingParams = getStoredTrackingParams();
      const sessionId =
        sessionStorage.getItem("session_id") || crypto.randomUUID();
      sessionStorage.setItem("session_id", sessionId);
      trackQuizComplete({
        answer1: finalAnswers[0] || "",
        answer2: finalAnswers[1] || "",
        answer3: finalAnswers[2] || "",
      });
      await supabase.from("funnel_events").insert({
        session_id: sessionId,
        event_type: "quiz_completed",
        event_data: { answers: finalAnswers },
        utm_source: trackingParams.utm_source,
        utm_medium: trackingParams.utm_medium,
        utm_campaign: trackingParams.utm_campaign,
        utm_content: trackingParams.utm_content,
        fb_ad_id: trackingParams.fb_ad_id,
      });
    } catch (err) {
      console.error("quiz_completed track error", err);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate a cryptographically random password (accounts are created with this;
  // the user can set a real one later from dashboard Settings).
  const generateRandomPassword = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    // Base64url — always >= 40 chars, satisfies any HIBP-uncompromised random string.
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "") + "!Aa1";
  };

  const handleEmailSubmit = async (data: { firstName: string; email: string; phone?: string }) => {
    setIsSubmitting(true);
    try {
      // Get tracking params
      const trackingParams = getStoredTrackingParams();
      const sessionId =
        sessionStorage.getItem("session_id") || crypto.randomUUID();
      sessionStorage.setItem("session_id", sessionId);

      // Step 1: Fire lead_captured funnel event (email submitted, not yet signed up).
      try {
        await supabase.from("funnel_events").insert({
          session_id: sessionId,
          event_type: "lead_captured",
          event_data: { email: data.email },
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          fb_ad_id: trackingParams.fb_ad_id,
        });
      } catch (e) {
        console.error("lead_captured track error", e);
      }

      // Step 2: Create user account. No phone / cohort_id is captured during
      // prelaunch. handle_new_user copies safe attribution fields into profile.
      const randomPassword = generateRandomPassword();
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: randomPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
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
            session_id: sessionId,
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
          toast.success("Welcome back! We just sent you a login link.");
          return;
        }
        throw signUpError;
      }

      if (authData.user) {
        // Give handle_new_user a beat to create the profile row.
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Initialize the 5 progress rows using the safe no-argument RPC.
        const { error: progressError } = await supabase.rpc(
          "initialize_user_progress"
        );
        if (progressError) {
          console.error("Error initializing progress:", progressError);
        }

        // Store quiz lead for tracking (backup) — no cohort_id in prelaunch.
        await supabase.from("quiz_leads").insert({
          first_name: data.firstName,
          email: data.email,
          answer1: answers[0] || "",
          answer2: answers[1] || "",
          answer3: answers[2] || "",
        });

        await supabase.from("funnel_events").insert({
          session_id: sessionId,
          user_id: authData.user.id,
          event_type: "registration_complete",
          event_data: {
            quiz_answers: answers,
          },
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          fb_ad_id: trackingParams.fb_ad_id,
        });

        trackRegistrationCompleteAnalytics(data.email);

        fireWebhook("user.registered", {
          user_id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          utm_params: {
            utm_source: trackingParams.utm_source || "",
            utm_medium: trackingParams.utm_medium || "",
            utm_campaign: trackingParams.utm_campaign || "",
            utm_content: trackingParams.utm_content || "",
            fb_ad_id: trackingParams.fb_ad_id || "",
          },
          quiz_answers: {
            answer1: answers[0] || "",
            answer2: answers[1] || "",
            answer3: answers[2] || "",
          },
        }).catch((err) => console.error("user.registered webhook error", err));

        // Fire-and-forget welcome email. We don't claim it's sent to the user
        // unless the server confirms it, so no toast promise here.
        sendWelcomeEmail(data.email, data.firstName, "").catch(err => {
          console.error("Error sending welcome email:", err);
        });

        if (authData.session) {
          navigate(`/thank-you?name=${encodeURIComponent(data.firstName)}`);
        } else {
          setIsComplete(true);
        }
        return;
      }

    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          You're already registered. Preview your dashboard below.
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
      <div className="text-center space-y-6 p-8 md:p-10 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10">
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_-8px_hsl(var(--primary)/0.7)]"
        >
          <Check className="w-12 h-12 text-background" strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="text-3xl md:text-4xl font-display font-bold leading-tight tracking-tight">
            You're in.{" "}
            <span className="font-serifit italic bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Early access confirmed.
            </span>
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            The lessons are being recorded. We'll email you the moment the full
            challenge opens.
          </p>
        </motion.div>
        <div>
          <button
            onClick={() => setIsComplete(false)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Wrong email? Try again
          </button>
        </div>
      </div>
    );
  }

  const progressPct = (Math.min(currentStep, 4) / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Quiz Card */}
      <div className="relative rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Thin amber progress bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="p-6 md:p-8 pt-8 md:pt-10">
          <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {currentStep <= 3 ? (
                    <QuizStep
                      ref={stepHeadingRef}
                      question={quizQuestions[currentStep - 1].question}
                      options={quizQuestions[currentStep - 1].options}
                      selectedValue={answers[currentStep - 1]}
                      onSelect={handleAnswerSelect}
                      stepNumber={currentStep}
                      totalSteps={3}
                      onBack={currentStep > 1 ? handleBack : undefined}
                    />
                  ) : (
                    <EmailCaptureForm
                      onSubmit={handleEmailSubmit}
                      isLoading={isSubmitting}
                      onBack={handleBack}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="flex -space-x-3">
            {['JM','SK','AR','LP','TC'].map((initials, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-[10px] font-bold text-background shadow-[0_2px_10px_-2px_hsl(var(--primary)/0.4)]"
              >
                {initials}
              </div>
            ))}
          </div>
          <span className="text-sm text-foreground/80">
            <span className="font-semibold text-foreground">500+</span> entrepreneurs enrolled
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Five focused days · On your schedule · No coding experience required
        </p>
      </div>
    </div>
  );
};

export default QuizContainer;
