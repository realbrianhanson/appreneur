import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { OverviewCharts } from "@/components/admin/OverviewCharts";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  UserPlus,
  DollarSign,
  Activity,
  Trophy,
  Users,
  Target,
  Percent,
  TrendingUp,
  Plus,
  Download,
  Send,
} from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";

interface OverviewStats {
  registrationsToday: number;
  revenueToday: number;
  activeUsersToday: number;
  completionsToday: number;
  cohortRegistrations: number;
  spotsRemaining: number;
  otoConversionRate: number;
  completionRate: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>({
    registrationsToday: 0,
    revenueToday: 0,
    activeUsersToday: 0,
    completionsToday: 0,
    cohortRegistrations: 0,
    spotsRemaining: 0,
    otoConversionRate: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const todayStart = startOfDay(new Date()).toISOString();
      const todayEnd = endOfDay(new Date()).toISOString();

      // Today's registrations
      const { count: regCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd);

      // Today's revenue
      const { data: todayPurchases } = await supabase
        .from("purchases")
        .select("amount_cents")
        .eq("status", "completed")
        .gte("created_at", todayStart)
        .lte("created_at", todayEnd);

      const revenueToday = todayPurchases?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      // Today's completions (Day 5)
      const { count: completionsCount } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("day_number", 5)
        .eq("is_completed", true)
        .gte("completed_at", todayStart)
        .lte("completed_at", todayEnd);

      // Active cohort stats
      const { data: activeCohort } = await supabase
        .from("cohorts")
        .select("*")
        .eq("is_active", true)
        .single();

      // Total registrations for active cohort
      let cohortRegs = 0;
      let spotsLeft = 500;
      if (activeCohort) {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("cohort_id", activeCohort.id);
        cohortRegs = count || 0;
        spotsLeft = activeCohort.max_participants - (activeCohort.spots_taken || 0);
      }

      // OTO conversion rate (VIP purchases / total registrations)
      const { count: totalProfiles } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: vipPurchases } = await supabase
        .from("purchases")
        .select("*", { count: "exact", head: true })
        .eq("product_type", "vip_bundle")
        .eq("status", "completed");

      const otoRate = totalProfiles && totalProfiles > 0 
        ? ((vipPurchases || 0) / totalProfiles) * 100 
        : 0;

      // Completion rate (Day 7 completions / total registrations)
      const { count: totalCompletions } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("day_number", 7)
        .eq("is_completed", true);

      const compRate = totalProfiles && totalProfiles > 0 
        ? ((totalCompletions || 0) / totalProfiles) * 100 
        : 0;

      // Active users today (users who logged in/made progress today)
      // Using user_progress updates as proxy for activity
      const { data: activeProgress } = await supabase
        .from("user_progress")
        .select("user_id")
        .gte("updated_at", todayStart)
        .lte("updated_at", todayEnd);

      const uniqueActiveUsers = new Set(activeProgress?.map(p => p.user_id) || []).size;

      setStats({
        registrationsToday: regCount || 0,
        revenueToday: revenueToday / 100,
        activeUsersToday: uniqueActiveUsers,
        completionsToday: completionsCount || 0,
        cohortRegistrations: cohortRegs,
        spotsRemaining: spotsLeft,
        otoConversionRate: Math.round(otoRate * 10) / 10,
        completionRate: Math.round(compRate * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const { data: users } = await supabase
        .from("profiles")
        .select("first_name, email, phone, created_at, is_vip")
        .order("created_at", { ascending: false });

      if (!users) return;

      const csv = [
        ["First Name", "Email", "Phone", "Created At", "Is VIP"].join(","),
        ...users.map((u) =>
          [u.first_name, u.email, u.phone || "", u.created_at, u.is_vip].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Monitor your challenge performance</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Cohort
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportUsers}>
              <Download className="w-4 h-4 mr-2" />
              Export Users
            </Button>
            <Button variant="default" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Broadcast SMS
            </Button>
          </div>
        </div>

        {/* Today Stats */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Today</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="New Registrations"
              value={isLoading ? "..." : stats.registrationsToday}
              icon={<UserPlus className="w-5 h-5" />}
            />
            <StatsCard
              title="Revenue Today"
              value={isLoading ? "..." : `$${stats.revenueToday.toLocaleString()}`}
              icon={<DollarSign className="w-5 h-5" />}
            />
            <StatsCard
              title="Active Users"
              value={isLoading ? "..." : stats.activeUsersToday}
              icon={<Activity className="w-5 h-5" />}
            />
            <StatsCard
              title="Completions"
              value={isLoading ? "..." : stats.completionsToday}
              icon={<Trophy className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Cohort Stats */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Current Cohort</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Registrations"
              value={isLoading ? "..." : stats.cohortRegistrations}
              icon={<Users className="w-5 h-5" />}
            />
            <StatsCard
              title="Spots Remaining"
              value={isLoading ? "..." : stats.spotsRemaining}
              icon={<Target className="w-5 h-5" />}
            />
            <StatsCard
              title="OTO Conversion"
              value={isLoading ? "..." : `${stats.otoConversionRate}%`}
              icon={<Percent className="w-5 h-5" />}
            />
            <StatsCard
              title="Completion Rate"
              value={isLoading ? "..." : `${stats.completionRate}%`}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>
        </div>

        {/* Charts */}
        <OverviewCharts />

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Placeholder for future content */}
          </div>
          <div>
            <RecentActivityFeed />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
