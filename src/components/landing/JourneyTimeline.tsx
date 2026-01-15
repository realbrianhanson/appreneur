import { useState } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, Layout, Blocks, Sparkles, Paintbrush, CheckCircle, Rocket } from "lucide-react";
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
    description: "Use AI to discover and validate 3 profitable app ideas",
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
    title: "Add the Magic",
    description: "Integrate AI features that make your app powerful",
    icon: Sparkles,
  },
  {
    day: 5,
    title: "Polish & Brand It",
    description: "Logo, colors, copy — make it yours",
    icon: Paintbrush,
  },
  {
    day: 6,
    title: "Test & Fix",
    description: "QA and user testing to ship with confidence",
    icon: CheckCircle,
  },
  {
    day: 7,
    title: "SHIP IT",
    description: "Deploy live and share with the world",
    icon: Rocket,
    emoji: "🚀",
  },
];

const JourneyTimeline = () => {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  return (
    <div className="w-full">
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden lg:block relative">
        {/* Connection Line */}
        <div className="absolute top-[60px] left-[calc(100%/14)] right-[calc(100%/14)] h-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50" />
        
        {/* Progress dots on line */}
        <div className="absolute top-[60px] left-[calc(100%/14)] right-[calc(100%/14)] flex justify-between -translate-y-1/2">
          {days.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                hoveredDay === idx + 1 || activeDay === idx + 1
                  ? "bg-primary scale-150 shadow-glow-primary"
                  : "bg-border"
              )}
            />
          ))}
        </div>

        {/* Day Cards */}
        <div className="grid grid-cols-7 gap-4">
          {days.map((day) => {
            const Icon = day.icon;
            const isActive = activeDay === day.day;
            const isHovered = hoveredDay === day.day;
            
            return (
              <div
                key={day.day}
                className="flex flex-col items-center"
                onMouseEnter={() => setHoveredDay(day.day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setActiveDay(isActive ? null : day.day)}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer border-2",
                    isActive || isHovered
                      ? "bg-primary/20 border-primary shadow-glow-primary scale-110"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-8 h-8 transition-colors",
                      isActive || isHovered ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                </div>

                {/* Day Number */}
                <div className={cn(
                  "mt-8 text-xs font-semibold uppercase tracking-wider transition-colors",
                  isActive || isHovered ? "text-primary" : "text-muted-foreground"
                )}>
                  Day {day.day}
                </div>

                {/* Title */}
                <h4 className={cn(
                  "mt-2 text-sm font-display font-bold text-center transition-colors",
                  isActive || isHovered ? "text-foreground" : "text-foreground/80"
                )}>
                  {day.title} {day.emoji}
                </h4>

                {/* Description - shows on hover/active */}
                <div className={cn(
                  "mt-2 text-xs text-center text-muted-foreground transition-all duration-300 max-w-[140px]",
                  isActive || isHovered ? "opacity-100" : "opacity-0"
                )}>
                  {day.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet: Vertical Timeline */}
      <div className="lg:hidden relative">
        {/* Vertical Connection Line */}
        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-primary/50 via-accent/50 to-secondary/50" />

        <div className="space-y-6">
          {days.map((day, idx) => {
            const Icon = day.icon;
            const isActive = activeDay === day.day;
            const isHovered = hoveredDay === day.day;
            const isLast = idx === days.length - 1;
            
            return (
              <div
                key={day.day}
                className="flex items-start gap-4 relative"
                onMouseEnter={() => setHoveredDay(day.day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => setActiveDay(isActive ? null : day.day)}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    "w-16 h-16 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border-2 z-10",
                    isActive || isHovered
                      ? "bg-primary/20 border-primary shadow-glow-primary scale-105"
                      : "bg-card border-border"
                  )}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive || isHovered ? "text-primary" : "text-muted-foreground"
                    )} 
                  />
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 pt-2 transition-all duration-300",
                  isActive || isHovered ? "translate-x-1" : ""
                )}>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wider transition-colors",
                    isActive || isHovered ? "text-primary" : "text-muted-foreground"
                  )}>
                    Day {day.day}
                  </div>
                  <h4 className="mt-1 font-display font-bold">
                    {day.title} {day.emoji}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {day.description}
                  </p>
                </div>

                {/* Connection dot */}
                {!isLast && (
                  <div className="absolute left-[30px] top-[72px] w-2 h-2 rounded-full bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default JourneyTimeline;
