import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import QuizContainer from "@/components/quiz/QuizContainer";
import HeroVisual from "@/components/landing/HeroVisual";
import FloatingParticles from "@/components/landing/FloatingParticles";
import heroVideo from "@/assets/hero-video.mp4";
import { Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Full viewport */}
      <Section variant="gradient" spacing="xl" className="relative overflow-hidden min-h-screen flex items-center">
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
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl z-[1]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-secondary/10 via-transparent to-transparent blur-3xl z-[1]" />

        <Container size="full" className="relative z-10 py-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Copy + Quiz */}
            <div className="space-y-8 animate-fade-in">
              <Badge variant="glow" className="inline-flex">
                <Zap className="w-3 h-3 mr-1" />
                Free 7-Day Challenge
              </Badge>

              <div className="space-y-4">
                <h1 className="text-glow-primary">
                  Build Your First App in 7 Days
                </h1>
                <p className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
                  No Coding Required
                </p>
              </div>

              <p className="text-lg text-muted-foreground max-w-xl">
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
      </Section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background-secondary">
        <Container size="wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-display font-bold">Appreneur</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Appreneur Challenge. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Index;
