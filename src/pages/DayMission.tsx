import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

// Day data - would come from database in real app
const dayData: Record<number, {
  title: string;
  estimatedTime: string;
  videoTitle: string;
  videoLength: string;
  missionDescription: string;
  outcomes: string[];
  resources: Array<{
    title: string;
    type: "download" | "link" | "video";
    icon: React.ReactNode;
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
    missionDescription: "Today we'll help you discover the perfect app idea that matches your skills, interests, and market opportunity. No more guessing — we use a proven framework.",
    outcomes: [
      "Validated app idea with clear target audience",
      "Problem-solution statement written",
      "Competitive landscape mapped",
      "Unique value proposition defined",
    ],
    resources: [
      { title: "50 Profitable AI App Ideas PDF", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Idea Validation Worksheet", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Market Research Template", type: "download", icon: <FileText className="w-4 h-4" />, vipOnly: true },
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
    missionDescription: "Today we'll create a visual map of your entire app. You'll define every screen, button, and user flow before writing a single line of code.",
    outcomes: [
      "Complete app wireframe/blueprint",
      "User flow diagram",
      "Feature priority list",
      "Design inspiration collected",
    ],
    resources: [
      { title: "Blueprint Template (Figma)", type: "link", icon: <ExternalLink className="w-4 h-4" /> },
      { title: "User Flow Cheat Sheet", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Design System Starter Kit", type: "download", icon: <FileText className="w-4 h-4" />, vipOnly: true },
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
    missionDescription: "This is where the magic happens. Today you'll use AI-powered tools to build the core of your app. By the end, you'll have a working prototype.",
    outcomes: [
      "Working app prototype",
      "Core features implemented",
      "Basic navigation working",
      "Database connected (if needed)",
    ],
    resources: [
      { title: "Lovable Prompt Templates", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Component Library Reference", type: "link", icon: <ExternalLink className="w-4 h-4" /> },
      { title: "Done-For-You App Template", type: "download", icon: <Code className="w-4 h-4" />, vipOnly: true },
      { title: "Advanced Prompts Vault", type: "download", icon: <Sparkles className="w-4 h-4" />, vipOnly: true },
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
    missionDescription: "Today we'll add AI capabilities to your app — think chatbots, content generation, image analysis, and more. This is what makes your app feel like magic.",
    outcomes: [
      "AI feature integrated",
      "API connections working",
      "AI prompts optimized",
      "Error handling in place",
    ],
    resources: [
      { title: "AI Integration Guide", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Prompt Engineering Cheat Sheet", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Advanced AI Templates", type: "download", icon: <Sparkles className="w-4 h-4" />, vipOnly: true },
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
    title: "Polish & Brand",
    estimatedTime: "45-60 minutes",
    videoTitle: "Making Your App Look Professional",
    videoLength: "20 minutes",
    missionDescription: "Today we'll transform your app from 'prototype' to 'polished product'. We'll add branding, improve the UI, and make everything feel cohesive.",
    outcomes: [
      "Consistent color scheme applied",
      "Logo and branding added",
      "Typography refined",
      "Micro-interactions added",
    ],
    resources: [
      { title: "Color Palette Generator", type: "link", icon: <ExternalLink className="w-4 h-4" /> },
      { title: "UI Polish Checklist", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Premium Icon Pack", type: "download", icon: <FileText className="w-4 h-4" />, vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "colors", label: "Apply your color scheme", required: true },
      { id: "branding", label: "Add logo and branding", required: true },
      { id: "share", label: "Share before/after in community", required: false },
    ],
    nextDayPreview: "Tomorrow we'll test everything and fix any bugs before launch!",
  },
  6: {
    title: "Test & Fix",
    estimatedTime: "45-60 minutes",
    videoTitle: "Finding and Fixing Bugs (Without Coding)",
    videoLength: "18 minutes",
    missionDescription: "Today we'll test your app thoroughly and fix any issues. You'll learn how to identify bugs and use AI to fix them — no coding knowledge required.",
    outcomes: [
      "All major bugs fixed",
      "Mobile responsiveness verified",
      "User testing completed",
      "Performance optimized",
    ],
    resources: [
      { title: "QA Testing Checklist", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Bug Fixing Prompts", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Performance Optimization Guide", type: "download", icon: <FileText className="w-4 h-4" />, vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "test", label: "Complete testing checklist", required: true },
      { id: "fix", label: "Fix identified issues", required: true },
      { id: "mobile", label: "Verify mobile experience", required: true },
    ],
    nextDayPreview: "Tomorrow is LAUNCH DAY! 🚀 Get ready to ship your app to the world!",
  },
  7: {
    title: "Ship It!",
    estimatedTime: "30-45 minutes",
    videoTitle: "Launch Day: Shipping Your App to the World",
    videoLength: "15 minutes",
    missionDescription: "This is it — launch day! Today you'll deploy your app and share it with the world. You did it!",
    outcomes: [
      "App deployed and live",
      "Custom domain connected (optional)",
      "Launch announcement posted",
      "First users invited",
    ],
    resources: [
      { title: "Launch Checklist", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "Social Announcement Templates", type: "download", icon: <FileText className="w-4 h-4" /> },
      { title: "First 100 Users Playbook", type: "download", icon: <FileText className="w-4 h-4" />, vipOnly: true },
    ],
    checklist: [
      { id: "video", label: "Watch the training video", required: true },
      { id: "deploy", label: "Deploy your app", required: true },
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
  const day = parseInt(dayNumber || "3");
  const data = dayData[day] || dayData[3];
  const isVIP = false; // Would come from user context

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const requiredItems = data.checklist.filter((item) => item.required);
  const completedRequired = requiredItems.filter((item) => checkedItems[item.id]).length;
  const isComplete = completedRequired === requiredItems.length;
  const progressPercent = (completedRequired / requiredItems.length) * 100;

  // Show confetti when complete
  useEffect(() => {
    if (isComplete && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [isComplete]);

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <DashboardLayout userName="Builder" currentDay={3}>
      {showConfetti && <Confetti />}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-primary border-primary">
              DAY {day} OF 7
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {data.estimatedTime}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {data.title}
          </h1>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
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
          <div className="relative aspect-video bg-muted flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform z-10">
              <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground">{data.videoTitle}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Video className="w-4 h-4" />
              Watch time: {data.videoLength}
            </p>
          </CardContent>
        </Card>

        {/* Mission Briefing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Today's Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{data.missionDescription}</p>

            <div>
              <h4 className="font-semibold text-foreground mb-3">
                By the end of today, you'll have:
              </h4>
              <ul className="space-y-2">
                {data.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-foreground">{outcome}</span>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Today's Resources</CardTitle>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {data.resources.map((resource, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        resource.vipOnly && !isVIP
                          ? "bg-muted/50 border-border"
                          : "bg-card border-border hover:border-primary/50"
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            resource.vipOnly && !isVIP
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {resource.vipOnly && !isVIP ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            resource.icon
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              resource.vipOnly && !isVIP
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {resource.title}
                          </p>
                          {resource.vipOnly && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              <Crown className="w-3 h-3 mr-1" />
                              VIP Only
                            </Badge>
                          )}
                        </div>
                      </div>
                      {resource.vipOnly && !isVIP ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/vip-offer">Upgrade</Link>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          {resource.type === "download" && <Download className="w-4 h-4" />}
                          {resource.type === "link" && <ExternalLink className="w-4 h-4" />}
                          {resource.type === "video" && <Play className="w-4 h-4" />}
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
          <CardHeader>
            <CardTitle className="text-xl">Action Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.checklist.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    checkedItems[item.id]
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border"
                  }`}
                >
                  <Checkbox
                    id={item.id}
                    checked={checkedItems[item.id] || false}
                    onCheckedChange={(checked) => handleCheck(item.id, checked as boolean)}
                  />
                  <label
                    htmlFor={item.id}
                    className={`flex-1 cursor-pointer ${
                      checkedItems[item.id]
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                    {!item.required && (
                      <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission Complete Section */}
        {isComplete && (
          <Card className="border-primary bg-gradient-to-br from-primary/10 via-card to-accent/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                🎉 Mission Complete!
              </h2>
              <p className="text-muted-foreground mb-6">
                {day < 7
                  ? `Amazing work! Day ${day + 1} unlocks tomorrow at 10am EST.`
                  : "Congratulations! You've completed the entire challenge!"}
              </p>

              {/* Next Day Preview */}
              {day < 7 && (
                <div className="mt-6 p-4 rounded-xl bg-card border border-border text-left">
                  <p className="text-sm text-muted-foreground mb-1">Coming Tomorrow:</p>
                  <p className="font-medium text-foreground">{data.nextDayPreview}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            disabled={day <= 1}
            asChild={day > 1}
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

          <Button variant="cta" disabled={!isComplete}>
            {isComplete ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              "Complete All Tasks"
            )}
          </Button>

          <Button
            variant="ghost"
            disabled={day >= 7 || !isComplete}
            asChild={day < 7 && isComplete}
          >
            {day < 7 ? (
              isComplete ? (
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
