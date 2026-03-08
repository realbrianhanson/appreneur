import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  requiredRole?: "super_admin" | "admin" | "support";
}

export function AdminLayout({ children, requiredRole }: AdminLayoutProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isAdmin, isSuperAdmin, isSupport, role, isLoading: roleLoading } = useAdminRole();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Skip auth checks in development
  const isDev = import.meta.env.DEV;
  const isLoading = isDev ? false : (authLoading || roleLoading);

  // Check access level
  const hasAccess = () => {
    if (isDev) return true;
    if (!isAdmin && !isSupport) return false;
    
    if (requiredRole === "super_admin") return isSuperAdmin;
    if (requiredRole === "admin") return isAdmin;
    if (requiredRole === "support") return isAdmin || isSupport;
    
    return isAdmin || isSupport;
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess() && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Access denied. You don't have admin privileges.");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDev) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasAccess()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <AdminTopBar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
