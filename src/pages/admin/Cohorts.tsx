import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ActiveCohortCard } from "@/components/admin/cohorts/ActiveCohortCard";
import { CohortListTable } from "@/components/admin/cohorts/CohortListTable";
import { CohortFormDialog } from "@/components/admin/cohorts/CohortFormDialog";
import { CohortDetailSheet } from "@/components/admin/cohorts/CohortDetailSheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export interface Cohort {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  spots_taken: number;
  max_participants: number;
  is_active: boolean;
  is_accepting_registrations: boolean;
  created_at: string;
  updated_at: string;
}

export type CohortStatus = "active" | "upcoming" | "completed";

export function getCohortStatus(cohort: Cohort): CohortStatus {
  const now = new Date();
  const startDate = new Date(cohort.start_date);
  const endDate = cohort.end_date ? new Date(cohort.end_date) : null;

  if (endDate && now > endDate) return "completed";
  if (now < startDate) return "upcoming";
  return "active";
}

export default function AdminCohorts() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cohorts")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      setCohorts(data || []);
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      toast.error("Failed to load cohorts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRegistrations = async (cohortId: string, isAccepting: boolean) => {
    try {
      const { error } = await supabase
        .from("cohorts")
        .update({ is_accepting_registrations: isAccepting })
        .eq("id", cohortId);

      if (error) throw error;
      toast.success(isAccepting ? "Registrations opened" : "Registrations paused");
      fetchCohorts();
    } catch (error) {
      console.error("Error toggling registrations:", error);
      toast.error("Failed to update cohort");
    }
  };

  const handleToggleActive = async (cohortId: string, isActive: boolean) => {
    try {
      // If activating, deactivate all others first
      if (isActive) {
        await supabase
          .from("cohorts")
          .update({ is_active: false })
          .neq("id", cohortId);
      }

      const { error } = await supabase
        .from("cohorts")
        .update({ is_active: isActive })
        .eq("id", cohortId);

      if (error) throw error;
      toast.success(isActive ? "Cohort activated" : "Cohort deactivated");
      fetchCohorts();
    } catch (error) {
      console.error("Error toggling active:", error);
      toast.error("Failed to update cohort");
    }
  };

  const handleEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCohort(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchCohorts();
  };

  const activeCohort = cohorts.find((c) => c.is_active);
  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cohorts</h1>
            <p className="text-muted-foreground">Manage challenge cohorts and registrations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCohorts} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Cohort
            </Button>
          </div>
        </div>

        {/* Active Cohort Card */}
        {activeCohort && (
          <ActiveCohortCard
            cohort={activeCohort}
            onToggleRegistrations={(isAccepting) =>
              handleToggleRegistrations(activeCohort.id, isAccepting)
            }
            onViewDetails={() => setSelectedCohortId(activeCohort.id)}
          />
        )}

        {/* Cohort List */}
        <CohortListTable
          cohorts={cohorts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleRegistrations={handleToggleRegistrations}
          onToggleActive={handleToggleActive}
          onViewDetails={setSelectedCohortId}
        />

        {/* Create/Edit Dialog */}
        <CohortFormDialog
          open={isFormOpen}
          onOpenChange={handleFormClose}
          cohort={editingCohort}
          onSuccess={handleFormSuccess}
        />

        {/* Detail Sheet */}
        <CohortDetailSheet
          cohort={selectedCohort}
          open={!!selectedCohortId}
          onOpenChange={(open) => !open && setSelectedCohortId(null)}
          onCohortUpdated={fetchCohorts}
        />
      </div>
    </AdminLayout>
  );
}
