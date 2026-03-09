import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";

interface DayCompleteCelebrationProps {
  day: number;
  timeSpentSeconds: number;
  tasksCompleted: number;
  totalTasks: number;
  nextDayPreview: string;
  isLastDay: boolean;
  onDismiss: () => void;
}

const dayTitles: Record<number, string> = {
  1: "Find Your Idea",
  2: "Design Blueprint",
  3: "Build Core App",
  4: "Add AI Magic",
  5: "Ship It! 🚀",
};

const encouragements = [
  "You're on fire! 🔥",
  "Crushing it! 💪",
  "Unstoppable! ⚡",
  "Amazing work! 🌟",
  "Let's go! 🚀",
];

const DayCompleteCelebration = ({
  day,
  timeSpentSeconds,
  tasksCompleted,
  totalTasks,
  nextDayPreview,
  isLastDay,
  onDismiss,
}: DayCompleteCelebrationProps) => {
  const [visible, setVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [nextVisible, setNextVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setStatsVisible(true), 600);
    const t3 = setTimeout(() => setNextVisible(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const encouragement = encouragements[day % encouragements.length];
  const progressPercent = ((day) / 5) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
      <div
        className={`max-w-lg w-full transition-all duration-700 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-90"
        }`}
      >
        <Card className="border-primary/30 shadow-glow-primary overflow-hidden">
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/10 p-8 text-center">
            {/* Floating sparkles */}
            <Sparkles className="absolute top-4 left-6 w-5 h-5 text-primary/40 animate-float" />
            <Star className="absolute top-6 right-8 w-4 h-4 text-secondary/40 animate-float" style={{ animationDelay: "1s" }} />
            <Zap className="absolute bottom-4 left-10 w-4 h-4 text-accent/40 animate-float" style={{ animationDelay: "0.5s" }} />

            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
              <Trophy className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Day {day} Complete!
            </h2>
            <p className="text-lg text-primary font-semibold">{encouragement}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {dayTitles[day]} — ✓ Done
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Stats row */}
            <div
              className={`grid grid-cols-3 gap-4 transition-all duration-500 ${
                statsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{tasksCompleted}/{totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{formatTime(timeSpentSeconds)}</div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <Trophy className="w-5 h-5 text-secondary mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">{Math.round(progressPercent)}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className={`transition-all duration-500 ${statsVisible ? "opacity-100" : "opacity-0"}`}>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Challenge Progress</span>
                <span>{day} of 5 days</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Next day preview */}
            <div
              className={`transition-all duration-500 ${
                nextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {!isLastDay ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Up Next — Day {day + 1}: {dayTitles[day + 1]}
                  </p>
                  <p className="text-sm text-muted-foreground">{nextDayPreview}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10 text-center">
                  <p className="text-lg font-bold text-foreground mb-1">🎓 You did it!</p>
                  <p className="text-sm text-muted-foreground">You've completed the entire challenge. Time to graduate!</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              {!isLastDay ? (
                <Button variant="cta" size="lg" className="w-full" asChild>
                  <Link to={`/dashboard/day/${day + 1}`}>
                    Start Day {day + 1}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button variant="cta" size="lg" className="w-full" asChild>
                  <Link to="/dashboard/graduation">
                    Go to Graduation 🎓
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DayCompleteCelebration;
