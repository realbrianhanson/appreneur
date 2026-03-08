import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView, trackVIPOfferView } from "@/lib/analytics";
import {
  Play,
  Check,
  Shield,
  Lock,
  CreditCard,
  ArrowRight,
  Clock,
  BookOpen,
  Layout,
  FileText,
  Sparkles,
  Video,
  Archive,
  GraduationCap,
  Users,
} from "lucide-react";

// Countdown Timer Component
const UrgentCountdown = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5" />
      <span className="font-mono text-xl font-bold">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

// Stack Item Component
interface StackItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  value: number;
}

const StackItem = ({ icon, title, description, value }: StackItemProps) => (
  <div className="flex items-center justify-between py-3 md:py-4 border-b border-border/50 last:border-0 gap-3">
    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground text-sm md:text-base truncate">{title}</p>
        {description && <p className="text-xs md:text-sm text-muted-foreground truncate">{description}</p>}
      </div>
    </div>
    <span className="text-muted-foreground line-through font-medium text-sm md:text-base shrink-0">${value}</span>
  </div>
);

const VIPOffer = () => {
  const [bumpOffer, setBumpOffer] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Track page view and VIP offer view on mount
  useEffect(() => {
    trackPageView('/vip-offer', 'VIP Offer — Appreneur Challenge');
    trackVIPOfferView();
  }, []);

  const stackItems: StackItemProps[] = [
    {
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      title: "The Appreneur's Playbook",
      description: "Complete App Building Book",
      value: 47,
    },
    {
      icon: <Layout className="w-5 h-5 text-accent" />,
      title: "Done-For-You App Template",
      description: "Pre-built Lovable template",
      value: 97,
    },
    {
      icon: <FileText className="w-5 h-5 text-secondary" />,
      title: "The Prompt Framework Vault",
      description: "47 copy-paste prompts",
      value: 67,
    },
    {
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      title: "AI App Idea Validator Tool",
      value: 27,
    },
    {
      icon: <Video className="w-5 h-5 text-accent" />,
      title: "VIP Access: 3-Day AI For Business Event",
      value: 47,
    },
    {
      icon: <Archive className="w-5 h-5 text-secondary" />,
      title: "Lifetime Event Recordings",
      value: 97,
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-primary" />,
      title: "AI For Business Training Vault",
      description: "$297 value course library",
      value: 297,
    },
    {
      icon: <Users className="w-5 h-5 text-accent" />,
      title: "3 Bonus Private Group Sessions",
      value: 147,
    },
  ];

  const totalValue = stackItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* SEO Head - noindex for funnel page */}
      <SEOHead 
        title="VIP Upgrade — Appreneur Challenge"
        description="Get the complete VIP toolkit for the Appreneur Challenge."
        noindex={true}
      />

      {/* Urgent Top Bar - sticky on all devices */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 md:py-3">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
            <p className="font-semibold text-sm sm:text-base">
              WAIT! Don't close this page...
            </p>
            <UrgentCountdown />
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="tight" className="py-6 md:py-16 px-4 md:px-6">
        <div className="space-y-6 md:space-y-10">
          {/* Headline */}
          <div className="text-center space-y-2 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-foreground">
              Want to Build Your App{" "}
              <span className="text-gradient-primary">10X Faster?</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Upgrade to the Appreneur VIP Bundle for Just{" "}
              <span className="text-primary font-bold">$27</span>
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-card border border-border group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary ml-1" fill="currentColor" />
              </div>
            </div>
            <p className="absolute bottom-2 md:bottom-4 left-0 right-0 text-center text-xs sm:text-sm text-muted-foreground px-2">
              Watch: Why VIPs finish faster and build better apps
            </p>
          </div>

          {/* The Stack */}
          <div className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-8">
            <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-4 md:mb-6 text-center">
              Everything Included in Your VIP Bundle
            </h2>
            <div className="divide-y divide-border/50">
              {stackItems.map((item, index) => (
                <StackItem key={index} {...item} />
              ))}
            </div>

            {/* Total Value */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base md:text-lg font-semibold text-muted-foreground">Total Value:</span>
                <span className="text-xl md:text-2xl font-bold text-muted-foreground line-through">
                  ${totalValue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg md:text-xl font-bold text-foreground">TODAY ONLY:</span>
                <span className="text-3xl md:text-4xl font-display font-bold text-primary">$27</span>
              </div>
            </div>
          </div>

          {/* Guarantee Box */}
          <div className="rounded-xl md:rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 md:p-8">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-1 md:mb-2">
                  100% Money-Back Guarantee
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  If you don't build your app faster with these resources, just email us for a
                  full refund. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-8 space-y-4 md:space-y-6">
            {/* Bump Offer */}
            <div
              className={`rounded-lg md:rounded-xl border-2 p-3 md:p-5 transition-colors cursor-pointer ${
                bumpOffer
                  ? "border-accent bg-accent/10"
                  : "border-dashed border-border hover:border-accent/50"
              }`}
              onClick={() => setBumpOffer(!bumpOffer)}
            >
              <div className="flex items-start gap-3 md:gap-4">
                <Checkbox
                  checked={bumpOffer}
                  onCheckedChange={(checked) => setBumpOffer(checked as boolean)}
                  className="mt-0.5 md:mt-1"
                />
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm md:text-base">
                    YES! Add the "Ship It" Launch Kit for just{" "}
                    <span className="text-accent">$7</span>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Includes: Pre-launch QA checklist, bug-testing template, and "First 100
                    Users" outreach scripts.{" "}
                    <span className="text-foreground font-medium">($47 value)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="pl-11 h-12 text-base"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expiry Date</label>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="h-12 text-base"
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CVC</label>
                  <Input
                    type="text"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="h-12 text-base"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button - Hidden on mobile, shown in sticky bar */}
            <Button
              variant="default"
              size="xl"
              disabled
              className="w-full bg-green-600 text-white text-base md:text-lg h-12 md:h-14 hidden md:flex opacity-50 cursor-not-allowed"
            >
              Coming Soon
            </Button>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-2 md:pt-4">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Lock className="w-3 h-3 md:w-4 md:h-4" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Shield className="w-3 h-3 md:w-4 md:h-4" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Check className="w-3 h-3 md:w-4 md:h-4" />
                <span>Money-Back</span>
              </div>
            </div>
          </div>

          {/* Skip Link */}
          <div className="text-center pt-2 md:pt-4 pb-4">
            <Link
              to="/downsell"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, I'll do it the slow way →
            </Link>
          </div>
        </div>
      </Container>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4 md:hidden">
        <Button
          variant="default"
          size="xl"
          className="w-full bg-green-600 hover:bg-green-700 text-white text-base h-12"
        >
          Complete My VIP Upgrade — ${bumpOffer ? "34" : "27"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default VIPOffer;
