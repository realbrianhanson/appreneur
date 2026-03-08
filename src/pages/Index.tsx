import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import QuizContainer from "@/components/quiz/QuizContainer";
import HeroVisual from "@/components/landing/HeroVisual";
import FloatingParticles from "@/components/landing/FloatingParticles";
import JourneyTimeline from "@/components/landing/JourneyTimeline";
import ValueStackSection from "@/components/landing/ValueStackSection";
import OpeningCopySection from "@/components/landing/OpeningCopySection";
import UrgencySection from "@/components/landing/UrgencySection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { AboutHostSection } from "@/components/landing/AboutHostSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import { trackPageView } from "@/lib/analytics";
import brianPhoto from "@/assets/brian-hanson.jpeg";
import { Zap, ArrowDown, ArrowRight, Twitter, Linkedin, Youtube, Quote } from "lucide-react";

// Next cohort start date
const COHORT_START_DATE = new Date("2026-01-27T09:00:00");
const NEXT_COHORT_DATE = "2026-01-27T15:00:00Z";

const Index = () => {
  // Track page view on mount
  useEffect(() => {
    trackPageView('/', 'Appreneur Challenge — Build Your First App in 5 Days');
  }, []);

  const scrollToQuiz = () => {
    const quizElement = document.querySelector('#quiz-section');
    if (quizElement) {
      quizElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Head */}
      <SEOHead 
        title="Appreneur Challenge — Build Your First App in 5 Days"
        description="Join 500+ entrepreneurs building real apps without code. Free 5-day challenge teaches you to go from idea to live app."
        canonicalUrl="https://appreneur.ai/"
      />
      
      {/* Structured Data */}
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
        event={{
          name: "Appreneur Challenge - January 2026 Cohort",
          description: "Join our next cohort and build your first app in 5 days. No coding experience required.",
          startDate: NEXT_COHORT_DATE,
          url: "https://appreneur.ai",
          organizer: "AI For Beginners"
        }}
      />

      {/* Hero Section - Full viewport */}
      <Section variant="gradient" spacing="xl" className="relative overflow-hidden min-h-screen flex items-center pt-8 md:pt-0">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={brianPhoto}
            alt=""
            loading="eager"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Background glow effects */}
        <div className="absolute inset-0 bg-glow-primary opacity-30 z-[1]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-gradient-radial from-secondary/10 via-transparent to-transparent blur-3xl z-[1]" />

        <Container size="full" className="relative z-10 py-6 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Copy + CTA */}
            <div className="space-y-6 md:space-y-8 animate-fade-in text-center lg:text-left">
              {/* New Headline */}
              <div className="space-y-4">
                <h1 className="text-glow-primary text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Go From "I Have an Idea" to "Holy Crap, I Built That" in 5 Days
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground/90 leading-relaxed">
                  No coding. No developers. No $15K budget. Just you, AI, and my step-by-step system that's helped 99+ entrepreneurs ship real, working apps.
                </p>
              </div>

              {/* Credibility Bar */}
              <p className="text-sm md:text-base text-muted-foreground">
                Taught by <span className="text-foreground font-medium">Brian Hanson</span> — 4X Inc. 5000 Entrepreneur | Built Multiple 7-Figure Businesses | Taught 150,000+ People to Leverage AI
              </p>

              {/* CTA Button Above the Fold */}
              <div className="space-y-3" id="quiz-section">
                <Button 
                  variant="cta" 
                  size="xl" 
                  className="text-lg md:text-xl py-7 px-10 w-full md:w-auto"
                  onClick={scrollToQuiz}
                >
                  Join the Free 5-Day Challenge
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  No credit card. No fluff. Just building.
                </p>
              </div>

              {/* Testimonial Quote in Hero */}
              <div className="pt-4 border-t border-border/30">
                <div className="flex items-start gap-4 text-left">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
                    <img 
                      src={brianPhoto} 
                      alt="Testimonial" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-primary shrink-0 mt-1" />
                      <p className="text-sm md:text-base text-muted-foreground italic">
                        "I went from never building anything to having a live app in 6 days. Brian breaks it down so anyone can do this."
                      </p>
                    </div>
                    <p className="text-sm text-foreground font-medium mt-2">— Sarah M., TaskFlow Pro</p>
                  </div>
                </div>
              </div>

              {/* Quiz Container */}
              <QuizContainer />
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <HeroVisual />
            </div>
          </div>
        </Container>

      </Section>

      {/* Opening Copy Section - New compelling copy */}
      <OpeningCopySection />

      {/* Urgency Section with Countdown */}
      <UrgencySection cohortStartDate={COHORT_START_DATE} />

      {/* What You'll Build Section */}
      <Section variant="muted" spacing="xl" className="relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-radial from-accent/5 to-transparent blur-3xl" />
        
        <Container size="wide" className="relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-glow-primary">
              Go From Idea to Live App in 5 Days
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each day builds on the last. By the end, you'll have a real, working app 
              that you built yourself.
            </p>
          </div>

          <JourneyTimeline />

          {/* Bottom CTA */}
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

      {/* What You Get FREE Section - Updated Value Stack */}
      <Section variant="default" spacing="xl" className="relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-secondary/5 via-primary/5 to-transparent blur-3xl" />
        
        <Container size="wide" className="relative z-10">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-glow-primary">
              Everything You Need to Build Your First App
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Here's what you're getting when you join the challenge:
            </p>
          </div>

          <ValueStackSection />
        </Container>
      </Section>

      {/* Social Proof Section */}
      <SocialProofSection />

      {/* About Host Section */}
      <AboutHostSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <FinalCTASection cohortStartDate={COHORT_START_DATE} />

      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-12 bg-background">
        <Container size="wide">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <span className="font-display font-bold text-lg md:text-xl">Appreneur</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="mailto:support@appreneur.ai" className="hover:text-primary transition-colors">Contact</a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/AIForBeginners"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/aiforbeginners"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@AIForBeginners"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
              © 2026 AI For Beginners. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;
