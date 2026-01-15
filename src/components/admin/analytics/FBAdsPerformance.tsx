import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, ArrowUpDown, Download } from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "./DateRangeSelector";

interface AdPerformance {
  id: string;
  name: string;
  spend: number;
  leads: number;
  cpl: number;
  sales: number;
  cps: number;
  revenue: number;
  roas: number;
  type: "campaign" | "adset" | "ad";
  parentId?: string;
}

interface FBAdsPerformanceProps {
  dateRange: DateRange;
  refreshKey: number;
}

type SortKey = "name" | "spend" | "leads" | "cpl" | "sales" | "cps" | "revenue" | "roas";

export function FBAdsPerformance({ dateRange, refreshKey }: FBAdsPerformanceProps) {
  const [data, setData] = useState<AdPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState<"campaign" | "adset" | "ad">("campaign");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAdData();
  }, [dateRange, refreshKey]);

  const fetchAdData = async () => {
    setIsLoading(true);
    try {
      const fromDate = dateRange.from.toISOString().split("T")[0];
      const toDate = dateRange.to.toISOString().split("T")[0];

      // Fetch FB ad spend data
      const { data: adSpend } = await supabase
        .from("fb_ad_spend")
        .select("*")
        .gte("date", fromDate)
        .lte("date", toDate);

      // Fetch users with FB attribution
      const { data: users } = await supabase
        .from("profiles")
        .select("id, fb_campaign_id, fb_adset_id, fb_ad_id, created_at")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      // Fetch purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("user_id, amount_cents")
        .eq("status", "completed")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      // Aggregate by campaign
      const campaignMap = new Map<string, AdPerformance>();

      adSpend?.forEach((row) => {
        const existing = campaignMap.get(row.campaign_id) || {
          id: row.campaign_id,
          name: row.campaign_name || row.campaign_id,
          spend: 0,
          leads: 0,
          cpl: 0,
          sales: 0,
          cps: 0,
          revenue: 0,
          roas: 0,
          type: "campaign" as const,
        };

        existing.spend += row.spend_cents / 100;
        campaignMap.set(row.campaign_id, existing);
      });

      // Add user attribution
      users?.forEach((user) => {
        if (user.fb_campaign_id && campaignMap.has(user.fb_campaign_id)) {
          const campaign = campaignMap.get(user.fb_campaign_id)!;
          campaign.leads += 1;

          // Check for purchases
          const userPurchases = purchases?.filter((p) => p.user_id === user.id) || [];
          if (userPurchases.length > 0) {
            campaign.sales += 1;
            campaign.revenue += userPurchases.reduce((sum, p) => sum + p.amount_cents, 0) / 100;
          }
        }
      });

      // Calculate derived metrics
      campaignMap.forEach((campaign) => {
        campaign.cpl = campaign.leads > 0 ? campaign.spend / campaign.leads : 0;
        campaign.cps = campaign.sales > 0 ? campaign.spend / campaign.sales : 0;
        campaign.roas = campaign.spend > 0 ? campaign.revenue / campaign.spend : 0;
      });

      setData(Array.from(campaignMap.values()));
    } catch (error) {
      console.error("Error fetching ad data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleExport = () => {
    const headers = ["Campaign", "Spend", "Leads", "CPL", "Sales", "CPS", "Revenue", "ROAS"];
    const rows = sortedData.map((d) => [
      d.name,
      d.spend.toFixed(2),
      d.leads,
      d.cpl.toFixed(2),
      d.sales,
      d.cps.toFixed(2),
      d.revenue.toFixed(2),
      d.roas.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fb-ads-performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported FB Ads data");
  };

  const getRoasBadge = (roas: number) => {
    if (roas >= 3) return <Badge className="bg-green-500/20 text-green-500">{roas.toFixed(2)}x</Badge>;
    if (roas >= 1) return <Badge className="bg-yellow-500/20 text-yellow-500">{roas.toFixed(2)}x</Badge>;
    return <Badge className="bg-red-500/20 text-red-500">{roas.toFixed(2)}x</Badge>;
  };

  const SortableHeader = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 text-foreground"
      onClick={() => handleSort(key)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Facebook Ads Performance</CardTitle>
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
        <CardTitle className="text-foreground">Facebook Ads Performance</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No FB Ads data for this period. Make sure your ads are tracked with proper attribution.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <SortableHeader label="Campaign" sortKey="name" />
                  <SortableHeader label="Spend" sortKey="spend" />
                  <SortableHeader label="Leads" sortKey="leads" />
                  <SortableHeader label="CPL" sortKey="cpl" />
                  <SortableHeader label="Sales" sortKey="sales" />
                  <SortableHeader label="CPS" sortKey="cps" />
                  <SortableHeader label="Revenue" sortKey="revenue" />
                  <SortableHeader label="ROAS" sortKey="roas" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        {row.name}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">${row.spend.toFixed(2)}</TableCell>
                    <TableCell className="text-foreground">{row.leads}</TableCell>
                    <TableCell className="text-foreground">
                      {row.cpl > 0 ? `$${row.cpl.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-foreground">{row.sales}</TableCell>
                    <TableCell className="text-foreground">
                      {row.cps > 0 ? `$${row.cps.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-foreground">${row.revenue.toFixed(2)}</TableCell>
                    <TableCell>{getRoasBadge(row.roas)}</TableCell>
                  </TableRow>
                ))}
                {/* Totals Row */}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell className="text-foreground">Total</TableCell>
                  <TableCell className="text-foreground">
                    ${sortedData.reduce((s, r) => s + r.spend, 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {sortedData.reduce((s, r) => s + r.leads, 0)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {(() => {
                      const totalSpend = sortedData.reduce((s, r) => s + r.spend, 0);
                      const totalLeads = sortedData.reduce((s, r) => s + r.leads, 0);
                      return totalLeads > 0 ? `$${(totalSpend / totalLeads).toFixed(2)}` : "—";
                    })()}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {sortedData.reduce((s, r) => s + r.sales, 0)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {(() => {
                      const totalSpend = sortedData.reduce((s, r) => s + r.spend, 0);
                      const totalSales = sortedData.reduce((s, r) => s + r.sales, 0);
                      return totalSales > 0 ? `$${(totalSpend / totalSales).toFixed(2)}` : "—";
                    })()}
                  </TableCell>
                  <TableCell className="text-foreground">
                    ${sortedData.reduce((s, r) => s + r.revenue, 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const totalSpend = sortedData.reduce((s, r) => s + r.spend, 0);
                      const totalRevenue = sortedData.reduce((s, r) => s + r.revenue, 0);
                      return getRoasBadge(totalSpend > 0 ? totalRevenue / totalSpend : 0);
                    })()}
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
