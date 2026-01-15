import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface TestimonialStatsProps {
  className?: string;
}

export const TestimonialStats = ({ className = "" }: TestimonialStatsProps) => {
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count users who have completed day 7
        const { count, error } = await supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("day_number", 7)
          .eq("is_completed", true);

        if (!error && count !== null) {
          setCompletedCount(count);
        }
      } catch (error) {
        console.error("Error fetching completion stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Don't render if loading or no data
  if (isLoading || completedCount === null || completedCount < 10) {
    return null;
  }

  // Round to nearest 10 for a cleaner display
  const displayCount = Math.floor(completedCount / 10) * 10;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 ${className}`}
    >
      <Users className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium text-foreground">
        Join{" "}
        <span className="text-primary font-bold">{displayCount.toLocaleString()}+</span>{" "}
        entrepreneurs who've completed the challenge
      </span>
    </div>
  );
};
