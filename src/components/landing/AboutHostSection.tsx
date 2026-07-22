import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import brianPhoto from "@/assets/brian-hanson.jpeg";
import { GhostWord } from "@/components/motion/GhostWord";

const bioBullets = [
  "Founder of AI For Business — one of the world's largest AI training companies",
  "Long-time entrepreneur and operator who has built and led multiple companies",
  "Teaches a practical, no-fluff approach to using AI as an entrepreneur",
  "Still builds apps every week using the exact system taught in this challenge",
];

const AboutHostSection = () => {
  return (
    <Section
      id="instructor"
      variant="muted"
      spacing="xl"
      className="relative overflow-hidden"
    >
      <GhostWord word="BRIAN" align="center" className="opacity-80" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-radial from-accent/5 to-transparent blur-3xl" />

      <Container size="wide" className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid md:grid-cols-5 gap-10 md:gap-14 items-center"
          >
            {/* Left — Photo card */}
            <div className="md:col-span-2">
              <div className="relative mx-auto max-w-sm">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-primary/20">
                  <img
                    src={brianPhoto}
                    alt="Brian Hanson"
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                  {/* Amber wash */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/10 mix-blend-overlay" />
                </div>

                {/* Outer glow */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/25 via-accent/15 to-transparent blur-2xl -z-10" />

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-5 -right-4 md:-right-8 rounded-2xl border border-primary/40 bg-background/90 backdrop-blur px-4 py-3 shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.5)]"
                >
                  <div className="leading-tight">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                      Founder
                    </div>
                    <div className="text-sm font-display font-bold text-foreground">
                      AI For Business
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right — Content */}
            <div className="md:col-span-3 space-y-6">
              <Badge variant="outline">Your Instructor</Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
                <span
                  className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                >
                  Brian Hanson
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Created by Brian Hanson, founder of AI For Business — one of
                the world's largest AI training companies.
              </p>
              <p className="text-lg text-muted-foreground max-w-xl">
                Brian is an entrepreneur, not a developer. This challenge
                teaches the exact system he uses to turn ideas into working
                apps with AI — no engineering background required.
              </p>

              <ul className="space-y-3">
                {bioBullets.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Quote card with amber left border */}
              <div className="relative rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-accent to-primary" />
                <p className="text-foreground/90 font-medium italic pl-3 leading-relaxed">
                  "I'm an entrepreneur, not a developer. I figured out how to make AI do the heavy lifting.
                  If I can do this, you definitely can."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export { AboutHostSection };
