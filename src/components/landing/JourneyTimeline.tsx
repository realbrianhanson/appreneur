import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lightbulb, PenTool, Hammer, Wand2, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DayCard {
  day: number;
  title: string;
  description: string;
  deliverable: string;
  icon: LucideIcon;
  emoji?: string;
}

const days: DayCard[] = [
  {
    day: 1,
    title: "Choose the idea worth building.",
    description:
      "Stop juggling ten half-ideas. Today you pick the one your future self will thank you for — one audience, one problem, one specific outcome — and lock the direction for the rest of the week.",
    deliverable:
      "one clear audience, problem, and outcome, plus a one-sentence app concept you can say out loud.",
    icon: Lightbulb,
  },
  {
    day: 2,
    title: "Turn the idea into a buildable first version.",
    description:
      "Big vision doesn't ship. Today you carve your idea down to a buildable first version so scope stops fighting you: the screens that matter, the flow between them, and the features that wait for later.",
    deliverable:
      "a screen flow, a rough wireframe, and a must-have feature boundary for your V1.",
    icon: PenTool,
  },
  {
    day: 3,
    title: "Make the core experience real.",
    description:
      "This is the day the app stops being an idea. You assemble the working layout, navigation, and essential data so the core of your first version becomes something you can actually click through.",
    deliverable:
      "a working layout, real navigation, and the essential data your app needs.",
    icon: Hammer,
  },
  {
    day: 4,
    title: "Make it genuinely useful with AI.",
    description:
      "AI features are cheap. Useful AI features are rare. Today you wire in one AI capability that actually solves your user's problem, and refine the prompt behind it until the output is worth trusting.",
    deliverable:
      "one useful AI feature and the refined prompt that powers it.",
    icon: Wand2,
  },
  {
    day: 5,
    title: "Polish it. Test it. Publish it.",
    description:
      "Most builders quit right before this day. You won't. You run the quality checklist, fix the rough edges, deploy a shareable version, and walk away with a next-iteration checklist for week two.",
    deliverable:
      "a shareable, deployed first version and a next-iteration checklist.",
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
                <p
                  className="mt-4 text-sm md:text-[15px] leading-relaxed"
                  style={{ color: "rgba(244,242,238,0.85)" }}
                >
                  <span
                    className="inline-block mr-2 align-middle"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: 10,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "#FFA04D",
                    }}
                  >
                    You finish with:
                  </span>
                  <span>{d.deliverable}</span>
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
