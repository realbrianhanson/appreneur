import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Clock,
  Trophy,
  Zap,
  TrendingUp,
  FileText,
  Video,
  MessageCircle,
  Crown,
  Lock,
  Sparkles,
  Palette,
  ExternalLink,
  Bell,
  Calendar,
  Users,
  Heart,
  X,
} from "lucide-react";
import { useState } from "react";

// Mock data - would come from database
const userData = {
  firstName: "Alex",
  currentDay: 3,
  completedDays: 2,
  currentDayProgress: { completed: 1, total: 4 },
  streak: 3,
  totalTime: "4h 23m",
  rank: 15,
  isVIP: false,
};

const upcomingDays = [
  {
    day: 4,
    title: "Add AI Magic",
    description: "Integrate AI features that make your app feel magical",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    day: 5,
    title: "Polish & Brand",
    description: "Add professional styling and branding to your app",
    icon: <Palette className="w-5 h-5" />,
  },
];

const communityPosts = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "S",
    appName: "ContentFlow AI",
    description: "Just shipped my content scheduling app!",
    likes: 24,
    timeAgo: "2h ago",
  },
  {
    id: 2,
    author: "Marcus T.",
    avatar: "M",
    appName: "LeadTracker Pro",
    description: "Day 5 done - UI is looking clean 🔥",
    likes: 18,
    timeAgo: "4h ago",
  },
  {
    id: 3,
    author: "Jennifer K.",
    avatar: "J",
    appName: "CoachBot",
    description: "AI integration working perfectly!",
    likes: 31,
    timeAgo: "6h ago",
  },
];

const Dashboard = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const progress = (userData.completedDays / 7) * 100;
  const currentMissionProgress =
    (userData.currentDayProgress.completed / userData.currentDayProgress.total) * 100;

  const stats = [
    {
      label: "Streak",
      value: `${userData.streak} days`,
      icon: <Zap className="w-5 h-5 text-orange-500" />,
      color: "text-orange-500",
    },
    {
      label: "Total Time",
      value: userData.totalTime,
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
      value: `Top ${userData.rank}%`,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      color: "text-yellow-500",
    },
  ];

  const quickLinks = [
    {
      title: "Prompt Library",
      icon: <FileText className="w-5 h-5" />,
      url: "/dashboard/resources",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "All Videos",
      icon: <Video className="w-5 h-5" />,
      url: "/dashboard/videos",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Get Help",
      icon: <MessageCircle className="w-5 h-5" />,
      url: "/dashboard/support",
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Upgrade to VIP",
      icon: <Crown className="w-5 h-5" />,
      url: "/vip-offer",
      color: "bg-yellow-500/10 text-yellow-500",
      highlight: !userData.isVIP,
    },
  ];

  return (
    <DashboardLayout
      userName={userData.firstName}
      currentDay={userData.currentDay}
      isVIP={userData.isVIP}
    >
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
                Welcome back, {userData.firstName}! 👋
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
                    Day {userData.currentDay} of 7
                  </Badge>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-foreground">
                      {userData.completedDays} missions completed
                    </span>
                    <span className="text-muted-foreground">
                      • {7 - userData.completedDays} to go
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
                  Day {userData.currentDay}: Build Your Core App
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Today you'll start building the foundation of your app using AI-powered
                  tools. By the end, you'll have a working prototype.
                </p>

                {/* Task Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Task Progress</span>
                    <span className="font-medium text-foreground">
                      {userData.currentDayProgress.completed} of{" "}
                      {userData.currentDayProgress.total} tasks
                    </span>
                  </div>
                  <Progress value={currentMissionProgress} className="h-2" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="cta" size="lg" asChild>
                  <Link to={`/dashboard/day/${userData.currentDay}`}>
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
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                Coming Up Next
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingDays.map((day) => (
                  <Card
                    key={day.day}
                    className="opacity-75 hover:opacity-90 transition-opacity"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          {day.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-muted-foreground">Day {day.day}</p>
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <p className="font-semibold text-foreground truncate">{day.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {day.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Highlights */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-foreground">
                  What Others Are Building
                </h2>
                <Button variant="ghost" size="sm" className="text-primary">
                  See All
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="space-y-3">
                {communityPosts.map((post) => (
                  <Card key={post.id} className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-primary font-semibold">{post.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">{post.author}</p>
                            <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {post.description}
                          </p>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="text-xs">
                              {post.appName}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Resources Quick Access */}
            <div className="space-y-4">
              <h2 className="text-lg font-display font-bold text-foreground">
                Quick Access
              </h2>
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <Link key={index} to={link.url} className="block group">
                    <Card
                      className={`hover:border-primary/50 transition-colors ${
                        link.highlight ? "border-yellow-500/30" : ""
                      }`}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}
                        >
                          {link.icon}
                        </div>
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {link.title}
                        </span>
                        {link.highlight && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Recommended
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Motivation Card */}
            <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-accent/30">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Keep going!</p>
                <p className="text-xs text-muted-foreground">
                  You're ahead of 85% of participants. Day 7 is closer than you think! 🚀
                </p>
              </CardContent>
            </Card>

            {/* Community Card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Join the Community</p>
                    <p className="text-xs text-muted-foreground">
                      500+ builders helping each other
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
