import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lightbulb, PenTool, Hammer, Wand2, Rocket } from "lucide-react";
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
    icon: PenTool,
  },
  {
    day: 3,
    title: "Build Your Core App",
    description: "Get your first working version live in Lovable",
    icon: Hammer,
  },
  {
    day: 4,
    title: "Polish & Add Magic",
    description: "Integrate AI features, branding, and finishing touches",
    icon: Wand2,
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
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 75%", "end 40%"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={railRef} className="relative max-w-3xl mx-auto pl-2 md:pl-4">
      {/* Vertical rail */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{
          left: "31px",
          width: 2,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      {/* Animated amber fill overlay */}
      <motion.div
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{
          left: "31px",
          width: 2,
          originY: 0,
          scaleY,
          background: "linear-gradient(180deg, #FFA04D 0%, #FF6A00 100%)",
          boxShadow: "0 0 12px rgba(255,106,0,0.55)",
          borderRadius: 2,
        }}
      />

      <ol className="relative space-y-8 md:space-y-10">
        {days.map((d, idx) => {
          const Icon = d.icon;
          const isLaunch = d.day === 5;

          return (
            <li key={d.day} className="relative flex items-start gap-5 md:gap-8">
              {/* Icon square */}
              <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10"
                  style={
                    isLaunch
                      ? {
                          background:
                            "linear-gradient(135deg, #FFA04D 0%, #FF6A00 100%)",
                          boxShadow:
                            "0 0 24px rgba(255,106,0,0.45), 0 0 60px rgba(255,106,0,0.25)",
                          border: "1px solid rgba(255,160,77,0.5)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  <Icon
                    className="w-7 h-7"
                    style={{
                      color: isLaunch ? "#1A0D00" : "#FFA04D",
                    }}
                    strokeWidth={2}
                  />
                </div>
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-2xl p-5 md:p-6 transition-colors duration-300"
                style={
                  isLaunch
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(255,160,77,0.10) 0%, rgba(255,106,0,0.05) 100%)",
                        border: "1px solid rgba(255,160,77,0.35)",
                      }
                    : {
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="inline-block"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: 11,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "#FFA04D",
                    }}
                  >
                    Day {String(d.day).padStart(2, "0")}
                  </span>
                  {isLaunch && (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255,160,77,0.15)",
                        border: "1px solid rgba(255,160,77,0.4)",
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        fontSize: 10,
                        letterSpacing: "0.25em",
                        color: "#FFA04D",
                        textTransform: "uppercase",
                      }}
                    >
                      Launch
                    </span>
                  )}
                </div>

                <h4
                  className="font-bold leading-tight mb-2"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "clamp(1.25rem, 2.4vw, 1.75rem)",
                    color: "#F4F2EE",
                  }}
                >
                  {d.title} {d.emoji}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {d.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default JourneyTimeline;
