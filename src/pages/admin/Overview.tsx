import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  UserPlus,
  Activity,
  Trophy,
  Users,
  Percent,
  Mail,
  Webhook as WebhookIcon,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface DeliveryStats {
  sent: number;
  failed: number;
  pending: number;
  not_configured?: number;
  total: number;
}

interface OverviewStats {
  registrations_today: number;
  total_users: number;
  active_last_7_days: number;
  day5_completions: number;
  completion_rate: number;
  email_delivery: DeliveryStats;
  webhook_delivery: DeliveryStats;
}

const EMPTY: OverviewStats = {
  registrations_today: 0,
  total_users: 0,
  active_last_7_days: 0,
  day5_completions: 0,
  completion_rate: 0,
  email_delivery: { sent: 0, failed: 0, pending: 0, not_configured: 0, total: 0 },
  webhook_delivery: { sent: 0, failed: 0, pending: 0, total: 0 },
};

export default function AdminOverview() {
  const [stats, setStats] = useState<OverviewStats>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("admin_overview_stats");
      if (error) throw error;
      setStats((data as unknown as OverviewStats) ?? EMPTY);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load stats";
      setError(msg);
      toast.error("Could not load overview stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dash = (n: number | undefined) => (isLoading ? "…" : String(n ?? 0));

  return (
    <AdminLayout title="Admin · Overview">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prelaunch Overview</h1>
            <p className="text-muted-foreground">
              Free early-access signups, learner activity, and delivery health.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Signups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Registrations Today" value={dash(stats.registrations_today)} icon={<UserPlus className="w-5 h-5" />} />
            <StatsCard title="Total Early-Access Users" value={dash(stats.total_users)} icon={<Users className="w-5 h-5" />} />
            <StatsCard title="Active (Last 7 Days)" value={dash(stats.active_last_7_days)} icon={<Activity className="w-5 h-5" />} />
            <StatsCard title="Day 5 Completions" value={dash(stats.day5_completions)} icon={<Trophy className="w-5 h-5" />} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Engagement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Completion Rate"
              value={isLoading ? "…" : `${stats.completion_rate ?? 0}%`}
              icon={<Percent className="w-5 h-5" />}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Completion rate = Day 5 completions ÷ total registrations. It stays at 0% until
            lessons open and learners finish the challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Mail className="w-4 h-4" /> Welcome email delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <DeliveryRow label="Sent" value={stats.email_delivery.sent} total={stats.email_delivery.total} tone="ok" />
              <DeliveryRow label="Pending" value={stats.email_delivery.pending} total={stats.email_delivery.total} tone="muted" />
              <DeliveryRow label="Failed" value={stats.email_delivery.failed} total={stats.email_delivery.total} tone="bad" />
              <DeliveryRow label="Not configured" value={stats.email_delivery.not_configured ?? 0} total={stats.email_delivery.total} tone="muted" />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <WebhookIcon className="w-4 h-4" /> user.registered webhook delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <DeliveryRow label="Sent" value={stats.webhook_delivery.sent} total={stats.webhook_delivery.total} tone="ok" />
              <DeliveryRow label="Pending" value={stats.webhook_delivery.pending} total={stats.webhook_delivery.total} tone="muted" />
              <DeliveryRow label="Failed" value={stats.webhook_delivery.failed} total={stats.webhook_delivery.total} tone="bad" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function DeliveryRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "ok" | "bad" | "muted";
}) {
  const color =
    tone === "ok"
      ? "text-green-500"
      : tone === "bad"
      ? "text-destructive"
      : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={color}>
        {value}
        <span className="text-muted-foreground"> / {total}</span>
      </span>
    </div>
  );
}