import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_STATUS, VIP_SALES_ENABLED, TOTAL_DAYS } from "@/lib/constants";
import { Rocket, CreditCard, Mail, Webhook, Shield } from "lucide-react";

/**
 * Release status dashboard. Read-only. All values below reflect the deployed
 * product state — no fake toggles or "save" buttons.
 */
export default function AdminSettings() {
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    // Best-effort probe: look at recent registration_deliveries. If any recent
    // row shows a status other than "not_configured", email is configured.
    (async () => {
      const { data } = await supabase
        .from("registration_deliveries")
        .select("email_status")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (!data || data.length === 0) {
        setEmailConfigured(null);
        return;
      }
      const anyReal = data.some((r) => r.email_status && r.email_status !== "not_configured");
      setEmailConfigured(anyReal);
    })();
  }, []);

  return (
    <AdminLayout requiredRole="super_admin" title="Admin · Release status">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Release status</h1>
          <p className="text-muted-foreground">
            Read-only view of the deployed product configuration. To change any of these,
            update <code className="text-foreground">src/lib/constants.ts</code> and redeploy.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Rocket className="w-5 h-5" /> Product
            </CardTitle>
            <CardDescription>Runtime feature flags baked into this build.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusRow label="Product status" value={PRODUCT_STATUS} />
            <StatusRow label="Challenge length" value={`${TOTAL_DAYS} days (self-paced)`} />
            <StatusRow
              label="VIP sales"
              value={VIP_SALES_ENABLED ? "Enabled" : "Disabled"}
              tone={VIP_SALES_ENABLED ? "ok" : "muted"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Mail className="w-5 h-5" /> Delivery integrations
            </CardTitle>
            <CardDescription>
              Inferred from the last 20 registration deliveries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusRow
              label="Welcome email (Resend)"
              value={
                emailConfigured === null
                  ? "No deliveries yet"
                  : emailConfigured
                  ? "Configured"
                  : "Not configured"
              }
              tone={emailConfigured ? "ok" : "muted"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5" /> Payments
            </CardTitle>
            <CardDescription>Checkout is fail-closed while VIP sales are disabled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusRow
              label="Stripe checkout"
              value={VIP_SALES_ENABLED ? "Enabled" : "Fail-closed (HTTP 503)"}
              tone={VIP_SALES_ENABLED ? "ok" : "muted"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Webhook className="w-5 h-5" /> Outgoing webhooks
            </CardTitle>
            <CardDescription>
              Managed in <a href="/admin/webhooks" className="text-primary hover:underline">Admin → Webhooks</a>.
              SSRF guard blocks private and loopback destinations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatusRow label="SSRF guard" value="Enforced on save and on delivery" tone="ok" />
            <StatusRow label="Retry policy" value="3 attempts, bounded backoff" />
            <StatusRow label="Delivery timeout" value="10 seconds" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="w-5 h-5" /> Access
            </CardTitle>
            <CardDescription>
              Roles are stored in the <code>user_roles</code> table and enforced via RLS.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            To grant or revoke admin access, update the <code>user_roles</code> table via a
            trusted admin script or migration.
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatusRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "ok" | "muted" | "default";
}) {
  const variant =
    tone === "ok" ? "default" : tone === "muted" ? "secondary" : "outline";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant={variant}>{value}</Badge>
    </div>
  );
}