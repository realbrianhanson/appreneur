import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";

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
        <DashboardSidebar userName={userName} currentDay={currentDay} isVIP={isVIP} />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardTopBar userName={userName} />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export { DashboardLayout };
