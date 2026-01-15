import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserListTable } from "@/components/admin/users/UserListTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { UserDetailSheet } from "@/components/admin/users/UserDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface UserWithProgress {
  id: string;
  first_name: string;
  email: string;
  phone: string | null;
  cohort_id: string | null;
  cohort_name?: string;
  is_vip: boolean;
  created_at: string;
  current_day: number;
  days_completed: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  fb_campaign_id: string | null;
  fb_adset_id: string | null;
  fb_ad_id: string | null;
}

export interface UserFiltersState {
  cohortId: string;
  vipStatus: "all" | "yes" | "no";
  progressStatus: "all" | "not_started" | "in_progress" | "completed";
  dateFrom: string;
  dateTo: string;
}

const ITEMS_PER_PAGE = 50;

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFiltersState>({
    cohortId: "all",
    vipStatus: "all",
    progressStatus: "all",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch cohorts
      const { data: cohortsData } = await supabase
        .from("cohorts")
        .select("id, name")
        .order("start_date", { ascending: false });

      if (cohortsData) {
        setCohorts(cohortsData);
      }

      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch progress for all users
      const { data: progress } = await supabase
        .from("user_progress")
        .select("user_id, day_number, is_completed");

      // Build user data with progress
      const usersWithProgress: UserWithProgress[] = (profiles || []).map((profile) => {
        const userProgress = progress?.filter((p) => p.user_id === profile.id) || [];
        const completedDays = userProgress.filter((p) => p.is_completed).length;
        const currentDay = userProgress.reduce((max, p) => {
          if (p.is_completed) return Math.max(max, p.day_number + 1);
          return max;
        }, 1);

        const cohort = cohortsData?.find((c) => c.id === profile.cohort_id);

        return {
          id: profile.id,
          first_name: profile.first_name,
          email: profile.email,
          phone: profile.phone,
          cohort_id: profile.cohort_id,
          cohort_name: cohort?.name || "None",
          is_vip: profile.is_vip,
          created_at: profile.created_at,
          current_day: Math.min(currentDay, 7),
          days_completed: completedDays,
          utm_source: profile.utm_source,
          utm_medium: profile.utm_medium,
          utm_campaign: profile.utm_campaign,
          fb_campaign_id: profile.fb_campaign_id,
          fb_adset_id: profile.fb_adset_id,
          fb_ad_id: profile.fb_ad_id,
        };
      });

      setUsers(usersWithProgress);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.first_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Cohort filter
      if (filters.cohortId !== "all" && user.cohort_id !== filters.cohortId) {
        return false;
      }

      // VIP filter
      if (filters.vipStatus === "yes" && !user.is_vip) return false;
      if (filters.vipStatus === "no" && user.is_vip) return false;

      // Progress filter
      if (filters.progressStatus === "not_started" && user.days_completed > 0) return false;
      if (filters.progressStatus === "in_progress" && (user.days_completed === 0 || user.days_completed >= 7)) return false;
      if (filters.progressStatus === "completed" && user.days_completed < 7) return false;

      // Date range filter
      if (filters.dateFrom) {
        const userDate = new Date(user.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (userDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const userDate = new Date(user.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (userDate > toDate) return false;
      }

      return true;
    });
  }, [users, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExport = () => {
    const headers = [
      "First Name",
      "Email",
      "Phone",
      "Cohort",
      "VIP",
      "Days Completed",
      "Registered",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "FB Campaign ID",
      "FB Adset ID",
      "FB Ad ID",
    ];

    const rows = filteredUsers.map((u) => [
      u.first_name,
      u.email,
      u.phone || "",
      u.cohort_name || "",
      u.is_vip ? "Yes" : "No",
      u.days_completed,
      new Date(u.created_at).toLocaleDateString(),
      u.utm_source || "",
      u.utm_medium || "",
      u.utm_campaign || "",
      u.fb_campaign_id || "",
      u.fb_adset_id || "",
      u.fb_ad_id || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredUsers.length} users`);
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">
              {filteredUsers.length} users {searchQuery && `matching "${searchQuery}"`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <UserFilters
            filters={filters}
            onFiltersChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            cohorts={cohorts}
          />
        </div>

        {/* Table */}
        <UserListTable
          users={paginatedUsers}
          isLoading={isLoading}
          onUserClick={(userId) => setSelectedUserId(userId)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={filteredUsers.length}
        />

        {/* User Detail Sheet */}
        <UserDetailSheet
          userId={selectedUserId}
          user={selectedUser}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
          onUserUpdated={fetchData}
        />
      </div>
    </AdminLayout>
  );
}
