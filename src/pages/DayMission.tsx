import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { COMMUNITY_URL } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useProgress } from "@/hooks/useProgress";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import DayCompleteCelebration from "@/components/dashboard/DayCompleteCelebration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MissionSkeleton } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { showSuccess, showError, showInfo } from "@/lib/toast-utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Clock,
  Play,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Crown,
  FileText,
  Video,
  Code,
  Sparkles,
  Loader2,
} from "lucide-react";

// Task ID mapping to match database schema
const taskIdMap: Record<number, Record<string, string>> = {
  1: { video: "watch_video", exercise: "define_idea", validate: "create_wireframe", share: "share_community" },
  2: { video: "watch_video", wireframe: "setup_project", userflow: "build_layout", bonus: "add_navigation" },
  3: { video: "watch_video", build: "add_features", features: "connect_data", share: "test_app", bonus: "test_app" },
  4: { video: "watch_video", integrate: "add_ai_feature", test: "refine_prompts", optimize: "integrate_ai" },
  5: { video: "watch_video", deploy: "deploy_app", share: "launch_app", celebrate: "share_success" },
};

// Day data - would come from database in real app
const dayData: Record<number, {
  title: string;
  estimatedTime: string;
  videoTitle: string;
  videoLength: string;
  videoUrl: string;
  missionDescription: string;
  outcomes: string[];
  resources: Array<{
    title: string;
    type: "download" | "link" | "video";
    icon: React.ReactNode;
    url: string;
    storageKey?: string;
    vipOnly?: boolean;
  }>;
  checklist: Array<{
    id: string;
    label: string;
    required: boolean;
  }>;
  nextDayPreview: string;
}> = {
  1: {
    title: "Find Your Idea",
    estimatedTime: "45-60 minutes",
    videoTitle: "How to Find Your Million-Dollar App Idea",
    videoLength: "18 minutes",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    missionDescription: "Today we'll help you discover the perfect app idea that matches your skills, interests, and market opportunity. No more guessing — we use a proven framework.",
    outcomes: [
      "Validated app idea with clear target audience",
      "Problem-solution statement written",
      "Competitive landscape mapped",
      "Unique value proposition defined",
    ],
    resources: [
      { title: "50 Profitable AI App Ideas PDF", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-1/50-profitable-ai-app-ideas.pdf", storageKey: "day-1/50-profitable-ai-app-ideas.pdf" },
      { title: "Idea Validation Worksheet", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-1/idea-validation-worksheet.pdf", storageKey: "day-1/idea-validation-worksheet.pdf" },
      { title: "Market Research Template", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-1/market-research-template.pdf", storageKey: "day-1/market-research-template.pdf", vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "exercise", label: "Complete the idea brainstorm exercise", required: true },
      { id: "validate", label: "Validate your top 3 ideas", required: true },
      { id: "share", label: "Share your chosen idea in community", required: false },
    ],
    nextDayPreview: "Tomorrow you'll create a visual blueprint for your app — mapping out screens, features, and user flow.",
  },
  2: {
    title: "Design Blueprint",
    estimatedTime: "60-75 minutes",
    videoTitle: "Creating Your App Blueprint (No Design Skills Needed)",
    videoLength: "22 minutes",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    missionDescription: "Today we'll create a visual map of your entire app. You'll define every screen, button, and user flow before writing a single line of code.",
    outcomes: [
      "Complete app wireframe/blueprint",
      "User flow diagram",
      "Feature priority list",
      "Design inspiration collected",
    ],
    resources: [
      { title: "Blueprint Template (Figma)", type: "link", icon: <ExternalLink className="w-4 h-4" />, url: "https://figma.com" },
      { title: "User Flow Cheat Sheet", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-2/user-flow-cheat-sheet.pdf", storageKey: "day-2/user-flow-cheat-sheet.pdf" },
      { title: "Design System Starter Kit", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-2/design-system-starter-kit.pdf", storageKey: "day-2/design-system-starter-kit.pdf", vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "wireframe", label: "Create your app wireframe", required: true },
      { id: "userflow", label: "Map your user flow", required: true },
      { id: "bonus", label: "(Optional) Watch the Figma crash course", required: false },
    ],
    nextDayPreview: "Tomorrow is the big day — we start building your actual app using AI-powered tools!",
  },
  3: {
    title: "Build Core App",
    estimatedTime: "60-90 minutes",
    videoTitle: "Building Your App with AI (The Fun Part!)",
    videoLength: "23 minutes",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    missionDescription: "This is where the magic happens. Today you'll use AI-powered tools to build the core of your app. By the end, you'll have a working prototype.",
    outcomes: [
      "Working app prototype",
      "Core features implemented",
      "Basic navigation working",
      "Database connected (if needed)",
    ],
    resources: [
      { title: "Lovable Prompt Templates", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-3/lovable-prompt-templates.pdf", storageKey: "day-3/lovable-prompt-templates.pdf" },
      { title: "Component Library Reference", type: "link", icon: <ExternalLink className="w-4 h-4" />, url: "https://ui.shadcn.com" },
      { title: "Done-For-You App Template", type: "download", icon: <Code className="w-4 h-4" />, url: "/resources/day-3/app-template.zip", storageKey: "day-3/app-template.zip", vipOnly: true },
      { title: "Advanced Prompts Vault", type: "download", icon: <Sparkles className="w-4 h-4" />, url: "/resources/day-3/advanced-prompts-vault.pdf", storageKey: "day-3/advanced-prompts-vault.pdf", vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "build", label: "Build your core app structure", required: true },
      { id: "features", label: "Implement main features", required: true },
      { id: "share", label: "Share your progress in community", required: false },
      { id: "bonus", label: "(Optional) Watch advanced customization tutorial", required: false },
    ],
    nextDayPreview: "Tomorrow we'll add AI superpowers to your app — chatbots, content generation, and more!",
  },
  4: {
    title: "Add AI Magic",
    estimatedTime: "60-75 minutes",
    videoTitle: "Adding AI Features That Wow Users",
    videoLength: "25 minutes",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    missionDescription: "Today we'll add AI capabilities to your app — think chatbots, content generation, image analysis, and more. This is what makes your app feel like magic.",
    outcomes: [
      "AI feature integrated",
      "API connections working",
      "AI prompts optimized",
      "Error handling in place",
    ],
    resources: [
      { title: "AI Integration Guide", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-4/ai-integration-guide.pdf", storageKey: "day-4/ai-integration-guide.pdf" },
      { title: "Prompt Engineering Cheat Sheet", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-4/prompt-engineering-cheat-sheet.pdf", storageKey: "day-4/prompt-engineering-cheat-sheet.pdf" },
      { title: "Advanced AI Templates", type: "download", icon: <Sparkles className="w-4 h-4" />, url: "/resources/day-4/advanced-ai-templates.pdf", storageKey: "day-4/advanced-ai-templates.pdf", vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "integrate", label: "Integrate AI feature", required: true },
      { id: "test", label: "Test AI functionality", required: true },
      { id: "optimize", label: "(Optional) Optimize prompts for better results", required: false },
    ],
    nextDayPreview: "Tomorrow we'll polish your app — colors, fonts, branding, and that professional feel.",
  },
  5: {
    title: "Ship It! 🚀",
    estimatedTime: "60-90 minutes",
    videoTitle: "Polish, Test & Launch Your App",
    videoLength: "25 minutes",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    missionDescription: "Today you'll add the finishing touches — styling, branding, testing — and then deploy your app live to the world. This is launch day!",
    outcomes: [
      "Professional styling and branding applied",
      "All major bugs fixed and tested",
      "App deployed and live",
      "Launch announcement posted",
    ],
    resources: [
      { title: "UI Polish Checklist", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-5/ui-polish-checklist.pdf", storageKey: "day-5/ui-polish-checklist.pdf" },
      { title: "Launch Checklist", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-5/launch-checklist.pdf", storageKey: "day-5/launch-checklist.pdf" },
      { title: "First 100 Users Playbook", type: "download", icon: <FileText className="w-4 h-4" />, url: "/resources/day-5/first-100-users-playbook.pdf", storageKey: "day-5/first-100-users-playbook.pdf", vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "deploy", label: "Polish, test, and deploy your app", required: true },
      { id: "share", label: "Share your launch in community", required: true },
      { id: "celebrate", label: "Celebrate your achievement! 🎉", required: true },
    ],
    nextDayPreview: "Congratulations! You've completed the challenge. Join us for the 3-Day AI For Business Event!",
  },
};

// Confetti component
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

const DayMission = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { 
    progress, 
    fetchProgress, 
    completeTask, 
    completeDay, 
    getDayProgress,
    isLoading: progressLoading 
  } = useProgress();
  
  const day = parseInt(dayNumber || "1");
  const data = dayData[day] || dayData[1];
  const isVIP = profile?.is_vip || false;
  const firstName = profile?.first_name || "Builder";

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [completingDay, setCompletingDay] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch progress on mount
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Get current day's progress from the hook
  const currentDayProgress = getDayProgress(day);
  // Day 1 is always unlocked, other days require explicit unlock
  // Also don't redirect if we haven't loaded progress yet
  const isUnlocked = currentDayProgress?.is_unlocked ?? (day === 1 || progress.length === 0);
  const isDayComplete = currentDayProgress?.is_completed ?? false;
  const tasksCompleted = currentDayProgress?.tasks_completed || {};

  // Calculate progress
  const requiredItems = data.checklist.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => {
    const dbTaskId = taskIdMap[day]?.[item.id] || item.id;
    return dbTaskId in tasksCompleted;
  }).length;
  const allRequiredComplete = completedRequired === requiredItems.length;
  const progressPercent = (completedRequired / requiredItems.length) * 100;

  // Save time on unmount
  const saveTimeSpent = useCallback(async () => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    if (seconds < 5) return;
    try {
      await supabase.from("user_progress")
        .update({ time_spent_seconds: (currentDayProgress?.time_spent_seconds || 0) + seconds })
        .eq("user_id", profile?.id || "")
        .eq("day_number", day);
    } catch (e) {
      console.error("Failed to save time:", e);
    }
  }, [startTime, day, profile?.id, currentDayProgress?.time_spent_seconds]);

  useEffect(() => {
    const handleBeforeUnload = () => saveTimeSpent();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveTimeSpent();
    };
  }, [saveTimeSpent]);

  useEffect(() => {
    // Only redirect if:
    // 1. Progress has finished loading
    // 2. We have progress data
    // 3. The day is explicitly not unlocked
    if (!progressLoading && progress.length > 0 && currentDayProgress && !currentDayProgress.is_unlocked) {
      showError("This day is not unlocked yet!");
      navigate("/dashboard");
    }
  }, [currentDayProgress, progressLoading, progress.length, navigate]);

  // Show confetti when day is complete
  useEffect(() => {
    if (isDayComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [isDayComplete, showConfetti]);

  const handleCheck = async (id: string, checked: boolean) => {
    if (!checked) return; // Only handle checking, not unchecking
    
    const dbTaskId = taskIdMap[day]?.[id] || id;
    setCompletingTask(id);
    
    const result = await completeTask(day, dbTaskId);
    
    if (result) {
      if (result.day_completed) {
        showSuccess("Day complete! Great work! 🎉");
        if (result.next_day_unlocked) {
          showInfo(`Day ${day + 1} is now unlocked!`);
        }
      } else {
        showSuccess("Task completed!");
      }
    }
    
    setCompletingTask(null);
  };

  const handleCompleteDay = async () => {
    if (!allRequiredComplete) return;
    
    setCompletingDay(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const result = await completeDay(day, timeSpent);
    
    if (result) {
      setShowCelebration(true);
      
      if (result.is_graduation) {
        // Celebration screen will handle navigation to graduation
      } else if (result.next_day_unlocked) {
        // Celebration screen will show next day preview
      }
    }
    
    setCompletingDay(false);
  };

  const isTaskCompleted = (id: string): boolean => {
    const dbTaskId = taskIdMap[day]?.[id] || id;
    return dbTaskId in tasksCompleted;
  };

  if (progressLoading && progress.length === 0) {
    return (
      <DashboardLayout userName={firstName} currentDay={day} isVIP={isVIP}>
        <MissionSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={firstName} currentDay={day} isVIP={isVIP}>
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
        {/* Top Section */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary text-xs md:text-sm">
              DAY {day} OF 5
            </Badge>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              {data.estimatedTime}
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              ⏱ {formatElapsed(elapsedSeconds)}
            </Badge>
            {isDayComplete && (
              <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                <Check className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-display font-bold text-foreground">
            {data.title}
          </h1>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <span className="text-muted-foreground">Mission Progress</span>
              <span className="font-medium text-foreground">
                {completedRequired} of {requiredItems.length} tasks
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Video Section */}
        <Card className="overflow-hidden">
          {(() => {
            const isPlaceholderVideo = !data.videoUrl || data.videoUrl.includes('dQw4w9WgXcQ') || data.videoUrl === '#';
            return isPlaceholderVideo ? (
              <div className="relative aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center gap-3 border border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="w-8 h-8 text-primary/50" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Video Coming Soon</p>
                  <p className="text-sm text-muted-foreground">Training video will be available when the challenge starts</p>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={data.videoUrl}
                  title={`Day ${day}: ${data.videoTitle}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0"
                />
              </div>
            );
          })()}
          {!isTaskCompleted("video") && (
            <div className="px-3 pt-3 md:px-4 md:pt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCheck("video", true)}
                disabled={completingTask === "video"}
              >
                {completingTask === "video" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Mark as Watched
              </Button>
            </div>
          )}
          {isTaskCompleted("video") && (
            <div className="px-3 pt-3 md:px-4 md:pt-4">
              <span className="inline-flex items-center text-sm text-accent font-medium">
                <Check className="w-4 h-4 mr-1" />
                Watched
              </span>
            </div>
          )}
          <CardContent className="p-3 md:p-4">
            <h3 className="font-semibold text-foreground text-sm md:text-base">{data.videoTitle}</h3>
            <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Video className="w-3 h-3 md:w-4 md:h-4" />
              Watch time: {data.videoLength}
            </p>
          </CardContent>
        </Card>

        {/* Mission Briefing */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Today's Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
            <p className="text-sm md:text-base text-muted-foreground">{data.missionDescription}</p>

            <div>
              <h4 className="font-semibold text-foreground mb-2 md:mb-3 text-sm md:text-base">
                By the end of today, you'll have:
              </h4>
              <ul className="space-y-2">
                {data.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2 md:gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                    </div>
                    <span className="text-foreground text-sm md:text-base">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl">Today's Resources</CardTitle>
                <ChevronDown
                  className={`w-4 h-4 md:w-5 md:h-5 text-muted-foreground transition-transform ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 p-4 md:p-6">
                <div className="space-y-2 md:space-y-3">
                  {data.resources.map((resource, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2.5 md:p-3 rounded-lg border gap-2 ${
                        resource.vipOnly && !isVIP
                          ? "bg-muted/50 border-border"
                          : "bg-card border-border hover:border-primary/50"
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            resource.vipOnly && !isVIP
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {resource.vipOnly && !isVIP ? (
                            <Lock className="w-3 h-3 md:w-4 md:h-4" />
                          ) : (
                            resource.icon
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`font-medium text-sm md:text-base truncate ${
                              resource.vipOnly && !isVIP
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {resource.title}
                          </p>
                          {resource.vipOnly && (
                            <Badge variant="secondary" className="text-[10px] md:text-xs mt-1">
                              <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                              VIP Only
                            </Badge>
                          )}
                        </div>
                      </div>
                      {resource.vipOnly && !isVIP ? (
                        <Button variant="outline" size="sm" className="text-xs shrink-0" asChild>
                          <Link to="/vip-offer">Upgrade</Link>
                        </Button>
                      ) : resource.type === "download" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={async () => {
                            const storageKey = resource.storageKey;
                            if (storageKey) {
                              const { data: fileData } = supabase.storage
                                .from("challenge-resources")
                                .getPublicUrl(storageKey);
                              
                              if (fileData?.publicUrl) {
                                window.open(fileData.publicUrl, '_blank');
                                showSuccess(`Downloading ${resource.title}...`);
                              } else {
                                showError("Resource not available yet. Check back soon!");
                              }
                            } else {
                              showError("Resource not available yet. Check back soon!");
                            }
                            // Log download
                            if (profile?.id) {
                              supabase.from("downloads").insert({
                                user_id: profile.id,
                                resource_key: storageKey || resource.title,
                                user_agent: navigator.userAgent,
                              });
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      ) : resource.type === "link" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action Checklist */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Action Checklist</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="space-y-2 md:space-y-4">
              {data.checklist.map((item) => {
                const completed = isTaskCompleted(item.id);
                const isCompletingThis = completingTask === item.id;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 md:p-3 rounded-lg border transition-colors ${
                      completed
                        ? "bg-primary/5 border-primary/30"
                        : "bg-card border-border"
                    }`}
                  >
                    {isCompletingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin mt-0.5 shrink-0" />
                    ) : (
                      <Checkbox
                        id={item.id}
                        checked={completed}
                        onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                        disabled={completed || isDayComplete}
                        className="mt-0.5 shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor={item.id}
                        className={`cursor-pointer text-sm md:text-base ${
                          completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                        {!item.required && (
                          <span className="text-[10px] md:text-xs text-muted-foreground ml-2">(Optional)</span>
                        )}
                      </label>
                      {/share|community/i.test(item.label) && (
                        <a
                          href={COMMUNITY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-primary hover:underline mt-1"
                        >
                          Share in the community →
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mission Complete Section */}
        {(allRequiredComplete || isDayComplete) && (
          <Card className="border-primary bg-gradient-to-br from-primary/10 via-card to-accent/10">
            <CardContent className="p-4 md:p-8 text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                🎉 {isDayComplete ? "Mission Complete!" : "All Tasks Done!"}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                {isDayComplete
                  ? day < 5
                    ? `Amazing work! Day ${day + 1} is now available.`
                    : "Congratulations! You've completed the entire challenge!"
                  : "Click below to complete this day and unlock the next one."}
              </p>

              {!isDayComplete && (
                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleCompleteDay}
                  disabled={completingDay}
                  className="w-full md:w-auto"
                >
                  {completingDay ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Check className="w-5 h-5 mr-2" />
                  )}
                  Complete Day {day}
                </Button>
              )}

              {/* Next Day Preview */}
              {day < 5 && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl bg-card border border-border text-left">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Coming Next:</p>
                  <p className="font-medium text-foreground text-sm md:text-base">{data.nextDayPreview}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bottom Navigation */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-0 md:justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            disabled={day <= 1}
            asChild={day > 1}
            className="order-2 md:order-1"
          >
            {day > 1 ? (
              <Link to={`/dashboard/day/${day - 1}`}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Day {day - 1}
              </Link>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </>
            )}
          </Button>

          <Button 
            variant="cta" 
            disabled={!allRequiredComplete || isDayComplete || completingDay}
            onClick={handleCompleteDay}
            className="order-1 md:order-2 w-full md:w-auto"
          >
            {completingDay ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isDayComplete ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              "Complete Day"
            )}
          </Button>

          <Button
            variant="ghost"
            disabled={day >= 5 || !isDayComplete}
            asChild={day < 5 && isDayComplete}
            className="order-3"
          >
            {day < 5 ? (
              isDayComplete ? (
                <Link to={`/dashboard/day/${day + 1}`}>
                  Day {day + 1}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  Day {day + 1}
                  <Lock className="w-4 h-4 ml-2" />
                </>
              )
            ) : isDayComplete ? (
              <Link to="/dashboard/graduation">
                Graduate 🎓
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            ) : (
              <>
                Finish
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DayMission;
