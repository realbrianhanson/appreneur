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
    title: "Choose what to build.",
    description:
      "You'll decide who your website or app is for, the one problem it helps them with, and what a good result looks like. No tech words, no jargon — just a clear picture of what you're making and why.",
    deliverable:
      "one clear idea you can say in a single sentence — who it's for, what it does, and why it's useful.",
    icon: Lightbulb,
  },
  {
    day: 2,
    title: "Sketch the small first version.",
    description:
      "You'll make a simple sketch of your pages or screens and what someone clicks first, next, and last. This keeps the first version small enough to actually finish, instead of a giant project you never start.",
    deliverable:
      "a simple sketch of your pages and the small first version worth building.",
    icon: PenTool,
  },
  {
    day: 3,
    title: "Build the pages and make the buttons work.",
    description:
      "Today you actually build. You'll describe your pages in everyday English and watch a working layout appear, then make the buttons and menus do what they should. You won't write code.",
    deliverable:
      "working pages, navigation, and the basic information your website or app needs.",
    icon: Hammer,
  },
  {
    day: 4,
    title: "Add one useful AI-powered feature.",
    description:
      "You'll add one AI feature that saves people time or does something helpful automatically — by giving the AI clear instructions in plain English until the result is something you'd trust to show a customer.",
    deliverable:
      "one useful AI-powered feature and the plain-English instructions that make it work.",
    icon: Wand2,
  },
  {
    day: 5,
    title: "Test it, fix the rough edges, and put it online.",
    description:
      "You'll click through your website or app, fix the small things that feel off, and put it online so you can share the link with a friend, a customer, or your team. You'll finish with a short list of what to improve next.",
    deliverable:
      "a link you can open and share, plus a short list of what to improve next.",
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
