import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView } from "@/lib/analytics";
import {
  COMMUNITY_URL,
  COMMUNITY_NAME,
  hasValidCommunityUrl,
} from "@/lib/constants";
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Home,
} from "lucide-react";
import { toast } from "sonner";

// Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    delay: number;
    duration: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--secondary))",
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
    ];

    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Step Component
interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const Step = ({ number, icon, title, description, action }: StepProps) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
        {number}
      </div>
      {number < 3 && <div className="w-0.5 h-full bg-border mt-2" />}
    </div>
    <div className="pb-8 last:pb-0">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground mb-3">{description}</p>
      {action}
    </div>
  </div>
);

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const firstName = searchParams.get("name") || "there";
  const [showConfetti, setShowConfetti] = useState(true);
  const showCommunity = hasValidCommunityUrl();

  // Track page view only. Registration analytics fire once in QuizContainer
  // and AuthCallback so we don't re-count here on refresh/revisit.
  useEffect(() => {
    trackPageView('/thank-you', "You're In! — Appreneur Challenge");
  }, []);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const shareText = encodeURIComponent(
    "I just signed up for the Appreneur Challenge, building my first app in 5 days! 🚀 Join me:"
  );
  const shareUrl = encodeURIComponent("https://appreneur.ai");
  const prewrittenShareMessage =
    "I just signed up for the Appreneur Challenge, building my first app in 5 days. Join me: https://appreneur.ai";

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://appreneur.ai");
    toast.success("Link copied to clipboard!");
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(prewrittenShareMessage);
    toast.success("Invite copied. Send it to a friend.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="You're In — Start Day 1 of the Appreneur Challenge"
        description="Your free account is ready. Open Day 1 and start building your first version."
        noindex={true}
      />
      
      {showConfetti && <Confetti />}

      <Container size="tight" className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              You're in! 🎉
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome,{" "}
              <span className="text-primary font-semibold">{firstName}</span>
            </p>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Your free account is set up and Day 1 is ready to go. Jump in
              whenever you're ready to start building.
            </p>
          </div>

          {/* Primary + secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="cta" size="lg" asChild className="gap-2">
              <Link to="/dashboard/day/1">
                Start Day 1
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to home
              </Link>
            </Button>
          </div>

          {/* Refer-a-friend / Share Section */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2 text-center">
              Know someone who should build an app?
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Doing this with a friend doubles your odds of shipping. Send them your invite:
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="lg"
                asChild
                className="gap-2"
              >
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="gap-2"
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="gap-2"
              >
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleCopyLink}
              >
                <Link2 className="w-4 h-4" />
                Copy Link
              </Button>

              <Button
                variant="cta"
                size="lg"
                className="gap-2"
                onClick={handleCopyInvite}
              >
                <Link2 className="w-4 h-4" />
                Copy invite message
              </Button>
            </div>
          </div>

          {showCommunity && (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Join the {COMMUNITY_NAME}
              </h2>
              <p className="text-muted-foreground mb-4">
                Meet other builders working through the challenge.
              </p>
              <Button variant="outline" asChild className="gap-2">
                <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
                  Open community
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default ThankYou;
