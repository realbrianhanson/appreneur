import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, DollarSign, Trophy, MessageSquare, Rocket } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "registration" | "purchase" | "completion" | "testimonial" | "day_complete";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function RecentActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent registrations
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch recent purchases
      const { data: purchases } = await supabase
        .from("purchases")
        .select("id, product_type, amount_cents, created_at, user_id")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch recent completions (Day 5)
      const { data: completions } = await supabase
        .from("user_progress")
        .select("id, user_id, day_number, completed_at")
        .eq("day_number", 5)
        .eq("is_completed", true)
        .order("completed_at", { ascending: false })
        .limit(10);

      // Fetch recent testimonials
      const { data: testimonials } = await supabase
        .from("testimonials")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      // Combine and sort all activities
      const allActivities: ActivityEvent[] = [];

      profiles?.forEach((p) => {
        allActivities.push({
          id: `reg-${p.id}`,
          type: "registration",
          message: `${p.first_name} registered`,
          timestamp: p.created_at,
        });
      });

      purchases?.forEach((p) => {
        const productName = p.product_type.replace("_", " ");
        allActivities.push({
          id: `pur-${p.id}`,
          type: "purchase",
          message: `Purchase: ${productName} ($${(p.amount_cents / 100).toFixed(0)})`,
          timestamp: p.created_at,
        });
      });

      completions?.forEach((c) => {
        allActivities.push({
          id: `comp-${c.id}`,
          type: "completion",
          message: `User completed Day 5!`,
          timestamp: c.completed_at || c.user_id,
        });
      });

      testimonials?.forEach((t) => {
        allActivities.push({
          id: `test-${t.id}`,
          type: "testimonial",
          message: `${t.name} submitted a testimonial`,
          timestamp: t.created_at,
        });
      });

      // Sort by timestamp
      allActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(allActivities.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "registration":
        return <UserPlus className="w-4 h-4 text-primary" />;
      case "purchase":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "completion":
        return <Trophy className="w-4 h-4 text-accent" />;
      case "testimonial":
        return <MessageSquare className="w-4 h-4 text-secondary" />;
      case "day_complete":
        return <Rocket className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "registration":
        return "default";
      case "purchase":
        return "secondary";
      case "completion":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-full bg-background">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(activity.type)} className="shrink-0">
                    {activity.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
