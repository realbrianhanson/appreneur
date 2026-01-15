import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface CohortMetrics {
  id: string;
  name: string;
  registered: number;
  otoPercent: number;
  completionPercent: number;
  proPercent: number;
  revenue: number;
  ltv: number;
}

interface CohortAnalysisProps {
  refreshKey: number;
}

export function CohortAnalysis({ refreshKey }: CohortAnalysisProps) {
  const [cohorts, setCohorts] = useState<CohortMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCohortData();
  }, [refreshKey]);

  const fetchCohortData = async () => {
    setIsLoading(true);
    try {
      // Fetch all cohorts
      const { data: cohortsData } = await supabase
        .from("cohorts")
        .select("id, name")
        .order("start_date", { ascending: false });

      if (!cohortsData) {
        setCohorts([]);
        return;
      }

      // Fetch all profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, cohort_id, is_vip");

      // Fetch all purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("user_id, product_type, amount_cents")
        .eq("status", "completed");

      // Fetch day 7 completions
      const { data: completions } = await supabase
        .from("user_progress")
        .select("user_id")
        .eq("day_number", 7)
        .eq("is_completed", true);

      const completedUserIds = new Set(completions?.map((c) => c.user_id) || []);

      // Calculate metrics per cohort
      const cohortMetrics: CohortMetrics[] = cohortsData.map((cohort) => {
        const cohortUsers = profiles?.filter((p) => p.cohort_id === cohort.id) || [];
        const cohortUserIds = new Set(cohortUsers.map((u) => u.id));
        
        const registered = cohortUsers.length;
        
        // OTO purchases (VIP bundle)
        const otoPurchases = purchases?.filter(
          (p) => cohortUserIds.has(p.user_id) && p.product_type === "vip_bundle"
        ).length || 0;
        
        // Pro purchases
        const proPurchases = purchases?.filter(
          (p) => cohortUserIds.has(p.user_id) && 
                 (p.product_type === "pro_monthly" || p.product_type === "pro_annual")
        ).length || 0;
        
        // Completions
        const cohortCompletions = cohortUsers.filter((u) => completedUserIds.has(u.id)).length;
        
        // Revenue
        const cohortRevenue = purchases
          ?.filter((p) => cohortUserIds.has(p.user_id))
          .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

        return {
          id: cohort.id,
          name: cohort.name,
          registered,
          otoPercent: registered > 0 ? (otoPurchases / registered) * 100 : 0,
          completionPercent: registered > 0 ? (cohortCompletions / registered) * 100 : 0,
          proPercent: registered > 0 ? (proPurchases / registered) * 100 : 0,
          revenue: cohortRevenue / 100,
          ltv: registered > 0 ? cohortRevenue / 100 / registered : 0,
        };
      });

      setCohorts(cohortMetrics);
    } catch (error) {
      console.error("Error fetching cohort data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ["Cohort", "Registered", "OTO %", "Completion %", "Pro %", "Revenue", "LTV"];
    const rows = cohorts.map((c) => [
      c.name,
      c.registered,
      c.otoPercent.toFixed(1),
      c.completionPercent.toFixed(1),
      c.proPercent.toFixed(1),
      c.revenue.toFixed(2),
      c.ltv.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cohort-analysis-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported cohort analysis");
  };

  const getPercentBadge = (percent: number, thresholds: [number, number] = [25, 50]) => {
    if (percent >= thresholds[1]) {
      return <Badge className="bg-green-500/20 text-green-500">{percent.toFixed(1)}%</Badge>;
    }
    if (percent >= thresholds[0]) {
      return <Badge className="bg-yellow-500/20 text-yellow-500">{percent.toFixed(1)}%</Badge>;
    }
    return <Badge className="bg-red-500/20 text-red-500">{percent.toFixed(1)}%</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Cohort Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Cohort Analysis</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {cohorts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No cohorts found. Create your first cohort to see analysis.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Cohort</TableHead>
                  <TableHead className="text-foreground text-right">Registered</TableHead>
                  <TableHead className="text-foreground text-center">OTO %</TableHead>
                  <TableHead className="text-foreground text-center">Completion %</TableHead>
                  <TableHead className="text-foreground text-center">Pro %</TableHead>
                  <TableHead className="text-foreground text-right">Revenue</TableHead>
                  <TableHead className="text-foreground text-right">LTV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohorts.map((cohort) => (
                  <TableRow key={cohort.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      {cohort.name}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {cohort.registered}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPercentBadge(cohort.otoPercent, [10, 20])}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPercentBadge(cohort.completionPercent, [30, 50])}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPercentBadge(cohort.proPercent, [5, 15])}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      ${cohort.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      ${cohort.ltv.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Average Row */}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell className="text-foreground">Average</TableCell>
                  <TableCell className="text-right text-foreground">
                    {Math.round(cohorts.reduce((s, c) => s + c.registered, 0) / cohorts.length)}
                  </TableCell>
                  <TableCell className="text-center">
                    {(cohorts.reduce((s, c) => s + c.otoPercent, 0) / cohorts.length).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {(cohorts.reduce((s, c) => s + c.completionPercent, 0) / cohorts.length).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    {(cohorts.reduce((s, c) => s + c.proPercent, 0) / cohorts.length).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    ${Math.round(cohorts.reduce((s, c) => s + c.revenue, 0) / cohorts.length).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    ${(cohorts.reduce((s, c) => s + c.ltv, 0) / cohorts.length).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
