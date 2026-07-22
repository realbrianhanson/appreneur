import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Magnetic } from "@/components/motion/Magnetic";
import AppBuilderMockup from "./AppBuilderMockup";
import brianPhoto from "@/assets/brian-hanson.jpeg";

interface HeroSectionProps {
  onCtaClick: () => void;
  cohortStartDate?: Date | null;
}

const trustItems = [
  "100% Free",
  "No Experience Needed",
  "Takes 60 seconds",
];

export const HeroSection = ({ onCtaClick, cohortStartDate }: HeroSectionProps) => {
  // Product is self-paced. Never fabricate a scheduled-cohort date in the hero.
  const badgeText = "Free 5-Day Challenge · Self-Paced · Early Access Open";
  const sectionRef = useRef<HTMLElement>(null);
  const visualWrapRef = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // 3D tilt for the visual
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 15,
  });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 15,
  });

  const handleVisualMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = visualWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(px);
    my.set(py);
  };
  const handleVisualLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center pt-16 md:pt-20"
    >
      {/* Amber radial glow behind top-left */}
      <motion.div
        aria-hidden
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full z-0"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,133,36,0.28) 0%, rgba(255,106,0,0.08) 35%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </motion.div>

      <Container size="wide" className="relative z-10 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT COLUMN — copy */}
          <motion.div
            style={{ y: copyY }}
            className="lg:col-span-7 text-center lg:text-left space-y-8"
          >
            {/* Cohort pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{
                border: "1px solid rgba(255,133,36,0.3)",
                background: "rgba(255,133,36,0.08)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ background: "#FF8524" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "#FF8524" }}
                />
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#FFA04D",
                }}
              >
                {badgeText}
              </span>
            </motion.div>

            {/* Headline */}
            <h1
              className="font-display font-bold tracking-tight text-foreground"
              style={{
                fontSize: "clamp(2.5rem, 6.4vw, 4.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
              }}
            >
              <span className="block">
                <SplitReveal text={'Go from \u201CI have an idea\u201D to'} duration={0.35} stagger={0.04} />
              </span>
              <span
                className="block font-serifit"
                style={{
                  fontSize: "1.12em",
                  lineHeight: 1,
                  marginTop: "0.08em",
                  marginBottom: "0.04em",
                }}
              >
                <SplitReveal
                  text={'\u201CI built that\u201D'}
                  delay={0.15}
                  duration={0.35}
                  stagger={0.04}
                  charClassName="text-gradient-primary"
                />
              </span>
              <span className="block">
                <SplitReveal text="in 5 days." delay={0.3} duration={0.35} stagger={0.04} />
              </span>
            </h1>

            {/* Subcopy */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 text-muted-foreground"
            >
              You don't need code, a developer, or a $15K budget. You need 5 days and{" "}
              <strong className="font-semibold text-foreground">the Appreneur Method</strong>: the exact system{" "}
              <strong className="font-semibold text-foreground">500+ entrepreneurs</strong>{" "}
              have used to ship real, working apps.
            </motion.p>

            {/* CTA + trust */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="flex justify-center lg:justify-start">
                <Magnetic strength={0.18}>
                  <button
                    onClick={onCtaClick}
                    className="btn-primary-pill text-base md:text-lg"
                    style={{ padding: "18px 34px" }}
                  >
                    Claim your free spot (3 quick questions)
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Magnetic>
              </div>

              <ul className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {trustItems.map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{
                        width: 18,
                        height: 18,
                        background: "rgba(255,133,36,0.12)",
                        border: "1px solid rgba(255,133,36,0.35)",
                      }}
                    >
                      <Check className="w-3 h-3" style={{ color: "#FFA04D" }} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Brian credential row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="pt-4 flex items-center gap-3 justify-center lg:justify-start"
            >
              <img
                src={brianPhoto}
                alt="Brian Hanson"
                loading="eager"
                className="w-12 h-12 rounded-full object-cover"
                style={{
                  boxShadow:
                    "0 0 0 2px #08080C, 0 0 0 4px rgba(255,133,36,0.6), 0 0 20px rgba(255,133,36,0.25)",
                }}
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  Taught by Brian Hanson
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">
                  4X Inc. 5000 Entrepreneur · 7-Figure Businesses · 40,000+ Business Owners Trained
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN — visual */}
          <motion.div
            style={{ y: visualY }}
            className="lg:col-span-5"
          >
            <motion.div
              ref={visualWrapRef}
              onMouseMove={handleVisualMove}
              onMouseLeave={handleVisualLeave}
              initial={{ opacity: 0, y: 40, rotateX: 12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                perspective: 1400,
                transformStyle: "preserve-3d",
              }}
              className="relative"
            >
              <motion.div
                style={{
                  rotateX: rotX,
                  rotateY: rotY,
                  transformStyle: "preserve-3d",
                }}
              >
                <AppBuilderMockup />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-24 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #08080C 0%, rgba(8,8,12,0) 100%)",
        }}
      />
    </section>
  );
};

export default HeroSection;