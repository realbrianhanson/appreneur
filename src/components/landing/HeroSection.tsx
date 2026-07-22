import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Magnetic } from "@/components/motion/Magnetic";
import AppBuilderMockup from "./AppBuilderMockup";
import { scrollTo } from "@/lib/scroll";
import {
  PRIMARY_CTA_LABEL,
  SECONDARY_CTA_LABEL,
  HERO_EYEBROW,
  HERO_H1,
  HERO_SUPPORT_COPY,
  CTA_MICROCOPY,
} from "@/lib/constants";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export const HeroSection = ({ onCtaClick }: HeroSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const visualWrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 15 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 150, damping: 15 });

  const handleVisualMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = visualWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleVisualLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleSeePlan = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollTo("#early-access", { offset: -40 });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden flex items-center pt-14 md:pt-16"
    >
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute -top-40 -left-40 w-[720px] h-[720px] rounded-full z-0 hidden md:block"
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,133,36,0.24) 0%, rgba(255,106,0,0.06) 35%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </motion.div>

      <Container size="wide" className="relative z-10 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div
            style={{ y: copyY }}
            className="lg:col-span-7 text-center lg:text-left space-y-7"
          >
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full"
              style={{
                border: "1px solid rgba(255,133,36,0.3)",
                background: "rgba(255,133,36,0.08)",
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#FFA04D",
                }}
              >
                {HERO_EYEBROW}
              </span>
            </motion.div>

            <h1
              aria-label={HERO_H1}
              className="font-display font-bold tracking-tight text-foreground"
              style={{
                fontSize: "clamp(2.25rem, 5.4vw, 3.9rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              <span aria-hidden="true">
                Build Your First Website or App{" "}
                <span
                  className="font-serifit italic bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                  }}
                >
                  With AI—in 5 Days
                </span>
                <span>—even if tech has always intimidated you.</span>
              </span>
            </h1>

            <motion.p
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 text-muted-foreground"
            >
              {HERO_SUPPORT_COPY}
            </motion.p>

            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                <Magnetic strength={0.18}>
                  <button
                    onClick={onCtaClick}
                    className="btn-primary-pill text-base md:text-lg min-h-11"
                    style={{ padding: "16px 30px" }}
                    data-testid="hero-primary-cta"
                  >
                    {PRIMARY_CTA_LABEL}
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                </Magnetic>
                <a
                  href="#early-access"
                  onClick={handleSeePlan}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline min-h-11"
                >
                  {SECONDARY_CTA_LABEL}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground">
                {CTA_MICROCOPY}
              </p>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: visualY }} className="lg:col-span-5">
            <motion.div
              ref={visualWrapRef}
              onMouseMove={handleVisualMove}
              onMouseLeave={handleVisualLeave}
              initial={reduced ? undefined : { opacity: 0, y: 30 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1400, transformStyle: "preserve-3d" }}
              className="relative"
              aria-hidden="true"
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
              <p
                className="mt-4 text-center text-xs md:text-sm text-muted-foreground/80 max-w-md mx-auto"
                data-testid="mockup-honesty-label"
              >
                Illustrative build demonstration — not a customer result.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      <div
        aria-hidden="true"
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