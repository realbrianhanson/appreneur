import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

interface DayNavItem {
  day: number;
  title: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "locked";
  url: string;
}

const dayNavItems: DayNavItem[] = [
  { day: 1, title: "Find Your Idea", icon: <Lightbulb className="w-4 h-4" />, status: "completed", url: "/dashboard/day/1" },
  { day: 2, title: "Design Blueprint", icon: <PenTool className="w-4 h-4" />, status: "completed", url: "/dashboard/day/2" },
  { day: 3, title: "Build Core App", icon: <Code className="w-4 h-4" />, status: "current", url: "/dashboard/day/3" },
  { day: 4, title: "Add AI Magic", icon: <Sparkles className="w-4 h-4" />, status: "locked", url: "/dashboard/day/4" },
  { day: 5, title: "Polish & Brand", icon: <Palette className="w-4 h-4" />, status: "locked", url: "/dashboard/day/5" },
  { day: 6, title: "Test & Fix", icon: <Bug className="w-4 h-4" />, status: "locked", url: "/dashboard/day/6" },
  { day: 7, title: "Ship It!", icon: <Rocket className="w-4 h-4" />, status: "locked", url: "/dashboard/day/7" },
];

const bottomNavItems = [
  { title: "Community", icon: <Users className="w-4 h-4" />, url: "#", external: true },
  { title: "Resources", icon: <FolderOpen className="w-4 h-4" />, url: "/dashboard/resources" },
  { title: "Support", icon: <HelpCircle className="w-4 h-4" />, url: "/dashboard/support" },
];

interface DashboardSidebarProps {
  userName?: string;
  currentDay?: number;
  isVIP?: boolean;
}

const DashboardSidebar = ({ userName = "Builder", currentDay = 3, isVIP = false }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const progress = (currentDay / 7) * 100;

  const getStatusIcon = (status: DayNavItem["status"]) => {
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
                <p className="text-xs text-muted-foreground">Day {currentDay} of 7</p>
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
              {dayNavItems.map((item) => (
                <SidebarMenuItem key={item.day}>
                  <SidebarMenuButton asChild disabled={item.status === "locked"}>
                    <Link
                      to={item.status !== "locked" ? item.url : "#"}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        item.status === "current"
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : item.status === "completed"
                          ? "hover:bg-muted text-foreground"
                          : "opacity-50 cursor-not-allowed text-muted-foreground"
                      }`}
                      onClick={(e) => item.status === "locked" && e.preventDefault()}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {item.icon}
                        {!collapsed && (
                          <>
                            <span className="flex-1">Day {item.day}: {item.title}</span>
                            {getStatusIcon(item.status)}
                          </>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <SidebarFooter className="border-t border-border">
          <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
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
