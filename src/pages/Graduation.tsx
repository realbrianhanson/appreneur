import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Twitter,
  Linkedin,
  Check,
  Trophy,
  Clock,
  Calendar,
  Zap,
  Users,
  Video,
  MessageCircle,
  Crown,
  ArrowRight,
  Lightbulb,
  PenTool,
  Code,
  Sparkles,
  Rocket,
  Award,
} from "lucide-react";
import jsPDF from "jspdf";
import { showSuccess, showError } from "@/lib/toast-utils";

// Confetti Component
const Confetti = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      x: number;
      delay: number;
      duration: number;
      color: string;
      size: number;
    }>
  >([]);

  useEffect(() => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--secondary))",
      "#FFD700",
      "#FF6B6B",
      "#4ECDC4",
    ];
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-confetti"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const journeyItems = [
  { day: 1, title: "Found winning idea", icon: Lightbulb },
  { day: 2, title: "Created blueprint", icon: PenTool },
  { day: 3, title: "Built core app", icon: Code },
  { day: 4, title: "Added AI features", icon: Sparkles },
  { day: 5, title: "SHIPPED!", icon: Rocket },
];

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const Graduation = () => {
  const { profile } = useAuth();
  const { progress, stats, fetchProgress } = useProgress();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const userName = profile?.first_name || "Builder";
  const isVIP = profile?.is_vip || false;

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const completionDate = useMemo(() => {
    const day5 = progress.find((p) => p.day_number === 5 && p.is_completed);
    const d = day5?.completed_at ? new Date(day5.completed_at) : new Date();
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }, [progress]);

  const totalTime = useMemo(() => {
    return formatTime(stats?.total_time_seconds ?? 0);
  }, [stats]);

  const daysCompleted = stats?.days_completed ?? progress.filter((p) => p.is_completed).length;

  const shareText = encodeURIComponent(
    "I just completed the 5-Day Appreneur Challenge and built my first app! 🚀 #Appreneur #NoCode #AI"
  );
  const shareUrl = encodeURIComponent("https://appreneur.ai");

  const handleDownloadCertificate = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: "letter" });
      const w = 11;
      const h = 8.5;

      // Background
      pdf.setFillColor(10, 10, 26);
      pdf.rect(0, 0, w, h, "F");

      // Gold border
      pdf.setDrawColor(200, 168, 78);
      pdf.setLineWidth(0.03);
      pdf.rect(0.3, 0.3, w - 0.6, h - 0.6);
      pdf.setLineWidth(0.01);
      pdf.rect(0.5, 0.5, w - 1, h - 1);

      // Title
      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(11);
      pdf.text("CERTIFICATE OF COMPLETION", w / 2, 2.2, { align: "center" });

      pdf.setTextColor(200, 168, 78);
      pdf.setFontSize(16);
      pdf.text("The Appreneur Challenge", w / 2, 2.8, { align: "center" });

      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(12);
      pdf.text("This certifies that", w / 2, 3.5, { align: "center" });

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text(userName, w / 2, 4.4, { align: "center" });

      pdf.setTextColor(203, 213, 225);
      pdf.setFontSize(14);
      pdf.text("has successfully completed the 5-Day Appreneur Challenge", w / 2, 5.1, { align: "center" });

      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(12);
      pdf.text(completionDate, w / 2, 5.7, { align: "center" });

      // Signature line
      pdf.setDrawColor(51, 65, 85);
      pdf.setLineWidth(0.01);
      pdf.line(w / 2 - 1.2, 6.8, w / 2 + 1.2, 6.8);

      pdf.setTextColor(226, 232, 240);
      pdf.setFontSize(16);
      pdf.text("Brian Hanson", w / 2, 7.1, { align: "center" });

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(10);
      pdf.text("Founder, AI For Beginners", w / 2, 7.4, { align: "center" });

      pdf.save(`appreneur-certificate-${userName.toLowerCase()}.pdf`);
      showSuccess("Certificate downloaded!");
    } catch {
      showError("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout userName={userName} currentDay={5} isVIP={isVIP} userProgress={progress}>
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Celebration Header */}
        <div className="text-center space-y-4 py-8">
          <div className="text-6xl md:text-8xl mb-4">🎉</div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
            YOU DID IT!
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Congratulations, <span className="text-primary font-semibold">{userName}</span>!
          </p>
          <p className="text-lg text-muted-foreground">
            You've completed the 5-Day Appreneur Challenge
          </p>
        </div>

        {/* Certificate Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="relative mx-auto max-w-lg p-8 rounded-2xl border-2 border-primary/20 bg-card">
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/40" />
                <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/40" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/40" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/40" />

                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Certificate of Completion
                  </p>
                  <h2 className="text-3xl font-display font-bold text-foreground">{userName}</h2>
                  <p className="text-muted-foreground">has successfully completed the</p>
                  <p className="text-xl font-display font-bold text-primary">5-Day Appreneur Challenge</p>
                  <p className="text-sm text-muted-foreground">{completionDate}</p>
                  <div className="pt-4">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-1">
                      <Trophy className="w-3 h-3 mr-2" />
                      Appreneur Graduate
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="lg" onClick={handleDownloadCertificate} disabled={isGenerating}>
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Download Certificate"}
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Journey Recap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">Your Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {journeyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.day} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        item.day === 5
                          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                          : "bg-primary/20 text-primary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Day {item.day}</p>
                      <p className="text-xs md:text-sm font-medium text-foreground">{item.title}</p>
                    </div>
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                );
              })}
            </div>

            {/* Real Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-foreground">{totalTime}</p>
                <p className="text-xs text-muted-foreground">Time Invested</p>
              </div>
              <div className="text-center">
                <Trophy className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-foreground">{daysCompleted}/5</p>
                <p className="text-xs text-muted-foreground">Missions Complete</p>
              </div>
              <div className="text-center">
                <Zap className="w-4 h-4 text-secondary mx-auto mb-1" />
                <p className="text-2xl font-display font-bold text-foreground">{stats?.streak ?? 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next — Event CTA */}
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-card to-secondary/10 overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="text-center space-y-6">
              <Badge variant="secondary">What's Next</Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Your App is Live. Now Let's Build a Business.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                You've proven you can build. Join me at the{" "}
                <span className="text-foreground font-semibold">FREE 3-Day AI For Business</span> live event
                where I'll show you how to turn your app into a real business.
              </p>

              <div className="grid md:grid-cols-3 gap-4 py-6">
                {[
                  { icon: Users, label: "Get Your First 100 Users" },
                  { icon: Zap, label: "Monetize Your App" },
                  { icon: Sparkles, label: "Scale with AI Automation" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="p-4 rounded-xl bg-card border border-border">
                    <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="font-medium text-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> January 27, 2026
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> 11am - 3pm EST daily
                </span>
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4" /> Live & Interactive
                </span>
              </div>

              <Button variant="cta" size="xl">
                Register for the 3-Day Event (FREE)
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* VIP Pitch (non-VIP only) */}
        {!isVIP && (
          <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 via-card to-primary/5">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <Badge className="bg-secondary text-secondary-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Membership
                  </Badge>
                  <h2 className="text-2xl font-display font-bold text-foreground">Want to Go Deeper?</h2>
                  <p className="text-muted-foreground">
                    Join Pro for continued access to advanced training, monthly templates, and live coaching.
                  </p>
                  <ul className="space-y-2">
                    {["Monthly app templates", "Advanced training library", "Private community access", "Monthly live coaching calls"].map(
                      (f) => (
                        <li key={f} className="flex items-center gap-2 text-foreground">
                          <Check className="w-4 h-4 text-secondary" />
                          {f}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="text-center lg:text-right">
                  <p className="text-3xl font-display font-bold text-foreground mb-1">
                    $97<span className="text-lg text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Cancel anytime</p>
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    <Crown className="w-4 h-4 mr-2" />
                    Join Pro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community CTA */}
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Share Your Launch!</p>
                <p className="text-sm text-muted-foreground">
                  Post your app in the community and celebrate with fellow graduates 🎉
                </p>
              </div>
            </div>
            <Button variant="secondary">
              Post in Community
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Graduation;
