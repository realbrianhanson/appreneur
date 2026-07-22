import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DateRangeSelector, DateRange, getDateRange } from "@/components/admin/analytics/DateRangeSelector";
import { FunnelVisualization } from "@/components/admin/analytics/FunnelVisualization";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("last_30_days"));
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AdminLayout title="Admin · Analytics">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              First-party funnel data. External analytics are off during prelaunch.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <Button variant="outline" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <FunnelVisualization dateRange={dateRange} refreshKey={refreshKey} />
      </div>
    </AdminLayout>
  );
}