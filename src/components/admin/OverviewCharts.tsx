import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface ChartData {
  date: string;
  registrations: number;
  revenue: number;
}

interface FunnelData {
  stage: string;
  count: number;
}

interface DayCompletionData {
  day: string;
  completed: number;
}

export function OverviewCharts() {
  const [timeSeriesData, setTimeSeriesData] = useState<ChartData[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [dayCompletionData, setDayCompletionData] = useState<DayCompletionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });

      // Fetch registrations
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Fetch purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("created_at, amount_cents")
        .eq("status", "completed")
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Build time series data
      const chartData: ChartData[] = days.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayStart = startOfDay(day);

        const regs = profiles?.filter((p) => {
          const pDate = startOfDay(new Date(p.created_at));
          return pDate.getTime() === dayStart.getTime();
        }).length || 0;

        const rev = purchases
          ?.filter((p) => {
            const pDate = startOfDay(new Date(p.created_at));
            return pDate.getTime() === dayStart.getTime();
          })
          .reduce((sum, p) => sum + p.amount_cents, 0) || 0;

        return {
          date: format(day, "MMM d"),
          registrations: regs,
          revenue: rev / 100,
        };
      });

      setTimeSeriesData(chartData);

      // Fetch funnel data
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, is_vip");

      const { data: allPurchases } = await supabase
        .from("purchases")
        .select("user_id, product_type")
        .eq("status", "completed");

      const { data: completions } = await supabase
        .from("user_progress")
        .select("user_id")
        .eq("day_number", 7)
        .eq("is_completed", true);

      const totalRegistered = allProfiles?.length || 0;
      const vipCount = allProfiles?.filter((p) => p.is_vip).length || 0;
      const completedCount = completions?.length || 0;
      const proCount = allPurchases?.filter(
        (p) => p.product_type === "pro_monthly" || p.product_type === "pro_annual"
      ).length || 0;

      setFunnelData([
        { stage: "Registered", count: totalRegistered },
        { stage: "VIP", count: vipCount },
        { stage: "Completed", count: completedCount },
        { stage: "Pro", count: proCount },
      ]);

      // Fetch day completion data
      const { data: dayProgress } = await supabase
        .from("user_progress")
        .select("day_number")
        .eq("is_completed", true);

      const dayCounts = [1, 2, 3, 4, 5, 6, 7].map((day) => ({
        day: `Day ${day}`,
        completed: dayProgress?.filter((p) => p.day_number === day).length || 0,
      }));

      setDayCompletionData(dayCounts);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    registrations: {
      label: "Registrations",
      color: "hsl(var(--primary))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--secondary))",
    },
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--accent))",
    },
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[250px] bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Registrations Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Registrations (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
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

      {/* Revenue Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Revenue (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
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

      {/* Funnel Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                dataKey="stage" 
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={80}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Day Completion Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Completion by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px]">
            <BarChart data={dayCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="completed" fill="hsl(var(--accent))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
