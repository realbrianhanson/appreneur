import { useState, useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import CountdownTimer from "@/components/quiz/CountdownTimer";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView, trackRegistrationComplete } from "@/lib/analytics";
import { useNextCohort } from "@/hooks/useNextCohort";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  Download,
  Phone,
  Loader2,
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
  const { user } = useAuth();

  // Single source of truth for the cohort date across the funnel.
  const { targetDate: cohortStartDate, onExpire } = useNextCohort();

  // Phone-on-file check: only prompt when the account has no phone yet.
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [phoneLoaded, setPhoneLoaded] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    if (!user) {
      setPhoneLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();
      setProfilePhone(data?.phone ?? null);
      setPhoneLoaded(true);
    })();
  }, [user]);

  const handleSavePhone = async () => {
    if (!user) return;
    const cleaned = phoneInput.trim();
    if (cleaned.length < 7) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    setSavingPhone(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: cleaned })
      .eq("id", user.id);
    setSavingPhone(false);
    if (error) {
      toast.error("Couldn't save your number. Please try again.");
      return;
    }
    setProfilePhone(cleaned);
    toast.success("You're set. We'll text you when we go live.");
  };

  // Track page view and registration complete on mount.
  // Guard the conversion so it fires exactly once per registration — refreshes
  // or revisits must not re-count it.
  useEffect(() => {
    trackPageView('/thank-you', 'You\'re In! — Appreneur Challenge');
    try {
      const alreadyTracked = localStorage.getItem("registration_tracked") === "1";
      if (!alreadyTracked) {
        trackRegistrationComplete();
        localStorage.setItem("registration_tracked", "1");
      }
    } catch {
      trackRegistrationComplete();
    }
    // Clear the persisted VIP countdown so a later visit starts a fresh 15 minutes.
    try { localStorage.removeItem("vip_offer_expires_at"); } catch {}
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

  // Format helpers derived from the shared cohort date
  const ordinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const weekdayMonthDay = cohortStartDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hour12 = ((cohortStartDate.getHours() + 11) % 12) + 1;
  const ampm = cohortStartDate.getHours() >= 12 ? "pm" : "am";
  const cohortCopy = `The challenge starts ${weekdayMonthDay}${ordinalSuffix(
    cohortStartDate.getDate()
  )} at ${hour12}${ampm}`;

  // Compact UTC date string YYYYMMDDTHHMMSSZ for Google Calendar
  const toCalendarUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const cohortEnd = new Date(cohortStartDate.getTime() + 60 * 60 * 1000);
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "Appreneur Challenge Starts!"
  )}&dates=${toCalendarUtc(cohortStartDate)}/${toCalendarUtc(cohortEnd)}&details=${encodeURIComponent(
    "Your 5-day app building challenge begins! Head to appreneur.ai to get started."
  )}`;

  // Downloadable .ics file for Apple / Outlook / any calendar app.
  const handleDownloadIcs = () => {
    const dtStamp = toCalendarUtc(new Date());
    const dtStart = toCalendarUtc(cohortStartDate);
    const dtEnd = toCalendarUtc(cohortEnd);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Appreneur//Challenge//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:appreneur-cohort-${dtStart}@appreneur.ai`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      "SUMMARY:Appreneur Challenge Starts!",
      "DESCRIPTION:Your 5-day app building challenge begins. Head to https://appreneur.ai to get started.",
      "URL:https://appreneur.ai",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appreneur-challenge.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Head - noindex for funnel page */}
      <SEOHead 
        title="You're In: Appreneur Challenge"
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
                description={cohortCopy}
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
                        Google Calendar
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadIcs}>
                      <Download className="w-3 h-3 mr-1" />
                      Download .ics (Apple / Outlook)
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

          {/* SMS reminder opt-in (only when there's no phone on file) */}
          {phoneLoaded && user && !profilePhone && (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Get SMS reminders when we go live
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Reminders about your challenge only. Reply STOP anytime.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="+1 555 123 4567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="cta"
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                >
                  {savingPhone ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving
                    </>
                  ) : (
                    "Text me reminders"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Countdown */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
            <p className="text-muted-foreground mb-4">Challenge starts in:</p>
            <div className="flex justify-center">
              <CountdownTimer targetDate={cohortStartDate} onExpire={onExpire} />
            </div>
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
                Upgrade to VIP for $27
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
