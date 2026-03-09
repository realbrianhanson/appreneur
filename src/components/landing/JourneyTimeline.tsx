import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Layout, Blocks, Sparkles, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DayCard {
  day: number;
  title: string;
  description: string;
  icon: LucideIcon;
  emoji?: string;
}

const days: DayCard[] = [
  {
    day: 1,
    title: "Find Your Winning Idea",
    description: "Use AI to discover and validate profitable app ideas",
    icon: Lightbulb,
  },
  {
    day: 2,
    title: "Design Your Blueprint",
    description: "Create your app's wireframe and feature list",
    icon: Layout,
  },
  {
    day: 3,
    title: "Build Your Core App",
    description: "Get your first working version live in Lovable",
    icon: Blocks,
  },
  {
    day: 4,
    title: "Polish & Add Magic",
    description: "Integrate AI features, branding, and finishing touches",
    icon: Sparkles,
  },
  {
    day: 5,
    title: "SHIP IT",
    description: "Deploy live and share with the world",
    icon: Rocket,
    emoji: "🚀",
  },
];

const JourneyTimeline = () => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-5 gap-0 relative">
          {days.map((day, idx) => {
            const Icon = day.icon;
            const isHovered = hoveredDay === day.day;
            const isLast = idx === days.length - 1;

            return (
              <div
                key={day.day}
                className="flex flex-col items-center relative"
                onMouseEnter={() => setHoveredDay(day.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Icon container */}
                <div
                  className={cn(
                    "w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-400 border-2 relative z-10",
                    isHovered
                      ? "bg-primary/10 border-primary/40 shadow-glow-primary scale-110 -translate-y-1"
                      : "bg-card border-border/60 shadow-card hover:border-primary/30"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-9 h-9 transition-all duration-300",
                      isHovered ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>

                {/* Connector: dot + line to next card */}
                {!isLast && (
                  <div className="absolute top-[48px] left-[calc(50%+48px)] right-[calc(-50%+48px)] flex items-center z-0">
                    {/* Left dot */}
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300",
                      hoveredDay === day.day || hoveredDay === day.day + 1
                        ? "bg-primary"
                        : "bg-border"
                    )} />
                    {/* Line */}
                    <div className={cn(
                      "flex-1 h-[2px] transition-colors duration-500",
                      idx < 3
                        ? "bg-gradient-to-r from-primary/30 to-primary/30"
                        : "bg-gradient-to-r from-primary/30 to-secondary/40"
                    )} />
                    {/* Right dot */}
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300",
                      hoveredDay === day.day + 1
                        ? "bg-primary"
                        : "bg-border"
                    )} />
                  </div>
                )}

                {/* Day label */}
                <div className={cn(
                  "mt-6 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors duration-300",
                  isHovered ? "text-primary" : "text-muted-foreground"
                )}>
                  Day {day.day}
                </div>

                {/* Title */}
                <h4 className={cn(
                  "mt-2 text-base font-display font-bold text-center leading-tight transition-colors duration-300",
                  isHovered ? "text-foreground" : "text-foreground/85"
                )}>
                  {day.title} {day.emoji}
                </h4>

                {/* Description */}
                <p className="mt-2 text-sm text-center text-muted-foreground max-w-[160px] leading-relaxed">
                  {day.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet: Vertical Timeline */}
      <div className="lg:hidden">
        <div className="space-y-0">
          {days.map((day, idx) => {
            const Icon = day.icon;
            const isHovered = hoveredDay === day.day;
            const isLast = idx === days.length - 1;

            return (
              <div
                key={day.day}
                className="flex items-start gap-5 relative"
                onMouseEnter={() => setHoveredDay(day.day)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Left column: icon + connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 border-2 z-10",
                      isHovered
                        ? "bg-primary/10 border-primary/40 shadow-glow-primary scale-105"
                        : "bg-card border-border/60 shadow-card"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-7 h-7 transition-colors",
                        isHovered ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  {/* Vertical connector */}
                  {!isLast && (
                    <div className="w-[2px] h-8 bg-border/40 my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2 pb-6">
                  <div className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.15em] transition-colors",
                    isHovered ? "text-primary" : "text-muted-foreground"
                  )}>
                    Day {day.day}
                  </div>
                  <h4 className="mt-1 font-display font-bold text-base">
                    {day.title} {day.emoji}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {day.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyTimeline;
