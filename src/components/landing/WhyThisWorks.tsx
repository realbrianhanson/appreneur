import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Cpu, LayoutList, Eye } from "lucide-react";

interface Pillar {
  n: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

const pillars: Pillar[] = [
  {
    n: "01",
    icon: Cpu,
    title: "AI does the heavy lifting",
    body: "You bring the idea and taste. Modern AI tools write the code, so you make decisions instead of debugging syntax.",
  },
  {
    n: "02",
    icon: LayoutList,
    title: "One focused day at a time",
    body: "Five sequential missions with one clear objective per day. No overwhelm, no jumping between five tutorials at once.",
  },
  {
    n: "03",
    icon: Eye,
    title: "End each day with something visible",
    body: "Discovery, design, build, polish, ship — every day produces a concrete output, not another page of notes.",
  },
];

export const WhyThisWorks = () => {
  const reduced = useReducedMotion();
  return (
    <Section
      id="why-this-works"
      variant="default"
      spacing="xl"
      className="relative overflow-hidden"
    >
      <GhostWord word="METHOD" align="top" className="opacity-70" />
      <Container size="wide" className="relative z-10">
        <div className="max-w-3xl mb-14 md:mb-20">
          <div className="eyebrow mb-6 flex items-center gap-4">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span>Why this works</span>
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
            }}
          >
            A method built for entrepreneurs,{" "}
            <span
              className="font-serifit italic bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              not engineers.
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg max-w-2xl">
            Three principles keep you moving from idea to first build without
            getting lost in tools or theory.
          </p>
        </div>

        <ol className="grid md:grid-cols-3 gap-5 md:gap-6" role="list">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.li
                key={p.n}
                initial={reduced ? undefined : { opacity: 0, y: 24 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl p-7 md:p-8 flex flex-col gap-5 overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,160,77,0.12) 0%, transparent 70%)",
                  }}
                />
                <div className="flex items-center justify-between relative">
                  <span
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
                    style={{
                      background: "rgba(255,160,77,0.08)",
                      border: "1px solid rgba(255,160,77,0.28)",
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: "#FFA04D" }}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </span>
                  <span
                    className="tabular-nums opacity-40"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      fontSize: 11,
                      letterSpacing: "0.25em",
                      color: "#F4F2EE",
                    }}
                  >
                    {p.n}/03
                  </span>
                </div>
                <h3
                  className="font-semibold leading-tight text-foreground relative"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "clamp(1.15rem, 2vw, 1.4rem)",
                  }}
                >
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed relative">
                  {p.body}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
};

export default WhyThisWorks;