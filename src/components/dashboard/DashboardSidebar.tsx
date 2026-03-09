import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { COMMUNITY_URL } from "@/lib/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Zap,
  LayoutDashboard,
  Lightbulb,
  PenTool,
  Code,
  Sparkles,
  Palette,
  Bug,
  Rocket,
  Users,
  FolderOpen,
  HelpCircle,
  Crown,
  Check,
  Lock,
} from "lucide-react";

interface DayConfig {
  day: number;
  title: string;
  icon: React.ReactNode;
  url: string;
}

const dayConfigs: DayConfig[] = [
  { day: 1, title: "Find Your Idea", icon: <Lightbulb className="w-4 h-4" />, url: "/dashboard/day/1" },
  { day: 2, title: "Design Blueprint", icon: <PenTool className="w-4 h-4" />, url: "/dashboard/day/2" },
  { day: 3, title: "Build Core App", icon: <Code className="w-4 h-4" />, url: "/dashboard/day/3" },
  { day: 4, title: "Add AI Magic", icon: <Sparkles className="w-4 h-4" />, url: "/dashboard/day/4" },
  { day: 5, title: "Ship It! 🚀", icon: <Rocket className="w-4 h-4" />, url: "/dashboard/day/5" },
];

const bottomNavItems = [
  { title: "Community", icon: <Users className="w-4 h-4" />, url: COMMUNITY_URL, external: true },
  { title: "Resources", icon: <FolderOpen className="w-4 h-4" />, url: "/dashboard/resources" },
  { title: "Support", icon: <HelpCircle className="w-4 h-4" />, url: "/dashboard/support" },
];

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  tasks_completed?: Record<string, unknown>;
}

interface DashboardSidebarProps {
  userName?: string;
  currentDay?: number;
  isVIP?: boolean;
  userProgress?: UserProgress[];
}

const DashboardSidebar = ({ userName = "Builder", currentDay = 1, isVIP = false, userProgress = [] }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  
  const completedDays = userProgress.filter(p => p.is_completed).length;
  const progress = (completedDays / 5) * 100;

  // Compute day status from actual progress
  const getDayStatus = (day: number): "completed" | "current" | "locked" => {
    const dayProgress = userProgress.find(p => p.day_number === day);
    if (dayProgress?.is_completed) return "completed";
    if (dayProgress?.is_unlocked) return "current";
    return "locked";
  };

  // Check if a day is unlocked but not started (no tasks completed)
  const isDayUnstarted = (day: number): boolean => {
    const dayProgress = userProgress.find(p => p.day_number === day);
    if (!dayProgress) return false;
    return dayProgress.is_unlocked && !dayProgress.is_completed && Object.keys(dayProgress.tasks_completed || {}).length === 0;
  };

  const getStatusIcon = (status: "completed" | "current" | "locked") => {
    switch (status) {
      case "completed":
        return <Check className="w-3 h-3 text-primary" />;
      case "locked":
        return <Lock className="w-3 h-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            {!collapsed && <span className="font-display font-bold text-lg">Appreneur</span>}
          </Link>
        </div>

        {/* User Info & Progress */}
        {!collapsed && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Day {currentDay} of 5</p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="px-4 py-2">
            {!collapsed && "Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === "/dashboard"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupLabel className="px-4 py-2 mt-4">
            {!collapsed && "Challenge Days"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dayConfigs.map((item) => {
                const status = getDayStatus(item.day);
                return (
                  <SidebarMenuItem key={item.day}>
                    <SidebarMenuButton asChild disabled={status === "locked"}>
                      <Link
                        to={status !== "locked" ? item.url : "#"}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                          status === "current"
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : status === "completed"
                            ? "hover:bg-muted text-foreground"
                            : "opacity-50 cursor-not-allowed text-muted-foreground"
                        }`}
                        onClick={(e) => status === "locked" && e.preventDefault()}
                      >
                        <div className="flex items-center gap-3 flex-1 relative">
                          {item.icon}
                          {!collapsed && (
                            <>
                              <span className="flex-1">Day {item.day}: {item.title}</span>
                              {getStatusIcon(status)}
                            </>
                          )}
                          {isDayUnstarted(item.day) && (
                            <div className="w-2 h-2 rounded-full bg-destructive absolute -top-0.5 -right-0.5" />
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <SidebarFooter className="border-t border-border">
          <SidebarMenu>
          {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  {item.external ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      {!collapsed && <span>{item.title}</span>}
                    </a>
                  ) : (
                    <Link
                      to={item.url}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* VIP Upgrade */}
            {!isVIP && !collapsed && (
              <div className="p-4">
                <Button variant="outline" size="sm" className="w-full border-accent text-accent hover:bg-accent/10" asChild>
                  <Link to="/vip-offer">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to VIP
                  </Link>
                </Button>
              </div>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};

export { DashboardSidebar };
