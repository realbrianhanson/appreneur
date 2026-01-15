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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { UserWithProgress } from "@/pages/admin/Users";

interface UserActionsDialogProps {
  userId: string | null;
  user: UserWithProgress | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "grant_vip" | "move_cohort" | "reset_password" | null;
  onSuccess: () => void;
}

export function UserActionsDialog({
  userId,
  user,
  open,
  onOpenChange,
  actionType,
  onSuccess,
}: UserActionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState("");

  useEffect(() => {
    if (actionType === "move_cohort") {
      fetchCohorts();
    }
  }, [actionType]);

  const fetchCohorts = async () => {
    const { data } = await supabase
      .from("cohorts")
      .select("id, name")
      .order("start_date", { ascending: false });
    if (data) setCohorts(data);
  };

  const handleGrantVIP = async () => {
    if (!userId) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_vip: true })
        .eq("id", userId);

      if (error) throw error;

      toast.success("VIP access granted");
      onSuccess();
    } catch (error) {
      console.error("Error granting VIP:", error);
      toast.error("Failed to grant VIP access");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveCohort = async () => {
    if (!userId || !selectedCohortId) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ cohort_id: selectedCohortId })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User moved to new cohort");
      onSuccess();
    } catch (error) {
      console.error("Error moving cohort:", error);
      toast.error("Failed to move user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) throw error;

      toast.success("Password reset email sent");
      onSuccess();
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogContent = () => {
    switch (actionType) {
      case "grant_vip":
        return {
          title: "Grant VIP Access",
          description: `This will grant VIP access to ${user?.first_name}. They'll get access to all VIP content and bonuses.`,
          action: handleGrantVIP,
          actionLabel: "Grant VIP",
        };
      case "move_cohort":
        return {
          title: "Move to Cohort",
          description: `Move ${user?.first_name} to a different cohort.`,
          action: handleMoveCohort,
          actionLabel: "Move User",
        };
      case "reset_password":
        return {
          title: "Reset Password",
          description: `This will send a password reset email to ${user?.email}.`,
          action: handleResetPassword,
          actionLabel: "Send Reset Email",
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        {actionType === "move_cohort" && (
          <div className="space-y-2 py-4">
            <Label>Select Cohort</Label>
            <Select value={selectedCohortId} onValueChange={setSelectedCohortId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a cohort" />
              </SelectTrigger>
              <SelectContent>
                {cohorts.map((cohort) => (
                  <SelectItem key={cohort.id} value={cohort.id}>
                    {cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={content.action}
            disabled={isLoading || (actionType === "move_cohort" && !selectedCohortId)}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {content.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
