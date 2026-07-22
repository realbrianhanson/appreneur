import { X, ArrowDown } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { scrollTo } from "@/lib/scroll";

const painPoints: { title: string; description: React.ReactNode }[] = [
  {
    title: "Developers want $15K+",
    description: <>Developers want <span style={{ color: "#F4F2EE" }} className="font-semibold">$15K+</span> (and 6 months of your life)</>,
  },
  {
    title: "Tutorials put you to sleep",
    description: <>Coding tutorials make your eyes glaze over in 10 minutes</>,
  },
  {
    title: "No-code isn't no-code",
    description: <>"No-code" tools still feel like learning a foreign language</>,
  },
];

const handlePivotClick = (e: React.MouseEvent) => {
  e.preventDefault();
  scrollTo("#journey-section", { offset: -40 });
};

const OpeningCopySection = () => {
  return (
    <Section variant="default" spacing="xl" className="relative overflow-hidden">
      {/* Ghost word behind heading */}
      <GhostWord word="STUCK" align="top" className="opacity-100" />

      <Container size="wide" className="relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Eyebrow */}
          <div className="eyebrow mb-10 flex items-center gap-4">
            <span className="h-px w-8 bg-primary/60" />
            <span>The Problem</span>
            <span className="h-px w-8 bg-primary/60" />
          </div>

          {/* Headline */}
          <h2
            className="font-bold leading-[1.02] tracking-tight mb-16 md:mb-20"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2.25rem, 6vw, 3.75rem)",
            }}
          >
            <span style={{ color: "#F4F2EE" }} className="block">You have an app idea.</span>
            <span className="block text-muted-foreground">Building it feels impossible.</span>
          </h2>

          {/* Lead copy */}
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted-foreground mb-14">
            <p>
              You've had this idea rattling around for months. Maybe years.
              You <span style={{ color: "#F4F2EE" }} className="font-medium">KNOW</span> it could work.
            </p>
            <p>But every time you look into building it, you hit the same wall:</p>
          </div>

          {/* Pain rows */}
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06] mb-16">
            {painPoints.map((item, i) => (
              <li
                key={i}
                className="group relative flex items-center gap-5 md:gap-8 py-6 md:py-7 px-2 md:px-4 transition-colors duration-300 hover:bg-red-500/[0.04]"
              >
                <span
                  className="shrink-0 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full transition-colors"
                  style={{
                    background: "rgba(239, 68, 68, 0.10)",
                    border: "1px solid rgba(239, 68, 68, 0.30)",
                  }}
                >
                  <X className="w-5 h-5" style={{ color: "#F87171" }} strokeWidth={2.5} />
                </span>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg md:text-xl font-semibold mb-1 transition-colors group-hover:text-red-300"
                    style={{ color: "#F4F2EE", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {item.description}
                  </p>
                </div>

                <span
                  className="shrink-0 ml-auto tabular-nums opacity-40 group-hover:opacity-70 transition-opacity"
                  style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    color: "#F4F2EE",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}/03
                </span>
              </li>
            ))}
          </ul>

          {/* Pivot card */}
          <div
            className="relative rounded-2xl p-8 md:p-12 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,160,77,0.10) 0%, rgba(255,106,0,0.06) 60%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,160,77,0.25)",
            }}
          >
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,160,77,0.20) 0%, transparent 70%)",
              }}
            />

            <p
              className="relative text-xl md:text-2xl font-semibold leading-snug mb-4"
              style={{ color: "#F4F2EE", fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Here's what's different now:{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                }}
              >
                the tools finally caught up.
              </span>
            </p>

            <p className="relative text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
              Modern AI builders let a non-developer turn a clear idea into a working first version in days, not months — as long as the plan is right. This challenge is that plan.
            </p>

            <a
              href="#journey-section"
              onClick={handlePivotClick}
              className="relative inline-flex items-center gap-2 text-lg md:text-xl font-semibold group"
              style={{ color: "#FFA04D" }}
            >
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                }}
              >
                See the 5-Day Challenge
              </span>
              <ArrowDown
                className="w-5 h-5 shrink-0"
                style={{
                  color: "#FFA04D",
                  animation: "opening-arrow-bounce 1.4s ease-in-out infinite",
                }}
              />
            </a>
          </div>
        </div>
      </Container>

      <style>{`
        @keyframes opening-arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </Section>
  );
};

export default OpeningCopySection;
