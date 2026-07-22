import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserListTable } from "@/components/admin/users/UserListTable";
import { UserFilters, UserFiltersState } from "@/components/admin/users/UserFilters";
import { UserDetailSheet } from "@/components/admin/users/UserDetailSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { csvRow } from "@/lib/utils";

export interface UserRow {
  id: string;
  first_name: string;
  email: string;
  created_at: string;
  days_completed: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  fb_campaign_id: string | null;
  fb_adset_id: string | null;
  fb_ad_id: string | null;
}

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: UserFiltersState = {
  progressStatus: "all",
  dateFrom: "",
  dateTo: "",
};

export default function AdminUsers() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<UserFiltersState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("admin_list_users", {
        p_search: search || null,
        p_progress_status: filters.progressStatus,
        p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
        p_date_to: filters.dateTo
          ? new Date(`${filters.dateTo}T23:59:59.999Z`).toISOString()
          : null,
        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      });
      if (error) throw error;
      const payload = data as unknown as { rows: UserRow[]; total: number };
      setRows(payload?.rows ?? []);
      setTotal(payload?.total ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [search, filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleExport = async () => {
    try {
      // Fetch up to first 500 matching users for export (server-capped at 100/page).
      const chunks: UserRow[] = [];
      for (let offset = 0; offset < Math.min(total, 500); offset += 100) {
        const { data, error } = await supabase.rpc("admin_list_users", {
          p_search: search || null,
          p_progress_status: filters.progressStatus,
          p_date_from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
          p_date_to: filters.dateTo
            ? new Date(`${filters.dateTo}T23:59:59.999Z`).toISOString()
            : null,
          p_limit: 100,
          p_offset: offset,
        });
        if (error) throw error;
        chunks.push(...(((data as unknown as { rows: UserRow[] })?.rows) ?? []));
      }

      const headers = [
        "First Name",
        "Email",
        "Days Completed",
        "Registered",
        "UTM Source",
        "UTM Medium",
        "UTM Campaign",
        "FB Campaign ID",
        "FB Adset ID",
        "FB Ad ID",
      ];
      const csv = [
        csvRow(headers),
        ...chunks.map((u) =>
          csvRow([
            u.first_name,
            u.email,
            u.days_completed,
            u.created_at,
            u.utm_source ?? "",
            u.utm_medium ?? "",
            u.utm_campaign ?? "",
            u.fb_campaign_id ?? "",
            u.fb_adset_id ?? "",
            u.fb_ad_id ?? "",
          ]),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${chunks.length} users`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  const selectedUser = rows.find((u) => u.id === selectedUserId);

  return (
    <AdminLayout title="Admin · Users">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Early-Access Users</h1>
            <p className="text-muted-foreground">
              {total} {total === 1 ? "user" : "users"}
              {search && ` matching "${search}"`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={total === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
              aria-label="Search users"
            />
          </div>
          <UserFilters
            filters={filters}
            onFiltersChange={(f) => {
              setFilters(f);
              setPage(1);
            }}
          />
        </div>

        <UserListTable
          users={rows}
          isLoading={isLoading}
          onUserClick={(id) => setSelectedUserId(id)}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />

        <UserDetailSheet
          userId={selectedUserId}
          user={selectedUser}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />
      </div>
    </AdminLayout>
  );
}