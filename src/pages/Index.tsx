import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import QuizContainer from "@/components/quiz/QuizContainer";
import HeroVisual from "@/components/landing/HeroVisual";
import FloatingParticles from "@/components/landing/FloatingParticles";
import JourneyTimeline from "@/components/landing/JourneyTimeline";
import ValueStackSection from "@/components/landing/ValueStackSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { AboutHostSection } from "@/components/landing/AboutHostSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import heroVideo from "@/assets/hero-video.mp4";
import { Zap, ArrowDown, Twitter, Linkedin, Youtube } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full viewport */}
      <Section variant="gradient" spacing="xl" className="relative overflow-hidden min-h-screen flex items-center pt-8 md:pt-0">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-10"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </div>

        {/* Floating Particles */}
        <FloatingParticles />

        {/* Background glow effects */}
        <div className="absolute inset-0 bg-glow-primary opacity-30 z-[1]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-gradient-radial from-secondary/10 via-transparent to-transparent blur-3xl z-[1]" />

        <Container size="full" className="relative z-10 py-6 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Copy + Quiz */}
            <div className="space-y-4 md:space-y-8 animate-fade-in text-center lg:text-left">
              <Badge variant="glow" className="inline-flex">
                <Zap className="w-3 h-3 mr-1" />
                Free 7-Day Challenge
              </Badge>

              <div className="space-y-2 md:space-y-4">
                <h1 className="text-glow-primary text-3xl md:text-5xl lg:text-6xl">
                  Build Your First App in 7 Days
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-gradient-primary">
                  No Coding Required
                </p>
              </div>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Join <span className="text-secondary font-semibold">500+ entrepreneurs</span> in 
                the next Appreneur Challenge. You'll walk away with a real, working app — even 
                if you've never written a line of code.
              </p>

              {/* Quiz Container */}
              <QuizContainer />
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <HeroVisual />
            </div>
          </div>
        </Container>

        {/* Scroll indicator - hidden on mobile */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float hidden md:flex">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wider">See the Journey</span>
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      </Section>

      {/* What You'll Build Section */}
      <Section variant="muted" spacing="xl" className="relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-radial from-accent/5 to-transparent blur-3xl" />
        
        <Container size="wide" className="relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mx-auto">
              Your 7-Day Transformation
            </Badge>
            <h2 className="text-glow-primary">
              Go From Idea to Live App in 7 Days
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each day builds on the last. By the end, you'll have a real, working app 
              that you built yourself.
            </p>
          </div>

          <JourneyTimeline />

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to start your journey?
            </p>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              <Zap className="w-4 h-4" />
              Join the Challenge Above
            </a>
          </div>
        </Container>
      </Section>

      {/* What You Get FREE Section */}
      <Section variant="default" spacing="xl" className="relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-secondary/5 via-primary/5 to-transparent blur-3xl" />
        
        <Container size="wide" className="relative z-10">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="secondary" className="mx-auto">
              100% Free Access
            </Badge>
            <h2 className="text-glow-primary">
              Everything You Need to Build Your First App
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get instant access to the complete challenge toolkit — no strings attached.
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
      <FinalCTASection />

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
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span className="text-border hidden md:inline">|</span>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
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
