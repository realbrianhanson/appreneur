import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import CountdownTimer from "@/components/quiz/CountdownTimer";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView, trackRegistrationComplete } from "@/lib/analytics";
import {
  Mail,
  Calendar,
  Users,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
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

  // Cohort start date
  const cohortStartDate = new Date("2026-01-20T10:00:00-05:00"); // 10am EST

  // Track page view and registration complete on mount
  useEffect(() => {
    trackPageView('/thank-you', 'You\'re In! — Appreneur Challenge');
    trackRegistrationComplete();
  }, []);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const shareText = encodeURIComponent(
    "I just signed up for the Appreneur Challenge — building my first app in 5 days! 🚀 Join me:"
  );
  const shareUrl = encodeURIComponent("https://appreneur.ai");

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://appreneur.ai");
    toast.success("Link copied to clipboard!");
  };

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "Appreneur Challenge Starts!"
  )}&dates=20260120T150000Z/20260120T160000Z&details=${encodeURIComponent(
    "Your 5-day app building challenge begins! Head to appreneur.ai to get started."
  )}`;

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Head - noindex for funnel page */}
      <SEOHead 
        title="You're In! — Appreneur Challenge"
        description="Welcome to the Appreneur Challenge. Your journey to building your first app starts here."
        noindex={true}
      />
      
      {showConfetti && <Confetti />}

      <Container size="tight" className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              You're In! 🎉
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to the Appreneur Challenge,{" "}
              <span className="text-primary font-semibold">{firstName}</span>
            </p>
          </div>

          {/* Next Steps Box */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Here's what happens next:
            </h2>

            <div className="space-y-0">
              <Step
                number={1}
                icon={<Mail className="w-4 h-4 text-primary" />}
                title="Check your email"
                description="Your '50 Profitable AI App Ideas' PDF is on its way. Check your inbox (and spam folder, just in case)."
                action={
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Check className="w-4 h-4" />
                    <span>Sent to your email</span>
                  </div>
                }
              />

              <Step
                number={2}
                icon={<Calendar className="w-4 h-4 text-accent" />}
                title="Mark your calendar"
                description="The challenge starts Monday, January 20th at 10am EST"
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                        Google
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      Apple
                    </Button>
                    <Button variant="outline" size="sm">
                      Outlook
                    </Button>
                  </div>
                }
              />

              <Step
                number={3}
                icon={<Users className="w-4 h-4 text-secondary" />}
                title="Join the community"
                description="Get access to our private community where you'll connect with fellow builders"
                action={
                  <Button variant="secondary" size="sm">
                    Join Community
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                }
              />
            </div>
          </div>

          {/* Countdown */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
            <p className="text-muted-foreground mb-4">Challenge starts in:</p>
            <div className="flex justify-center">
              <CountdownTimer targetDate={cohortStartDate} />
            </div>
          </div>

          {/* Share Section */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2 text-center">
              Know someone who should build an app?
            </h2>
            <p className="text-muted-foreground text-center mb-6">
              Share this challenge with them:
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
            </div>
          </div>

          {/* VIP Upgrade CTA */}
          <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 to-secondary/10 p-6 md:p-8 text-center">
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Want to build faster?
            </h2>
            <p className="text-muted-foreground mb-6">
              Upgrade to VIP and get the complete toolkit for just $27
            </p>
            <Button variant="cta" size="lg" asChild>
              <Link to="/vip-offer">
                Upgrade to VIP — $27
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ThankYou;
