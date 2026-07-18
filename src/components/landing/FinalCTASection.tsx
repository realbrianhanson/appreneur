import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ArrowRight, Shield, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Magnetic } from "@/components/motion/Magnetic";
import { scrollTo } from "@/lib/lenis";

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

  const scrollToQuiz = () => scrollTo("#quiz-section");

  return (
    <Section variant="default" spacing="xl" className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />

      <Container size="wide" className="relative z-10">
        <div
          ref={sectionRef}
          className={`max-w-5xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-[1.05] tracking-tight mb-12 md:mb-16">
            Look, you've got{" "}
            <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              two options
            </span>
          </h2>

          {/* Two Options cards */}
          <div className="grid md:grid-cols-2 gap-5 md:gap-6 text-left mb-12 md:mb-14">
            {/* Option 1 — muted */}
            <div className="relative p-7 md:p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <div className="space-y-2">
                  <div className="eyebrow font-mono text-xs tracking-[0.2em] text-muted-foreground">
                    OPTION 01
                  </div>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Keep sitting on the idea, watch AI keep passing you by, and wonder "what if" for another year.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2 — amber */}
            <div className="relative p-7 md:p-8 rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/[0.08] to-accent/[0.04] backdrop-blur-sm overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <div className="relative flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]">
                  <Check className="w-5 h-5 text-background" strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <div className="eyebrow font-mono text-xs tracking-[0.2em] text-primary">
                    OPTION 02
                  </div>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                    Spend 5 days with me, free, and walk away with an app you built yourself.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-6">
            I've made this as easy as I possibly can: free, no catch, and I'm in there with you every day. Just show up and build.
          </p>

          <p className="font-serifit italic text-3xl md:text-5xl leading-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-10 md:mb-12">
            The only question is: are you going to do it?
          </p>

          {/* Magnetic CTA */}
          <Magnetic strength={0.4}>
            <button
              onClick={scrollToQuiz}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-background font-semibold text-base md:text-lg shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.7)] hover:brightness-110 transition-all"
            >
              Let's Build This Thing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Magnetic>

          {/* Spots + date — JetBrains Mono uppercase */}
          <div className="mt-6 font-mono text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-muted-foreground px-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {isFetchingCohort ? (
              <span className="opacity-60">Loading cohort…</span>
            ) : (
              <>
                {spotsRemaining !== null && (
                  <>
                    <span className="text-primary">{spotsRemaining} spots left</span>
                    <span className="opacity-40">·</span>
                  </>
                )}
                {cohortStartDate ? (
                  <span>Starts {formatDate(cohortStartDate)}</span>
                ) : (
                  <span>Free 5-Day Challenge · Coming Soon</span>
                )}
              </>
            )}
          </div>

          {/* Fine print */}
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary/70" />
            <span>100% free. No credit card required. Unsubscribe anytime.</span>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { FinalCTASection };
