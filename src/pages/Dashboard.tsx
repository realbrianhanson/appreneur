import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TestimonialModal } from "@/components/dashboard/TestimonialModal";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { NotificationBanner } from "@/components/dashboard/NotificationBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showError } from "@/lib/toast-utils";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView } from "@/lib/analytics";
import { COMMUNITY_URL } from "@/lib/constants";
import {
  ArrowRight,
  Clock,
  Trophy,
  Zap,
  TrendingUp,
  Crown,
  ExternalLink,
  Bell,
  Calendar,
  Users,
  X,
} from "lucide-react";

interface UserStats {
  days_completed: number;
  streak: number;
  total_time_seconds: number;
  percentile: number;
  cohort_rank: number | null;
  cohort_size: number | null;
}

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  tasks_completed: Record<string, unknown>;
}

// Day titles/descriptions for the current mission card
const dayMeta: Record<number, { title: string; description: string }> = {
  1: { title: "Find Your Idea", description: "Use AI to discover and validate the perfect app idea that matches your skills and market opportunity." },
  2: { title: "Design Blueprint", description: "Create a visual map of your app — screens, features, and user flows — before building anything." },
  3: { title: "Build Core App", description: "Start building your app using AI-powered tools. By the end, you'll have a working prototype." },
  4: { title: "Add AI Magic", description: "Integrate AI capabilities — chatbots, content generation, and more — to make your app feel magical." },
  5: { title: "Ship It! 🚀", description: "Polish your app with professional styling, fix bugs, and deploy it live to the world." },
};

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { progress: hookProgress, stats: hookStats, isLoading, error: progressError, fetchProgress } = useProgress();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Testimonial modal state
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [hasShownTestimonialPrompt, setHasShownTestimonialPrompt] = useState(false);

  // Onboarding wizard state
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `onboarding_completed_${user.id}`;
      if (!localStorage.getItem(key)) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  // Track page view on mount
  useEffect(() => {
    trackPageView('/dashboard', 'Dashboard — Appreneur Challenge');
  }, []);

  // Fetch progress via edge function (auto-initializes for new users)
  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, fetchProgress]);

  // Map hook error to local state
  useEffect(() => {
    if (progressError) {
      setHasError(true);
      showError("Couldn't load your dashboard", {
        description: "We're having trouble loading your data.",
        onRetry: handleRetry,
      });
    }
  }, [progressError]);

  const handleRetry = () => {
    setIsRetrying(true);
    setHasError(false);
    fetchProgress().finally(() => setIsRetrying(false));
  };

  // Map hook data to component format
  const userProgress = hookProgress.map(p => ({
    day_number: p.day_number,
    is_unlocked: p.is_unlocked,
    is_completed: p.is_completed,
    tasks_completed: p.tasks_completed,
  }));

  const userStats = hookStats;

  // Calculate current day and progress
  const completedDays = userProgress.filter(p => p.is_completed).length;
  const currentDayProgress = userProgress.find(p => p.is_unlocked && !p.is_completed);
  const currentDay = currentDayProgress?.day_number || completedDays + 1;
  
  const progress = (completedDays / 5) * 100;
  const tasksCompleted = currentDayProgress ? Object.keys(currentDayProgress.tasks_completed).length : 0;
  const totalTasks = 4; // Default task count per day
  const currentMissionProgress = (tasksCompleted / totalTasks) * 100;

  const firstName = profile?.first_name || "Builder";
  const isVIP = profile?.is_vip || false;
  
  // Check if Day 5 is completed and show testimonial modal
  const day5Progress = userProgress.find(p => p.day_number === 5);
  const isDay5Completed = day5Progress?.is_completed || false;
  
  useEffect(() => {
    const checkTestimonialPrompt = async () => {
      if (!user || !isDay5Completed || hasShownTestimonialPrompt) return;
      
      // Check if user already submitted a testimonial
      const { data: existingTestimonial } = await supabase
        .from("testimonials")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // Check if user dismissed the prompt (stored in localStorage)
      const dismissedKey = `testimonial_dismissed_${user.id}`;
      const wasDismissed = localStorage.getItem(dismissedKey);
      
      if (!existingTestimonial && !wasDismissed) {
        setShowTestimonialModal(true);
      }
      setHasShownTestimonialPrompt(true);
    };
    
    checkTestimonialPrompt();
  }, [user, isDay5Completed, hasShownTestimonialPrompt]);
  
  const handleMaybeLater = () => {
    if (user) {
      localStorage.setItem(`testimonial_dismissed_${user.id}`, "true");
    }
    setShowTestimonialModal(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = [
    {
      label: "Streak",
      value: `${userStats?.streak || 0} days`,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      color: "text-orange-500",
    },
    {
      label: "Total Time",
      value: formatTime(userStats?.total_time_seconds || 0),
      icon: <Clock className="w-5 h-5 text-primary" />,
      color: "text-primary",
    },
    {
      label: "Progress",
      value: `${Math.round(progress)}%`,
      icon: <TrendingUp className="w-5 h-5 text-accent" />,
      color: "text-accent",
    },
    {
      label: "Rank",
      value: userStats?.percentile ? `Top ${Math.round(100 - userStats.percentile)}%` : "—",
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      color: "text-yellow-500",
    },
  ];

  const currentDayMeta = dayMeta[currentDay] || dayMeta[1];

  // Show skeleton loading state
  if (isLoading) {
    return (
      <DashboardLayout userName={firstName} currentDay={1} isVIP={isVIP} userProgress={[]}>
        <SEOHead 
          title="Dashboard — Appreneur Challenge"
          description="Track your progress in the Appreneur Challenge."
          noindex={true}
        />
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Show error state with retry
  if (hasError) {
    return (
      <DashboardLayout userName={firstName} currentDay={1} isVIP={isVIP} userProgress={[]}>
        <div className="max-w-md mx-auto mt-12">
          <EmptyState
            variant="error"
            title="Couldn't Load Dashboard"
            description="We're having trouble loading your progress. Please try again."
            actionLabel="Try Again"
            onAction={handleRetry}
            isRetrying={isRetrying}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Show empty state for new users
  if (userProgress.length === 0 && !isLoading) {
    return (
      <DashboardLayout userName={firstName} currentDay={1} isVIP={isVIP} userProgress={[]}>
        <div className="max-w-2xl mx-auto mt-12 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold">
              Welcome, {firstName}! 🎉
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to build your first app? Let's get started!
            </p>
          </div>
          <EmptyState
            variant="no-progress"
            title="Start Your First Mission!"
            description="You haven't started the challenge yet. Jump into Day 1 and build something amazing!"
            actionLabel="Begin Day 1"
            actionHref="/dashboard/day/1"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userName={firstName}
      currentDay={currentDay}
      isVIP={isVIP}
      userProgress={userProgress}
    >
      {/* SEO Head - noindex for authenticated page */}
      <SEOHead 
        title="Dashboard — Appreneur Challenge"
        description="Track your progress in the Appreneur Challenge."
        noindex={true}
      />
      
      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard
          firstName={firstName}
          onComplete={() => {
            if (user) {
              localStorage.setItem(`onboarding_completed_${user.id}`, "true");
            }
            setShowOnboarding(false);
          }}
        />
      )}

      {/* Testimonial Modal */}
      <TestimonialModal
        isOpen={showTestimonialModal}
        onClose={() => setShowTestimonialModal(false)}
        onMaybeLater={handleMaybeLater}
      />
      {/* Notification Banner */}
      <NotificationBanner userProgress={userProgress} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Announcement Banner */}
        {showAnnouncement && (
          <div className="relative rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 border border-primary/30 p-4">
            <button
              onClick={() => setShowAnnouncement(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4 pr-8">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  🎉 Live Q&A Session Tomorrow at 2pm EST!
                </p>
                <p className="text-sm text-muted-foreground">
                  Join Brian for a live coaching call. Bring your questions!
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                You're making great progress. Let's keep building!
              </p>
            </div>
          </div>

          {/* Status Card */}
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-primary border-primary">
                    Day {currentDay} of 5
                  </Badge>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-foreground">
                      {completedDays} missions completed
                    </span>
                    <span className="text-muted-foreground">
                      • {5 - completedDays} to go
                    </span>
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Mission Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary text-primary-foreground">
                    Current Mission
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    60-90 min
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Day {currentDay}: {currentDayMeta.title}
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  {currentDayMeta.description}
                </p>

                {/* Task Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Task Progress</span>
                    <span className="font-medium text-foreground">
                      {tasksCompleted} of {totalTasks} tasks
                    </span>
                  </div>
                  <Progress value={currentMissionProgress} className="h-2" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="cta" size="lg" asChild>
                  <Link to={`/dashboard/day/${currentDay}`}>
                    Continue Mission
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:border-border/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-lg font-bold font-display ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Challenge Progress Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                Your Journey
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((day) => {
                  const dayProgress = userProgress.find(p => p.day_number === day);
                  const isCompleted = dayProgress?.is_completed;
                  const isUnlocked = dayProgress?.is_unlocked;
                  const isCurrent = day === currentDay;
                  
                  return (
                    <Link
                      key={day}
                      to={isUnlocked ? `/dashboard/day/${day}` : "#"}
                      onClick={(e) => !isUnlocked && e.preventDefault()}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isCompleted
                          ? "bg-primary/10 border-primary/30 hover:border-primary"
                          : isCurrent
                          ? "bg-secondary/10 border-secondary/30 hover:border-secondary"
                          : "bg-muted/30 border-border opacity-50"
                      }`}
                    >
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Day {day}</div>
                      <div className="text-lg">
                        {isCompleted ? "✅" : isCurrent ? "🔥" : "🔒"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 truncate">
                        {dayMeta[day]?.title}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Motivation Card */}
            <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Keep going!</p>
                <p className="text-xs text-muted-foreground">
                  {userStats?.percentile 
                    ? `You're ahead of ${Math.round(userStats.percentile)}% of participants.`
                    : "You're making great progress!"
                  } Day 5 is closer than you think! 🚀
                </p>
              </CardContent>
            </Card>

            {/* Community Card */}
            <Card className="border-primary/30">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Join the Community</p>
                    <p className="text-xs text-muted-foreground">
                      Connect with other Appreneurs, share your progress, and get help
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs mb-3">500+ members</Badge>
                <Button
                  variant="outline"
                  className="w-full"
                  size="sm"
                  onClick={() => window.open(COMMUNITY_URL, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Community
                </Button>
              </CardContent>
            </Card>

            {/* VIP Upgrade */}
            {!isVIP && (
              <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Upgrade to VIP</p>
                      <p className="text-xs text-muted-foreground">
                        Get advanced prompts, templates, and 1-on-1 support
                      </p>
                    </div>
                  </div>
                  <Button variant="cta" className="w-full" size="sm" asChild>
                    <Link to="/vip-offer">
                      <Crown className="w-4 h-4 mr-2" />
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
