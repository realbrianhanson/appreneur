import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import QuizContainer from "@/components/quiz/QuizContainer";
import JourneyTimeline from "@/components/landing/JourneyTimeline";
import OpeningCopySection from "@/components/landing/OpeningCopySection";
import StickyCtaBar from "@/components/landing/StickyCtaBar";
import { AboutHostSection } from "@/components/landing/AboutHostSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhyThisWorks } from "@/components/landing/WhyThisWorks";
import { EarlyAccessSection } from "@/components/landing/EarlyAccessSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { AuthorityStrip } from "@/components/landing/AuthorityStrip";
import { PersonaChooser } from "@/components/landing/PersonaChooser";
import { LandingVideoSlot } from "@/components/landing/LandingVideoSlot";
import { OpportunityMechanismSection } from "@/components/landing/OpportunityMechanismSection";
import { MomentumLine } from "@/components/landing/MomentumLine";
import { GhostWord } from "@/components/motion/GhostWord";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import { trackPageView } from "@/lib/analytics";
import { Zap } from "lucide-react";
import { scrollTo } from "@/lib/scroll";
import { PRIMARY_CTA_LABEL } from "@/lib/constants";

const Index = () => {
  useEffect(() => {
    trackPageView("/", "Appreneur Challenge · Build Your First App in 5 Days");
  }, []);

  const scrollToQuiz = () => {
    const el = document.querySelector<HTMLElement>("#quiz-section");
    if (el) scrollTo(el, { offset: -40 });
    else scrollTo(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyCtaBar onCtaClick={scrollToQuiz} />
      <SEOHead
        title="The Free 5-Day App-Building Challenge for Non-Coders · Appreneur"
        description="Turn the app idea in your head into a working first version—in five focused days. Free, self-paced, beginner-friendly. No code. No developer. Start Day 1 today."
        canonicalUrl="https://appreneur.ai/"
      />

      <StructuredData
        organization={{
          name: "AI For Business",
          url: "https://appreneur.ai",
        }}
        course={{
          name: "The Appreneur Challenge",
          description:
            "A free, self-paced 5-day challenge for beginners and business owners age 50+ that guides you from idea to a working first website or app using AI — no coding, no developer required.",
          provider: "AI For Business",
          url: "https://appreneur.ai",
        }}
      />

      {/* Hero */}
      <HeroSection onCtaClick={scrollToQuiz} />

      {/* Authority — tight strip directly below the hero */}
      <AuthorityStrip />

      {/* Persona chooser — prefills the quiz's first answer */}
      <PersonaChooser />

      {/* Conditional VSL — renders only when a real URL is configured */}
      <LandingVideoSlot />

      {/* Problem / why they're stuck */}
      <OpeningCopySection />

      {/* Opportunity + mechanism */}
      <OpportunityMechanismSection />

      {/* Instructor authority — moved higher on the page */}
      <AboutHostSection />

      {/* Why this works — three-part mechanism */}
      <WhyThisWorks />

      {/* 5-day challenge — five missions, one working first version */}
      <Section
        id="journey-section"
        variant="default"
        spacing="xl"
        className="relative overflow-hidden"
      >
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
              Five missions.{" "}
              <span
                className="font-serifit bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                }}
              >
                One working first version.
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              One focused mission a day. One concrete deliverable at the end
              of every mission. A visible Day 5 finish line — all on your
              schedule.
            </p>
          </div>

          <JourneyTimeline />

          <div className="mt-16 text-center">
            <Button
              variant="cta"
              size="xl"
              className="text-lg py-6 min-h-11"
              onClick={scrollToQuiz}
            >
              {PRIMARY_CTA_LABEL}
              <Zap className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </Section>

      {/* What you'll have by Day 5 — outcomes */}
      <EarlyAccessSection onCtaClick={scrollToQuiz} />

      {/* Momentum — mid-page CTA, honest, no fake urgency */}
      <MomentumLine onCtaClick={scrollToQuiz} />

      {/* Approved testimonials — renders null when empty */}
      <SocialProofSection />

      {/* FAQ — overcome objections */}
      <FAQSection />

      <Section
        variant="default"
        spacing="lg"
        id="quiz-section"
        className="relative overflow-hidden"
      >
        <GhostWord word="DAY 01" align="top" className="opacity-70" />
        <Container size="wide" className="relative z-10">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
                Choose your starting point.{" "}
                <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  We'll tailor your first mission.
                </span>
              </h2>
              <p className="text-muted-foreground">
                Answer 3 quick questions, create your free account, and jump
                straight into Day 1.
              </p>
            </div>
            <QuizContainer />
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 md:py-14 bg-background">
        <Container size="wide">
          <div className="flex flex-col items-center gap-7 md:gap-8">
            <div className="flex items-center gap-2">
              <Zap
                className="w-5 h-5 md:w-6 md:h-6 text-primary"
                aria-hidden="true"
              />
              <span className="font-display font-bold text-lg md:text-xl tracking-tight">
                Appreneur
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <span className="text-white/10 hidden md:inline" aria-hidden="true">
                ·
              </span>
              <a
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-white/10 hidden md:inline" aria-hidden="true">
                ·
              </span>
              <a
                href="mailto:support@appreneur.ai"
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="max-w-3xl mx-auto text-center px-4 space-y-3 text-[11px] leading-relaxed text-muted-foreground/70">
              <p>
                This site is not a part of the Facebook website or Facebook
                Inc. Additionally, this site is NOT endorsed by Facebook in any
                way. FACEBOOK is a trademark of FACEBOOK, Inc.
              </p>
              <p>
                Results mentioned on this page are not typical and are not a
                promise of results. Building anything real takes work.
              </p>
            </div>

            <p className="text-xs text-muted-foreground/80 text-center px-4 font-mono tracking-wider">
              © 2026 AI For Business. Appreneur is a project of AI For Business.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;