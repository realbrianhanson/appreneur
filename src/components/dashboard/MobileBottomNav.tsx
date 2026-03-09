import { Link, useLocation } from "react-router-dom";
import { COMMUNITY_URL } from "@/lib/constants";
import {
  LayoutDashboard,
  Rocket,
  Users,
  Crown,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Lightbulb, PenTool, Code, Sparkles, Palette, Bug, Check, Lock } from "lucide-react";

interface MobileBottomNavProps {
  currentDay?: number;
  isVIP?: boolean;
}

const dayNavItems = [
  { day: 1, title: "Find Your Idea", icon: Lightbulb },
  { day: 2, title: "Design Blueprint", icon: PenTool },
  { day: 3, title: "Build Core App", icon: Code },
  { day: 4, title: "Add AI Magic", icon: Sparkles },
  { day: 5, title: "Ship It!", icon: Rocket },
];

const MobileBottomNav = ({ currentDay = 1, isVIP = false }: MobileBottomNavProps) => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === "/dashboard" && path === "/dashboard") return true;
    if (route === "/dashboard/community" && path.includes("community")) return true;
    if (route.includes("/day/") && path.includes("/day/")) return true;
    return false;
  };

  const getDayStatus = (day: number): "completed" | "current" | "locked" => {
    if (day < currentDay) return "completed";
    if (day === currentDay) return "current";
    return "locked";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <nav className="flex items-center justify-around h-16 px-2">
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${
            path === "/dashboard" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Current Day */}
        <Link
          to={`/dashboard/day/${currentDay}`}
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${
            path.includes("/day/") ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Rocket className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0 flex items-center justify-center text-[8px] bg-primary">
              {currentDay}
            </Badge>
          </div>
          <span className="text-[10px] font-medium">Mission</span>
        </Link>

        {/* Community */}
        <a
          href={COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Community</span>
        </a>

        {/* VIP Upgrade or Menu */}
        {!isVIP ? (
          <Link
            to="/vip-offer"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-accent"
          >
            <Crown className="w-5 h-5" />
            <span className="text-[10px] font-medium">VIP</span>
          </Link>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground">
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  All Days
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {dayNavItems.map((item) => {
                  const status = getDayStatus(item.day);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.day}
                      to={status !== "locked" ? `/dashboard/day/${item.day}` : "#"}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        status === "current"
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : status === "completed"
                          ? "hover:bg-muted text-foreground"
                          : "opacity-50 text-muted-foreground"
                      }`}
                      onClick={(e) => status === "locked" && e.preventDefault()}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-sm">Day {item.day}: {item.title}</span>
                      {status === "completed" && <Check className="w-4 h-4 text-primary" />}
                      {status === "locked" && <Lock className="w-4 h-4" />}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* More Menu (for non-VIP users) */}
        {!isVIP && (
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground">
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  All Days
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {dayNavItems.map((item) => {
                  const status = getDayStatus(item.day);
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.day}
                      to={status !== "locked" ? `/dashboard/day/${item.day}` : "#"}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        status === "current"
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : status === "completed"
                          ? "hover:bg-muted text-foreground"
                          : "opacity-50 text-muted-foreground"
                      }`}
                      onClick={(e) => status === "locked" && e.preventDefault()}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-sm">Day {item.day}: {item.title}</span>
                      {status === "completed" && <Check className="w-4 h-4 text-primary" />}
                      {status === "locked" && <Lock className="w-4 h-4" />}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </div>
  );
};

export { MobileBottomNav };