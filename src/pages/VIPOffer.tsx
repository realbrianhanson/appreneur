import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
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
  <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
    <span className="text-muted-foreground line-through font-medium">${value}</span>
  </div>
);

const VIPOffer = () => {
  const [bumpOffer, setBumpOffer] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

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
    <div className="min-h-screen bg-background">
      {/* Urgent Top Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3">
        <Container size="wide">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 text-center">
            <p className="font-semibold">
              WAIT! Your registration is complete, but don't close this page...
            </p>
            <UrgentCountdown />
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="tight" className="py-12 md:py-16">
        <div className="space-y-10">
          {/* Headline */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Want to Build Your App{" "}
              <span className="text-gradient-primary">10X Faster?</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Upgrade to the Appreneur VIP Bundle for Just{" "}
              <span className="text-primary font-bold">$27</span>
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-card border border-border group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
              </div>
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
              Watch: Why VIPs finish faster and build better apps
            </p>
          </div>

          {/* The Stack */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-xl font-display font-bold text-foreground mb-6 text-center">
              Everything Included in Your VIP Bundle
            </h2>
            <div className="divide-y divide-border/50">
              {stackItems.map((item, index) => (
                <StackItem key={index} {...item} />
              ))}
            </div>

            {/* Total Value */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-muted-foreground">Total Value:</span>
                <span className="text-2xl font-bold text-muted-foreground line-through">
                  ${totalValue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">TODAY ONLY:</span>
                <span className="text-4xl font-display font-bold text-primary">$27</span>
              </div>
            </div>
          </div>

          {/* Guarantee Box */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  100% Money-Back Guarantee
                </h3>
                <p className="text-muted-foreground">
                  If you don't build your app faster with these resources, just email us for a
                  full refund. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            {/* Bump Offer */}
            <div
              className={`rounded-xl border-2 p-5 transition-colors cursor-pointer ${
                bumpOffer
                  ? "border-accent bg-accent/10"
                  : "border-dashed border-border hover:border-accent/50"
              }`}
              onClick={() => setBumpOffer(!bumpOffer)}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={bumpOffer}
                  onCheckedChange={(checked) => setBumpOffer(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    YES! Add the "Ship It" Launch Kit for just{" "}
                    <span className="text-accent">$7</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Includes: Pre-launch QA checklist, bug-testing template, and "First 100
                    Users" outreach scripts.{" "}
                    <span className="text-foreground font-medium">($47 value)</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="pl-11 h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Expiry Date</label>
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CVC</label>
                  <Input
                    type="text"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="default"
              size="xl"
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-14"
            >
              Complete My VIP Upgrade — ${bumpOffer ? "34" : "27"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4" />
                <span>Money-Back Guarantee</span>
              </div>
            </div>
          </div>

          {/* Skip Link */}
          <div className="text-center pt-4">
            <Link
              to="/downsell"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, I'll do it the slow way →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default VIPOffer;
