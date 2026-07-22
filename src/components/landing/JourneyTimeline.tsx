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
    title: "Choose the right app idea",
    description:
      "Pick one audience, one problem, and one specific outcome. You end Day 1 with a clear one-line pitch and the direction for the rest of the week.",
    icon: Lightbulb,
  },
  {
    day: 2,
    title: "Map the first version",
    description:
      "Turn the idea into a simple screen flow, wireframe, and feature boundary — what's in your V1, and what waits for later.",
    icon: PenTool,
  },
  {
    day: 3,
    title: "Build the core experience",
    description:
      "Assemble the layout, navigation, and essential data. By the end of the day the core of your first version is real and clickable.",
    icon: Hammer,
  },
  {
    day: 4,
    title: "Add the intelligence",
    description:
      "Wire in one genuinely useful AI feature and refine the prompt behind it — the piece that makes your app feel modern and specific.",
    icon: Wand2,
  },
  {
    day: 5,
    title: "Polish, test, and publish",
    description:
      "Run the quality checklist, deploy a shareable version, and leave with a next-iteration plan you can execute in week two.",
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
