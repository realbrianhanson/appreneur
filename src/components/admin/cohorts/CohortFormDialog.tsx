import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { addDays, format } from "date-fns";
import type { Cohort } from "@/pages/admin/Cohorts";

interface CohortFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cohort: Cohort | null;
  onSuccess: () => void;
}

export function CohortFormDialog({
  open,
  onOpenChange,
  cohort,
  onSuccess,
}: CohortFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    max_participants: 500,
    is_accepting_registrations: true,
  });

  const isEditing = !!cohort;

  useEffect(() => {
    if (cohort) {
      setFormData({
        name: cohort.name,
        start_date: cohort.start_date.split("T")[0],
        end_date: cohort.end_date?.split("T")[0] || "",
        max_participants: cohort.max_participants,
        is_accepting_registrations: cohort.is_accepting_registrations,
      });
    } else {
      // Default: start tomorrow, end 7 days later
      const tomorrow = addDays(new Date(), 1);
      const endDate = addDays(tomorrow, 7);
      setFormData({
        name: "",
        start_date: format(tomorrow, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        max_participants: 500,
        is_accepting_registrations: true,
      });
    }
    setError(null);
  }, [cohort, open]);

  const handleStartDateChange = (date: string) => {
    const startDate = new Date(date);
    const endDate = addDays(startDate, 7);
    setFormData({
      ...formData,
      start_date: date,
      end_date: format(endDate, "yyyy-MM-dd"),
    });
  };

  const handleSubmit = async () => {
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!formData.start_date) {
      setError("Start date is required");
      return;
    }

    // Check if reducing max below current spots
    if (isEditing && cohort && formData.max_participants < cohort.spots_taken) {
      setError(
        `Cannot reduce max participants below current registrations (${cohort.spots_taken})`
      );
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date
          ? new Date(formData.end_date).toISOString()
          : null,
        max_participants: formData.max_participants,
        is_accepting_registrations: formData.is_accepting_registrations,
      };

      if (isEditing && cohort) {
        const { error } = await supabase
          .from("cohorts")
          .update(payload)
          .eq("id", cohort.id);

        if (error) throw error;
        toast.success("Cohort updated");
      } else {
        const { error } = await supabase.from("cohorts").insert(payload);

        if (error) throw error;
        toast.success("Cohort created");
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving cohort:", err);
      toast.error("Failed to save cohort");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Cohort" : "Create New Cohort"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update cohort settings. Changes take effect immediately."
              : "Create a new challenge cohort for participants."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Cohort Name</Label>
            <Input
              id="name"
              placeholder="e.g., February 2025 Cohort"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Auto-calculates 7 days from start
              </p>
            </div>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants</Label>
            <Input
              id="max_participants"
              type="number"
              min={isEditing && cohort ? cohort.spots_taken : 1}
              value={formData.max_participants}
              onChange={(e) =>
                setFormData({ ...formData, max_participants: parseInt(e.target.value) || 500 })
              }
            />
            {isEditing && cohort && (
              <p className="text-xs text-muted-foreground">
                Current registrations: {cohort.spots_taken}
              </p>
            )}
          </div>

          {/* Accepting Registrations */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_accepting_registrations"
              checked={formData.is_accepting_registrations}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_accepting_registrations: checked as boolean })
              }
            />
            <Label htmlFor="is_accepting_registrations" className="cursor-pointer">
              Accept registrations immediately
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Cohort"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
