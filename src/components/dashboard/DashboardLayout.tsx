import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
  currentDay?: number;
  isVIP?: boolean;
}

const DashboardLayout = ({
  children,
  userName = "Builder",
  currentDay = 3,
  isVIP = false,
}: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <DashboardSidebar userName={userName} currentDay={currentDay} isVIP={isVIP} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopBar userName={userName} />
          <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">{children}</main>
        </div>
        {/* Mobile bottom navigation */}
        <MobileBottomNav currentDay={currentDay} isVIP={isVIP} />
      </div>
    </SidebarProvider>
  );
};

export { DashboardLayout };
