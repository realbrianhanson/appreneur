import { Button } from "@/components/ui/button";
import { 
  GlowCard, 
  GlowCardHeader, 
  GlowCardTitle, 
  GlowCardDescription,
  GlowCardContent 
} from "@/components/ui/GlowCard";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Rocket, Zap, Code, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Section variant="gradient" spacing="xl" className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-glow-primary opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl" />
        
        <Container size="default" className="relative z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <Badge variant="glow" className="mx-auto">
              <Zap className="w-3 h-3 mr-1" />
              7-Day Challenge
            </Badge>
            
            <h1 className="text-glow-primary">
              Build Your First App in 7 Days
              <span className="block text-gradient-primary mt-2">
                No Coding Required
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've launched their dream apps 
              without writing a single line of code. The Appreneur Challenge 
              shows you exactly how.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="cta" size="xl">
                <Rocket className="w-5 h-5" />
                Start the Challenge
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              <span className="text-secondary font-semibold">2,847</span> entrepreneurs enrolled this week
            </p>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section variant="muted" spacing="lg">
        <Container size="wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">
              What You'll <span className="text-gradient-primary">Build</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              In just 7 days, you'll go from idea to a fully functional app
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <GlowCard glowColor="primary" className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <GlowCardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <GlowCardTitle>No-Code Tools</GlowCardTitle>
                <GlowCardDescription>
                  Master the latest no-code platforms to build professional apps
                </GlowCardDescription>
              </GlowCardHeader>
              <GlowCardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Drag-and-drop builders
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Database integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    User authentication
                  </li>
                </ul>
              </GlowCardContent>
            </GlowCard>

            <GlowCard glowColor="secondary" className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <GlowCardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-secondary" />
                </div>
                <GlowCardTitle>AI-Powered</GlowCardTitle>
                <GlowCardDescription>
                  Leverage AI to accelerate your development process
                </GlowCardDescription>
              </GlowCardHeader>
              <GlowCardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    AI code generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Smart suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    Automated testing
                  </li>
                </ul>
              </GlowCardContent>
            </GlowCard>

            <GlowCard glowColor="accent" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <GlowCardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <GlowCardTitle>Community</GlowCardTitle>
                <GlowCardDescription>
                  Join a thriving community of like-minded builders
                </GlowCardDescription>
              </GlowCardHeader>
              <GlowCardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Daily accountability
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Expert mentorship
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    Lifetime access
                  </li>
                </ul>
              </GlowCardContent>
            </GlowCard>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="default" spacing="lg">
        <Container size="tight">
          <GlowCard glowColor="secondary" className="text-center p-8 md:p-12">
            <Badge variant="success" className="mx-auto mb-6">
              Limited Time Offer
            </Badge>
            <h2 className="mb-4">
              Ready to Build Your App?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join the next cohort of the Appreneur Challenge and transform 
              your idea into a real, working application.
            </p>
            <Button variant="cta" size="xl" className="w-full sm:w-auto">
              <Rocket className="w-5 h-5" />
              Join the Challenge — $47
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              30-day money-back guarantee • Instant access
            </p>
          </GlowCard>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <Container size="wide">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Appreneur Challenge. All rights reserved.
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
