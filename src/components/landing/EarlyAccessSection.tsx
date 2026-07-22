import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { PRIMARY_CTA_LABEL, CTA_MICROCOPY } from "@/lib/constants";

const inclusions = [
  {
    title: "A working website or simple app",
    body: "Not a slide deck. A live, clickable first version you can open on your phone by Day 5.",
  },
  {
    title: "A clear purpose",
    body: "Who it's for, the one problem it helps with, and what a good result looks like — in plain English.",
  },
  {
    title: "Pages and buttons that work",
    body: "The screens people actually see, with menus and buttons that go where they should.",
  },
  {
    title: "One useful AI-powered feature",
    body: "One thing your website or app can do automatically — set up by giving the AI clear instructions in everyday English.",
  },
  {
    title: "A link you can open and share",
    body: "A real web address you can send to a friend, a customer, or your team for honest feedback.",
  },
  {
    title: "A short list of what to improve next",
    body: "A simple next-steps list so you know exactly what to work on after Day 5.",
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
      <GhostWord word="OUTCOME" align="top" className="opacity-70" />
      <Container size="wide" className="relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-14">
          <div className="eyebrow mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span>What you'll have by Day 5</span>
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
            }}
          >
            Five days.{" "}
            <span
              className="font-serifit italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              One working first version.
            </span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            This is the intended outcome for participants who follow every
            step. Real results depend on the effort you bring — not a promise
            of a specific business or income result.
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
            {PRIMARY_CTA_LABEL}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            {CTA_MICROCOPY}
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default EarlyAccessSection;