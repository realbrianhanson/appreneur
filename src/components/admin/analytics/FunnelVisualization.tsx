import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { DateRange } from "./DateRangeSelector";

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

interface FunnelVisualizationProps {
  dateRange: DateRange;
  refreshKey: number;
}

export function FunnelVisualization({ dateRange, refreshKey }: FunnelVisualizationProps) {
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, [dateRange, refreshKey]);

  const fetchFunnelData = async () => {
    setIsLoading(true);
    try {
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Fetch funnel events
      const { data: events } = await supabase
        .from("funnel_events")
        .select("event_type")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      // Count events by type
      const eventCounts: Record<string, number> = {};
      events?.forEach((e) => {
        eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
      });

      // Fetch registrations
      const { count: registrations } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      // Fetch purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("product_type, user_id")
        .eq("status", "completed")
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      const otoPurchases = purchases?.filter((p) => p.product_type === "vip_bundle").length || 0;
      const proPurchases = purchases?.filter(
        (p) => p.product_type === "pro_monthly" || p.product_type === "pro_annual"
      ).length || 0;

      // Fetch day completions
      const { count: day1Completed } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("day_number", 1)
        .eq("is_completed", true)
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      const { count: day7Completed } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })
        .eq("day_number", 7)
        .eq("is_completed", true)
        .gte("created_at", fromDate)
        .lte("created_at", toDate);

      // Build funnel steps
      const landingViews = eventCounts["page_view"] || eventCounts["landing_view"] || 0;
      const quizStarted = eventCounts["quiz_started"] || 0;
      const quizCompleted = eventCounts["quiz_completed"] || 0;
      const registered = registrations || 0;
      const otoViewed = eventCounts["oto_viewed"] || eventCounts["vip_offer_viewed"] || 0;
      const otoPurchased = otoPurchases;
      const challengeStarted = day1Completed || 0;
      const challengeCompleted = day7Completed || 0;
      const proSignup = proPurchases;

      const rawSteps = [
        { name: "Landing Page Views", count: landingViews },
        { name: "Quiz Started", count: quizStarted },
        { name: "Quiz Completed", count: quizCompleted },
        { name: "Registered", count: registered },
        { name: "OTO Page Viewed", count: otoViewed },
        { name: "OTO Purchased", count: otoPurchased },
        { name: "Challenge Started", count: challengeStarted },
        { name: "Challenge Completed", count: challengeCompleted },
        { name: "Pro Signup", count: proSignup },
      ];

      // Calculate conversion rates
      const funnelSteps: FunnelStep[] = rawSteps.map((step, i) => {
        const prevCount = i === 0 ? step.count : rawSteps[i - 1].count;
        const conversionRate = prevCount > 0 ? (step.count / prevCount) * 100 : 0;
        const dropoffRate = 100 - conversionRate;
        return {
          ...step,
          conversionRate: Math.round(conversionRate * 10) / 10,
          dropoffRate: Math.round(dropoffRate * 10) / 10,
        };
      });

      setSteps(funnelSteps);
    } catch (error) {
      console.error("Error fetching funnel data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, i) => {
            const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
            const isGoodConversion = step.conversionRate >= 50;
            const isPoorConversion = step.conversionRate < 25 && i > 0;

            return (
              <div key={step.name} className="group cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{step.name}</span>
                    {i > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isGoodConversion
                            ? "bg-green-500/20 text-green-500"
                            : isPoorConversion
                            ? "bg-red-500/20 text-red-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.conversionRate}%
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-foreground">{step.count.toLocaleString()}</span>
                </div>
                <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ${
                      i === 0
                        ? "bg-primary"
                        : i === steps.length - 1
                        ? "bg-accent"
                        : "bg-primary/70"
                    } group-hover:opacity-80`}
                    style={{ width: `${Math.max(width, 2)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {i > 0 && step.dropoffRate > 0 && (
                      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {step.dropoffRate}% dropoff
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {steps.length > 3 && steps[0].count > 0
                ? ((steps[3].count / steps[0].count) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Landing → Registration</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {steps.length > 5 && steps[3].count > 0
                ? ((steps[5].count / steps[3].count) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Registration → OTO</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {steps.length > 7 && steps[3].count > 0
                ? ((steps[7].count / steps[3].count) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Registration → Completion</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
