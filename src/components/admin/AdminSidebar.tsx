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
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Webhook,
  MessageSquare,
  Settings,
  Zap,
  Shield,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin" },
  { title: "Users", icon: Users, url: "/admin/users" },
  { title: "Cohorts", icon: Calendar, url: "/admin/cohorts" },
  { title: "Revenue", icon: DollarSign, url: "/admin/revenue" },
  { title: "Analytics", icon: BarChart3, url: "/admin/analytics" },
  { title: "Webhooks", icon: Webhook, url: "/admin/webhooks" },
  { title: "Testimonials", icon: MessageSquare, url: "/admin/testimonials" },
  { title: "Settings", icon: Settings, url: "/admin/settings", adminOnly: true },
];

interface AdminSidebarProps {
  role: AppRole | null;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(url);
  };

  const getRoleIcon = () => {
    switch (role) {
      case "super_admin":
        return <ShieldCheck className="w-4 h-4 text-accent" />;
      case "admin":
        return <Shield className="w-4 h-4 text-primary" />;
      case "support":
        return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "support":
        return "Support";
      default:
        return "Unknown";
    }
  };

  const visibleNavItems = mainNavItems.filter(item => {
    if (item.adminOnly && role === "support") return false;
    return true;
  });

  return (
    <Sidebar className="border-r border-border bg-sidebar-background">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-foreground">Admin</span>
                <span className="text-xs text-muted-foreground">Appreneur Challenge</span>
              </div>
            )}
          </Link>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              {getRoleIcon()}
              <span className="text-sm font-medium text-foreground">{getRoleLabel()}</span>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="px-4 py-2">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <SidebarFooter className="border-t border-border p-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {!collapsed && "← Back to App"}
          </Link>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
