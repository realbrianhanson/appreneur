import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import QuizContainer from "@/components/quiz/QuizContainer";
import JourneyTimeline from "@/components/landing/JourneyTimeline";
import ValueStackSection from "@/components/landing/ValueStackSection";
import OpeningCopySection from "@/components/landing/OpeningCopySection";
import UrgencySection from "@/components/landing/UrgencySection";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { AboutHostSection } from "@/components/landing/AboutHostSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ShippedMarquee } from "@/components/landing/ShippedMarquee";
import { GhostWord } from "@/components/motion/GhostWord";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import { trackPageView } from "@/lib/analytics";
import { useNextCohort } from "@/hooks/useNextCohort";
import { Zap, Twitter, Linkedin, Youtube } from "lucide-react";
import { scrollTo } from "@/lib/lenis";

const Index = () => {
  const { targetDate, isFallback } = useNextCohort();
  // Only expose real DB cohorts in structured data — never the client-side fallback.
  const nextCohortDate = !isFallback ? targetDate.toISOString() : null;

  useEffect(() => {
    trackPageView('/', 'Appreneur Challenge · Build Your First App in 5 Days');
  }, []);

  const scrollToQuiz = () => {
    const el = document.querySelector<HTMLElement>('#quiz-section');
    if (el) scrollTo(el, { offset: -40 });
    else scrollTo(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyCtaBar onCtaClick={scrollToQuiz} />
      <SEOHead
        title="Appreneur Challenge · Build Your First App in 5 Days"
        description="Join 500+ entrepreneurs building real apps without code. Free 5-day challenge teaches you to go from idea to live app."
        canonicalUrl="https://appreneur.ai/"
      />
      
      <StructuredData
        organization={{
          name: "AI For Beginners",
          url: "https://appreneur.ai",
          sameAs: [
            "https://twitter.com/AIForBeginners",
            "https://linkedin.com/company/aiforbeginners",
            "https://youtube.com/@AIForBeginners"
          ]
        }}
        course={{
          name: "The Appreneur Challenge",
          description: "A free 5-day challenge that teaches entrepreneurs to build real apps without coding using AI-powered tools.",
          provider: "AI For Beginners",
          url: "https://appreneur.ai"
        }}
        {...(nextCohortDate && {
          event: {
            name: "Appreneur Challenge - Next Cohort",
            description: "Join our next cohort and build your first app in 5 days. No coding experience required.",
            startDate: nextCohortDate,
            url: "https://appreneur.ai",
            organizer: "AI For Beginners"
          }
        })}
      />

      {/* Hero Section — editorial asymmetric layout */}
      <HeroSection onCtaClick={scrollToQuiz} />

      {/* Shipped apps marquee */}
      <ShippedMarquee />

      {/* Opening Copy — agitate the problem */}
      <OpeningCopySection />

      {/* Social Proof — prove it works (moved up) */}
      <SocialProofSection />

      {/* What You'll Build — show the journey */}
      <Section variant="default" spacing="xl" className="relative overflow-hidden">
        <GhostWord word="05 DAYS" align="top" />

        <Container size="wide" className="relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2
              className="font-bold leading-[1.05] tracking-tight"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                color: "#F4F2EE",
              }}
            >
              Go From Idea to Live App in{" "}
              <span
                className="font-serifit bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                }}
              >
                5 Days
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each day builds on the last. By the end, you'll have a real, working app 
              that you built yourself.
            </p>
          </div>

          <JourneyTimeline />

          <div className="mt-16 text-center">
            <Button 
              variant="cta" 
              size="xl"
              className="text-lg py-6"
              onClick={scrollToQuiz}
            >
              Join the Challenge
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </Container>
      </Section>

      {/* Value Stack — anchor the value */}
      <Section variant="default" spacing="lg" className="relative overflow-hidden pb-12 md:pb-16">
        <GhostWord word="$2,085 → $0" align="top" className="opacity-70" />
        <Container size="wide" className="relative z-10">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-glow-primary">
              Everything You Need to Build Your{" "}
              <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                first app
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Here's what you're getting when you join the challenge:
            </p>
          </div>

          <ValueStackSection />
        </Container>
      </Section>

      {/* About Host — credibility */}
      <AboutHostSection />

      {/* FAQ — overcome objections */}
      <FAQSection />

      {/* Urgency + Quiz — the close (moved to bottom) */}
      <UrgencySection />

      <Section variant="default" spacing="lg" id="quiz-section" className="relative overflow-hidden">
        <GhostWord word="DAY 01" align="top" className="opacity-70" />
        <Container size="wide" className="relative z-10">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
                Ready? Let's{" "}
                <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  get you started
                </span>
              </h2>
              <p className="text-muted-foreground">
                Answer 3 quick questions and claim your free spot
              </p>
            </div>
            <QuizContainer />
          </div>
        </Container>
      </Section>

      {/* Final CTA — last chance */}
      <FinalCTASection />

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 md:py-14 bg-background">
        <Container size="wide">
          <div className="flex flex-col items-center gap-7 md:gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight">Appreneur</span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-white/10 hidden md:inline">·</span>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-white/10 hidden md:inline">·</span>
              <a href="mailto:support@appreneur.ai" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-3">
              <a href="https://twitter.com/AIForBeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/aiforbeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@AIForBeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            <p className="text-xs text-muted-foreground/70 text-center px-4 font-mono tracking-wider">
              © 2026 AI FOR BEGINNERS · ALL RIGHTS RESERVED
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;