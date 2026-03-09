import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface FinalCTASectionProps {
  cohortStartDate?: Date;
}

const FinalCTASection = ({ cohortStartDate: propDate }: FinalCTASectionProps) => {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [cohortStartDate, setCohortStartDate] = useState<Date | null>(propDate || null);
  const [isFetchingCohort, setIsFetchingCohort] = useState(!propDate);
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

  useEffect(() => {
    const fetchCohort = async () => {
      setIsFetchingCohort(true);
      try {
        const { data } = await supabase
          .from("cohorts")
          .select("start_date, max_participants, spots_taken")
          .eq("is_active", true)
          .eq("is_accepting_registrations", true)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data) {
          if (!propDate) {
            setCohortStartDate(new Date(data.start_date));
          }
          setSpotsRemaining(data.max_participants - data.spots_taken);
        }
      } catch (error) {
        console.error("Error fetching cohort:", error);
      } finally {
        setIsFetchingCohort(false);
      }
    };
    fetchCohort();
  }, [propDate]);

  const scrollToQuiz = () => {
    const quizElement = document.querySelector('#quiz-section');
    if (quizElement) {
      quizElement.scrollIntoView({ behavior: 'smooth' });
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

          {/* CTA Button — scrolls to quiz */}
          <div
            className={`p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Button
              variant="cta"
              size="xl"
              className="w-full text-lg py-7"
              onClick={scrollToQuiz}
            >
              Let's Build This Thing
              <ArrowRight className="w-5 h-5" />
            </Button>

            {/* Micro text */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              {isFetchingCohort ? (
                <Skeleton className="h-4 w-48" />
              ) : cohortStartDate ? (
                <span>Free 5-Day Challenge. Starts {formatDate(cohortStartDate)}.</span>
              ) : (
                <span>Free 5-Day Challenge. Coming Soon.</span>
              )}
            </div>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>100% free. No credit card required. Unsubscribe anytime.</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { FinalCTASection };
