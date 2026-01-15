import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { eachDayOfInterval, format, startOfDay } from "date-fns";
import type { DateRange } from "./DateRangeSelector";

interface DailyData {
  date: string;
  registrations: number;
  revenue: number;
  completions: number;
  otoConversions: number;
}

interface DailyMetricsChartsProps {
  dateRange: DateRange;
  refreshKey: number;
}

export function DailyMetricsCharts({ dateRange, refreshKey }: DailyMetricsChartsProps) {
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyData();
  }, [dateRange, refreshKey]);

  const fetchDailyData = async () => {
    setIsLoading(true);
    try {
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

      // Fetch registrations
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      // Fetch purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("created_at, amount_cents, product_type")
        .eq("status", "completed")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      // Fetch completions
      const { data: completions } = await supabase
        .from("user_progress")
        .select("completed_at")
        .eq("day_number", 7)
        .eq("is_completed", true)
        .gte("completed_at", dateRange.from.toISOString())
        .lte("completed_at", dateRange.to.toISOString());

      // Build daily data
      const dailyData: DailyData[] = days.map((day) => {
        const dayStart = startOfDay(day);
        const dateStr = format(day, "MMM d");

        const dayRegistrations = profiles?.filter((p) => {
          const pDate = startOfDay(new Date(p.created_at));
          return pDate.getTime() === dayStart.getTime();
        }).length || 0;

        const dayPurchases = purchases?.filter((p) => {
          const pDate = startOfDay(new Date(p.created_at));
          return pDate.getTime() === dayStart.getTime();
        });

        const dayRevenue = dayPurchases?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;
        const dayOto = dayPurchases?.filter((p) => p.product_type === "vip_bundle").length || 0;

        const dayCompletions = completions?.filter((c) => {
          if (!c.completed_at) return false;
          const cDate = startOfDay(new Date(c.completed_at));
          return cDate.getTime() === dayStart.getTime();
        }).length || 0;

        return {
          date: dateStr,
          registrations: dayRegistrations,
          revenue: dayRevenue / 100,
          completions: dayCompletions,
          otoConversions: dayOto,
        };
      });

      setData(dailyData);
    } catch (error) {
      console.error("Error fetching daily data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    registrations: { label: "Registrations", color: "hsl(var(--primary))" },
    revenue: { label: "Revenue", color: "hsl(var(--secondary))" },
    completions: { label: "Completions", color: "hsl(var(--accent))" },
    otoConversions: { label: "OTO Conversions", color: "hsl(217 91% 60%)" },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Registrations */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Daily Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Daily Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Completions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Daily Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* OTO Conversions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Daily OTO Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="otoConversions"
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
