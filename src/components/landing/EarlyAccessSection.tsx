import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";

const inclusions = [
  {
    title: "Free account, no credit card",
    body: "Sign up in under a minute. Nothing to buy while the challenge is being built.",
  },
  {
    title: "Five-day self-paced roadmap",
    body: "The full Day 1 → Day 5 plan waiting in your dashboard.",
  },
  {
    title: "Progress tracking",
    body: "Each mission unlocks as the prior one is completed, so momentum is visible.",
  },
  {
    title: "Lesson previews while videos are recorded",
    body: "You'll see the shape of each mission and know exactly what's coming.",
  },
  {
    title: "Email notification when full lessons open",
    body: "One email when the recorded lessons are ready — no ongoing spam.",
  },
];

export const EarlyAccessSection = ({
  onCtaClick,
}: {
  onCtaClick: () => void;
}) => {
  const reduced = useReducedMotion();
  return (
    <Section
      id="early-access"
      variant="muted"
      spacing="xl"
      className="relative overflow-hidden"
    >
      <GhostWord word="INCLUDED" align="top" className="opacity-70" />
      <Container size="wide" className="relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <div className="eyebrow mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span>What early access includes</span>
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
            }}
          >
            No hype.{" "}
            <span
              className="font-serifit italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              Just what's ready today.
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            The lessons are still being recorded. Here's exactly what you get
            the moment you sign up — and what we'll notify you about next.
          </p>
        </div>

        <ul className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto" role="list">
          {inclusions.map((item, i) => (
            <motion.li
              key={item.title}
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-6 flex items-start gap-4"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                aria-hidden="true"
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,160,77,0.10)",
                  border: "1px solid rgba(255,160,77,0.30)",
                }}
              >
                <Check
                  className="w-4 h-4"
                  style={{ color: "#FFA04D" }}
                  strokeWidth={3}
                />
              </span>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-foreground leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <button
            onClick={onCtaClick}
            className="btn-primary-pill text-base md:text-lg"
            style={{ padding: "16px 32px" }}
          >
            Get Free Early Access
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Free · No credit card · We'll email you when lessons open
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default EarlyAccessSection;