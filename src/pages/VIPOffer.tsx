import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { VIP_SALES_ENABLED } from "@/lib/constants";
import { PrelaunchSalesPlaceholder } from "@/components/PrelaunchSalesPlaceholder";
import { trackPageView } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getStoredTrackingParams } from "@/hooks/useTrackingParams";
import { toast } from "sonner";
import {
  Play,
  Check,
  Shield,
  Lock,
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
  Loader2,
} from "lucide-react";

const VIP_EXPIRES_KEY = "vip_offer_expires_at";

// Countdown Timer that persists across refreshes and, when it expires,
// redirects the visitor to the downsell.
const UrgentCountdown = ({ onExpire }: { onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(VIP_EXPIRES_KEY);
      const now = Date.now();
      if (stored) {
        const expiresAt = parseInt(stored, 10);
        if (!Number.isNaN(expiresAt)) {
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          if (remaining > 0) return remaining;
        }
      }
      const expiresAt = now + 15 * 60 * 1000;
      localStorage.setItem(VIP_EXPIRES_KEY, String(expiresAt));
      return 15 * 60;
    } catch {
      return 15 * 60;
    }
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bumpOffer, setBumpOffer] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // While VIP sales are disabled, render the honest placeholder BEFORE any
  // page-view / funnel_events tracking fires. This avoids counting placeholder
  // impressions as "OTO viewed".
  if (!VIP_SALES_ENABLED) {
    return <PrelaunchSalesPlaceholder page="vip-offer" />;
  }

  // Track page view on mount (sales-enabled path only).
  useEffect(() => {
    trackPageView('/vip-offer', 'VIP Offer — Appreneur Challenge');
    // Log the OTO view into funnel_events so the admin funnel dashboard can
    // report OTO view → purchase conversion.
    (async () => {
      try {
        const trackingParams = getStoredTrackingParams();
        const sessionId =
          sessionStorage.getItem("session_id") || crypto.randomUUID();
        sessionStorage.setItem("session_id", sessionId);
        await supabase.from("funnel_events").insert({
          session_id: sessionId,
          user_id: user?.id ?? null,
          event_type: "vip_offer_viewed",
          event_data: {},
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          fb_ad_id: trackingParams.fb_ad_id,
        });
      } catch (err) {
        console.error("vip_offer_viewed track error", err);
      }
    })();
    // We intentionally only run this once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExpire = () => {
    try { localStorage.removeItem(VIP_EXPIRES_KEY); } catch {}
    navigate("/downsell", { replace: true });
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          product: "vip",
          include_bump: bumpOffer,
          email: user?.email,
        },
      });
      if (error) {
        toast.error(error.message || "Could not start checkout");
        setIsCheckingOut(false);
        return;
      }
      if (!data?.url) {
        toast.error("Checkout isn't available right now");
        setIsCheckingOut(false);
        return;
      }
      window.location.href = data.url as string;
    } catch (err) {
      console.error("Checkout error", err);
      toast.error("Checkout isn't available right now");
      setIsCheckingOut(false);
    }
  };

  const totalCents = 2700 + (bumpOffer ? 700 : 0);
  const ctaLabel = isCheckingOut
    ? "Redirecting…"
    : `Get instant access — $${(totalCents / 100).toFixed(0)}`;

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
      title: "VIP Upgrade: 3-Day AI For Business Live (priority access + front-row Q&A)",
      value: 297,
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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-700 to-red-800 text-white py-2 md:py-3">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
            <p className="font-semibold text-sm sm:text-base">
              WAIT! Don't close this page...
            </p>
            <UrgentCountdown onExpire={handleExpire} />
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container size="tight" className="py-6 md:py-16 px-4 md:px-6">
        <div className="space-y-6 md:space-y-10">
          {/* Headline */}
          <div className="text-center space-y-2 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-foreground">
              Want a Serious{" "}
              <span className="text-gradient-primary">Head Start?</span>
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

            {/* CTA Button - Desktop */}
            <Button
              variant="default"
              size="xl"
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-110 text-background text-base md:text-lg h-12 md:h-14 hidden md:flex font-semibold shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)]"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Redirecting…
                </>
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
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
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-110 text-background text-base h-12 font-semibold"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Redirecting…
            </>
          ) : (
            <>{ctaLabel}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default VIPOffer;
