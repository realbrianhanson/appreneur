import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/lib/toast-utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  Share2,
  Twitter,
  Linkedin,
  Check,
  Trophy,
  Clock,
  FileText,
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
  Palette,
  Bug,
  Rocket,
  Award,
  Loader2,
} from "lucide-react";

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
      "#45B7D1",
      "#96CEB4",
    ];

    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

// Journey items
const journeyItems = [
  { day: 1, title: "Found winning idea", icon: <Lightbulb className="w-4 h-4" /> },
  { day: 2, title: "Created blueprint", icon: <PenTool className="w-4 h-4" /> },
  { day: 3, title: "Built core app", icon: <Code className="w-4 h-4" /> },
  { day: 4, title: "Added AI features", icon: <Sparkles className="w-4 h-4" /> },
  { day: 5, title: "SHIPPED!", icon: <Rocket className="w-4 h-4" /> },
];

const Graduation = () => {
  const { profile } = useAuth();
  const { progress, fetchProgress } = useProgress();
  const [showConfetti, setShowConfetti] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const userName = profile?.first_name || "Builder";
  const isVIP = profile?.is_vip || false;

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Get Day 5 completion date or fallback to today
  const day5Progress = progress.find(p => p.day_number === 5 && p.is_completed);
  const completionDate = day5Progress?.completed_at
    ? new Date(day7Progress.completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Stats
  const stats = {
    totalTime: "8h 45m",
    missionsCompleted: 5,
    resourcesDownloaded: 12,
  };

  // Event date (next Monday)
  const eventDate = "January 27, 2026";

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const shareText = encodeURIComponent(
    `I just completed the 7-Day Appreneur Challenge and built my first app! 🚀 #Appreneur #NoCode #AI`
  );
  const shareUrl = encodeURIComponent("https://appreneur.ai");

  const handleDownloadCertificate = useCallback(async () => {
    if (!certRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0a1a",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "in", format: "letter" });
      pdf.addImage(imgData, "PNG", 0, 0, 11, 8.5);
      pdf.save(`appreneur-certificate-${userName.toLowerCase()}.pdf`);
      showSuccess("Certificate downloaded!");
    } catch (err) {
      console.error("Certificate generation failed:", err);
      showError("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [userName]);

  return (
    <DashboardLayout userName={userName} currentDay={7} isVIP={isVIP}>
      {showConfetti && <Confetti />}

      {/* Hidden certificate render target for html2canvas */}
      <div
        ref={certRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: 1056,
          height: 816,
          backgroundColor: "#0a0a1a",
          fontFamily: "'Georgia', serif",
          color: "#e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer border */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "3px solid #c8a84e",
            borderRadius: 8,
          }}
        />
        {/* Inner border */}
        <div
          style={{
            position: "absolute",
            inset: 28,
            border: "1px solid #c8a84e55",
            borderRadius: 4,
          }}
        />
        <div style={{ textAlign: "center", padding: 60, zIndex: 1 }}>
          {/* Logo icon */}
          <div
            style={{
              width: 56,
              height: 56,
              margin: "0 auto 16px",
              borderRadius: "50%",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <p style={{ fontSize: 13, letterSpacing: 6, textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>
            Certificate of Completion
          </p>
          <h1 style={{ fontSize: 18, color: "#c8a84e", marginBottom: 32, fontWeight: 400, letterSpacing: 2 }}>
            The Appreneur Challenge
          </h1>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>This certifies that</p>
          <h2 style={{ fontSize: 42, fontWeight: 700, color: "#ffffff", marginBottom: 12 }}>{userName}</h2>
          <p style={{ fontSize: 16, color: "#cbd5e1", marginBottom: 32 }}>
            has successfully completed the 7-Day Appreneur Challenge
          </p>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 48 }}>{completionDate}</p>
          {/* Signature */}
          <div style={{ borderTop: "1px solid #334155", width: 240, margin: "0 auto", paddingTop: 12 }}>
            <p style={{ fontSize: 18, fontStyle: "italic", color: "#e2e8f0", marginBottom: 4 }}>Brian Hanson</p>
            <p style={{ fontSize: 12, color: "#64748b" }}>Founder, AI For Beginners</p>
          </div>
        </div>
      </div>

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
            You've completed the 7-Day Appreneur Challenge
          </p>
        </div>

        {/* Achievement Display / Certificate */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              {/* Certificate Design */}
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
                  <h2 className="text-3xl font-display font-bold text-foreground">
                    {userName}
                  </h2>
                  <p className="text-muted-foreground">
                    has successfully completed the
                  </p>
                  <p className="text-xl font-display font-bold text-primary">
                    7-Day Appreneur Challenge
                  </p>
                  <p className="text-sm text-muted-foreground">{completionDate}</p>

                  {/* Badge */}
                  <div className="pt-4">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                      <Trophy className="w-3 h-3 mr-2" />
                      Appreneur Graduate
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="lg" onClick={handleDownloadCertificate} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Download Certificate"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    Share on LinkedIn
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Share on Twitter
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
            <div className="grid md:grid-cols-7 gap-4">
              {journeyItems.map((item, index) => (
                <div
                  key={item.day}
                  className="flex flex-col items-center text-center space-y-2"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.day === 7
                        ? "bg-gradient-to-br from-primary to-accent text-white"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Day {item.day}</p>
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                  </div>
                  <Check className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.totalTime}
                </p>
                <p className="text-xs text-muted-foreground">Time Invested</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-accent" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.missionsCompleted}/7
                </p>
                <p className="text-xs text-muted-foreground">Missions Complete</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {stats.resourcesDownloaded}
                </p>
                <p className="text-xs text-muted-foreground">Resources Downloaded</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-card to-secondary/10 overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-2">
                What's Next
              </Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Your App is Live. Now Let's Build a Business.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                You've proven you can build. But an app without users is just a hobby.
                Join me at the <span className="text-foreground font-semibold">FREE 3-Day AI For Business</span> live 
                event where I'll show you how to turn your app into a real business.
              </p>

              {/* What you'll learn */}
              <div className="grid md:grid-cols-3 gap-4 py-6">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-medium text-foreground">Get Your First 100 Users</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <Zap className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="font-medium text-foreground">Monetize Your App</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <Sparkles className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="font-medium text-foreground">Scale with AI Automation</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {eventDate}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  11am - 3pm EST daily
                </span>
                <span className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Live, Virtual, Interactive
                </span>
              </div>

              <Button variant="cta" size="xl">
                Register for the 3-Day Event (FREE)
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* VIP Pitch (for non-VIP users) */}
        {!isVIP && (
          <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-card to-orange-500/5">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <Badge className="bg-yellow-500 text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Membership
                  </Badge>
                  <h2 className="text-2xl font-display font-bold text-foreground">
                    Want to Go Deeper?
                  </h2>
                  <p className="text-muted-foreground">
                    Join Pro and get continued access to advanced training, monthly templates, 
                    and live coaching calls.
                  </p>

                  <ul className="space-y-2">
                    {[
                      "Monthly app templates",
                      "Advanced training library",
                      "Private community access",
                      "Monthly live coaching calls",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-foreground">
                        <Check className="w-4 h-4 text-yellow-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center lg:text-right">
                  <p className="text-3xl font-display font-bold text-foreground mb-1">
                    $97<span className="text-lg text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Cancel anytime</p>
                  <Button
                    size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
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
