import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, PartyPopper } from "lucide-react";

interface UserProgress {
  day_number: number;
  is_unlocked: boolean;
  is_completed: boolean;
  tasks_completed: Record<string, unknown>;
}

interface NotificationBannerProps {
  userProgress: UserProgress[];
}

export function getUnstartedDay(userProgress: UserProgress[]): number | null {
  // Find the most recent unlocked, not completed, no tasks started day
  const candidates = userProgress
    .filter(
      (p) =>
        p.is_unlocked &&
        !p.is_completed &&
        Object.keys(p.tasks_completed || {}).length === 0
    )
    .sort((a, b) => b.day_number - a.day_number);

  return candidates.length > 0 ? candidates[0].day_number : null;
}

export const NotificationBanner = ({ userProgress }: NotificationBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const unstartedDay = getUnstartedDay(userProgress);

  if (dismissed || unstartedDay === null) return null;

  return (
    <div className="relative rounded-xl bg-primary text-primary-foreground p-4 animate-in slide-in-from-top-4 duration-500">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-primary-foreground/70 hover:text-primary-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-4 pr-8">
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
          <PartyPopper className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold font-display">
            🎉 Day {unstartedDay} is now unlocked! Start today's mission →
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          asChild
        >
          <Link to={`/dashboard/day/${unstartedDay}`}>
            Start Mission
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
