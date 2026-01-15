import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Code,
  Clock,
  Target,
  Trophy,
  Zap,
  FileText,
  Video,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const userName = "Builder";
  const currentDay = 3;
  const completedDays = 2;
  const progress = (completedDays / 7) * 100;

  const quickLinks = [
    { title: "Prompt Library", icon: <FileText className="w-5 h-5" />, url: "/dashboard/resources" },
    { title: "Video Tutorials", icon: <Video className="w-5 h-5" />, url: "/dashboard/resources" },
    { title: "Community", icon: <Users className="w-5 h-5" />, url: "#", external: true },
  ];

  const stats = [
    { label: "Days Completed", value: completedDays, icon: <Trophy className="w-5 h-5 text-primary" /> },
    { label: "Current Streak", value: "3 days", icon: <Zap className="w-5 h-5 text-accent" /> },
    { label: "Time Invested", value: "4.5 hrs", icon: <Clock className="w-5 h-5 text-secondary" /> },
  ];

  return (
    <DashboardLayout userName={userName} currentDay={currentDay}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            You're making great progress. Let's keep building!
          </p>
        </div>

        {/* Current Day Card - Large & Prominent */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
          <CardHeader className="relative">
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
              <Target className="w-4 h-4" />
              Today's Mission
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              Day 3: Build Your Core App
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Today you'll start building the foundation of your app. We'll use AI-powered 
              tools to create your first working prototype in under 90 minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="cta" size="lg" asChild>
                <Link to="/dashboard/day/3">
                  Start Today's Mission
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Clock className="w-4 h-4 mr-2" />
                ~90 min
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Challenge Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Completion</span>
                <span className="font-semibold text-foreground">{completedDays} of 7 days</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Day 1</span>
                <span>Day 7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.url}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group"
              >
                <Card className="hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {link.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{link.title}</p>
                      <p className="text-sm text-muted-foreground">Access now →</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <Card className="bg-gradient-to-r from-accent/10 to-secondary/10 border-accent/30">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-medium text-foreground">
              "You're 2 days in and already ahead of 90% of people who just think about building apps."
            </p>
            <p className="text-sm text-muted-foreground mt-2">Keep going — Day 7 is closer than you think! 🚀</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
