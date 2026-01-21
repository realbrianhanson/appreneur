import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Shield, Zap, Users, Calendar } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

interface FinalCTASectionProps {
  cohortStartDate?: Date;
}

const FinalCTASection = ({ cohortStartDate = new Date("2026-01-27T09:00:00") }: FinalCTASectionProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fetch spots remaining
  useEffect(() => {
    const fetchSpots = async () => {
      const { data } = await supabase
        .from("cohorts")
        .select("max_participants, spots_taken")
        .eq("is_active", true)
        .single();

      if (data) {
        setSpotsRemaining(data.max_participants - data.spots_taken);
      }
    };
    fetchSpots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({ firstName, email });
    if (!result.success) {
      const fieldErrors: { firstName?: string; email?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "firstName") fieldErrors.firstName = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Get active cohort
      const { data: cohort } = await supabase
        .from("cohorts")
        .select("id")
        .eq("is_active", true)
        .single();

      // Submit to quiz_leads
      const { error } = await supabase.from("quiz_leads").insert({
        first_name: result.data.firstName,
        email: result.data.email,
        answer1: "final-cta",
        answer2: "direct-signup",
        answer3: "bottom-section",
        cohort_id: cohort?.id || null,
      });

      if (error) throw error;

      // Increment spots taken
      if (cohort?.id) {
        await supabase.rpc("increment_spots_taken", { cohort_uuid: cohort.id });
      }

      setIsSubmitted(true);
      toast.success("You're registered! Check your email for next steps.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Section variant="gradient" spacing="xl" className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background-secondary to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-secondary/10 to-transparent blur-3xl" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <Container size="wide" className="relative z-10">
        <div
          ref={sectionRef}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Headline */}
          <div className="space-y-6 mb-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Look, You've Got Two Options
            </h2>
            
            <div className="space-y-4 text-left max-w-2xl mx-auto text-lg text-muted-foreground">
              <p>
                <span className="text-foreground font-semibold">Option 1:</span> Keep sitting on that app idea. 
                Watch AI pass you by. Wonder "what if" for another year.
              </p>
              <p>
                <span className="text-foreground font-semibold">Option 2:</span> Spend 5 days with me — for free — 
                and walk away with an actual app you built yourself.
              </p>
            </div>

            <p className="text-xl text-foreground font-medium">
              I've made this as easy as I possibly can. No cost. No catch. Just show up and build.
            </p>
            
            <p className="text-2xl font-bold text-gradient-primary">
              The only question is: are you going to do it?
            </p>
          </div>

          {/* Spots Remaining */}
          {spotsRemaining !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30 text-destructive mb-8">
              <Users className="w-4 h-4" />
              <span className="font-semibold">Only {spotsRemaining} spots remaining</span>
            </div>
          )}

          {/* Form or Success Message */}
          {isSubmitted ? (
            <div
              className={`p-8 rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm transition-all duration-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                You're In! 🎉
              </h3>
              <p className="text-muted-foreground">
                Check your email for your welcome message and the "750 Profitable AI App Ideas" PDF.
              </p>
            </div>
          ) : (
            <div
              className={`p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`h-14 text-lg ${errors.firstName ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive text-left">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-14 text-lg ${errors.email ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive text-left">{errors.email}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cta"
                  size="xl"
                  className="w-full text-lg py-7"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Reserving Your Spot...
                    </>
                  ) : (
                    <>
                      Let's Build This Thing
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Micro text */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Free 5-Day Challenge. Starts {formatDate(cohortStartDate)}.</span>
              </div>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>100% free. No credit card required. Unsubscribe anytime.</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

export { FinalCTASection };
