import { useEffect, useState } from "react";
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
import SEOHead from "@/components/seo/SEOHead";
import StructuredData from "@/components/seo/StructuredData";
import { trackPageView } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import brianPhoto from "@/assets/brian-hanson.jpeg";
import { Zap, ArrowRight, Twitter, Linkedin, Youtube } from "lucide-react";

const Index = () => {
  const [nextCohortDate, setNextCohortDate] = useState<string | null>(null);

  useEffect(() => {
    trackPageView('/', 'Appreneur Challenge — Build Your First App in 5 Days');
  }, []);

  useEffect(() => {
    const fetchCohortDate = async () => {
      const { data } = await supabase
        .from("cohorts")
        .select("start_date")
        .eq("is_active", true)
        .eq("is_accepting_registrations", true)
        .order("start_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setNextCohortDate(new Date(data.start_date).toISOString());
      }
    };
    fetchCohortDate();
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
      <StickyCtaBar onCtaClick={scrollToQuiz} />
      <SEOHead
        title="Appreneur Challenge — Build Your First App in 5 Days"
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

      {/* Hero Section — dark, cinematic */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center" style={{ background: 'hsl(var(--hero-bg))' }}>
        {/* Brian photo — dramatic side placement */}
        <div className="absolute inset-0 z-0">
          <img
            src={brianPhoto}
            alt="Brian Hanson"
            loading="eager"
            className="w-full h-full object-cover object-top opacity-55"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(var(--hero-bg)) 30%, hsl(var(--hero-bg) / 0.65) 65%, hsl(var(--hero-bg) / 0.85))' }} />
        </div>

        {/* Colored glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] z-[1]" />
        <div className="absolute top-2/3 left-1/4 w-[300px] h-[300px] rounded-full bg-secondary/10 blur-[80px] z-[1]" />

        <Container size="wide" className="relative z-10 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--hero-muted))' }}>Free 5-Day Challenge — Next Cohort Starting Soon</span>
            </div>

            {/* Headline with gradient */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight" style={{ color: 'hsl(var(--hero-fg))' }}>
              Go From "I Have an Idea" to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary">
                "I Built That"
              </span>
              {' '}in 5 Days
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'hsl(var(--hero-muted))' }}>
              No coding. No developers. No $15K budget. Just you, AI, and a proven system that's helped <strong style={{ color: 'hsl(var(--hero-fg))' }}>500+ entrepreneurs</strong> ship real, working apps.
            </p>

            {/* CTA */}
            <div className="space-y-4 pt-2">
              <Button 
                variant="cta" 
                size="xl" 
                className="text-lg md:text-xl py-7 px-12 shadow-[0_0_40px_hsl(25_95%_53%/0.3)]"
                onClick={scrollToQuiz}
              >
                See If You Qualify — 3 Quick Questions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm" style={{ color: 'hsl(var(--hero-muted))' }}>
                ✓ 100% Free &nbsp;·&nbsp; ✓ No Experience Needed &nbsp;·&nbsp; ✓ Takes 60 seconds
              </p>
            </div>

            {/* Credibility bar */}
            <div className="pt-8 border-t border-white/10">
              <p className="text-xs" style={{ color: 'hsl(var(--hero-muted) / 0.7)' }}>
                Taught by <span className="font-semibold" style={{ color: 'hsl(var(--hero-fg))' }}>Brian Hanson</span> — 4X Inc. 5000 Entrepreneur · Built Multiple 7-Figure Businesses · 150,000+ Students
              </p>
            </div>
          </div>
        </Container>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* Opening Copy — agitate the problem */}
      <OpeningCopySection />

      {/* Social Proof — prove it works (moved up) */}
      <SocialProofSection />

      {/* What You'll Build — show the journey */}
      <Section variant="muted" spacing="xl" className="relative overflow-hidden">
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

      {/* About Host — credibility */}
      <AboutHostSection />

      {/* FAQ — overcome objections */}
      <FAQSection />

      {/* Urgency + Quiz — the close (moved to bottom) */}
      <UrgencySection />

      <Section variant="default" spacing="lg" id="quiz-section">
        <Container size="wide">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Ready? Let's Get You Started
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
      <footer className="border-t border-border py-8 md:py-12 bg-background">
        <Container size="wide">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              <span className="font-display font-bold text-lg md:text-xl">Appreneur</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="mailto:support@appreneur.ai" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <a href="https://twitter.com/AIForBeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/aiforbeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://youtube.com/@AIForBeginners" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube className="w-4 h-4" />
              </a>
            </div>

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