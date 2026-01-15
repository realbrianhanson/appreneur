import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DateRangeSelector, DateRange, getDateRange } from "@/components/admin/analytics/DateRangeSelector";
import { FunnelVisualization } from "@/components/admin/analytics/FunnelVisualization";
import { FBAdsPerformance } from "@/components/admin/analytics/FBAdsPerformance";
import { CohortAnalysis } from "@/components/admin/analytics/CohortAnalysis";
import { DailyMetricsCharts } from "@/components/admin/analytics/DailyMetricsCharts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>(getDateRange("last_30_days"));
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    toast.success("Refreshing data...");
  };

  const handleExportAll = async () => {
    // Export all analytics data
    toast.success("Exporting analytics data...");
    // Implementation would create CSV of current view
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track performance and optimize your funnel</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Funnel Visualization */}
        <FunnelVisualization dateRange={dateRange} refreshKey={refreshKey} />

        {/* Daily Metrics */}
        <DailyMetricsCharts dateRange={dateRange} refreshKey={refreshKey} />

        {/* FB Ads Performance */}
        <FBAdsPerformance dateRange={dateRange} refreshKey={refreshKey} />

        {/* Cohort Analysis */}
        <CohortAnalysis refreshKey={refreshKey} />
      </div>
    </AdminLayout>
  );
}
