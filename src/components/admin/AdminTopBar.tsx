import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminTopBar() {
  const { user, profile, signOut } = useAuth();
  const { role } = useAdminRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications placeholder */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {profile?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  {profile?.first_name || user?.email?.split("@")[0]}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {role?.replace("_", " ") || "Admin"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <User className="w-4 h-4 mr-2" />
              Back to App
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
