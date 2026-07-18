import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, Heart, Check } from "lucide-react";
import brianPhoto from "@/assets/brian-hanson.jpeg";
import { GhostWord } from "@/components/motion/GhostWord";
import { CountUp } from "@/components/motion/CountUp";

const bioBullets = [
  "4X Inc. 5000 entrepreneur (highest ranking: #80)",
  "Built multiple 7-figure businesses from the ground up",
  "Taught 150,000+ people to leverage AI through AI for Business Live",
  "Currently building Revven, an AI content platform",
  "I still build apps every week using the exact system I'm teaching you",
];

const AboutHostSection = () => {
  const stats = [
    { icon: Award, label: "Inc 5000 Honoree", to: 4, suffix: "X" },
    { icon: TrendingUp, label: "Highest Ranking", to: 80, prefix: "#" },
    { icon: Users, label: "Students Taught", to: 150, suffix: "K+" },
    { icon: Heart, label: "Social Followers", to: 1, suffix: "M+" },
  ] as const;

  return (
    <Section variant="muted" spacing="xl" className="relative overflow-hidden">
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
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    <div className="leading-tight">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-mono">
                        Inc. 5000
                      </div>
                      <div className="text-lg font-display font-bold text-foreground">
                        #80
                      </div>
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
                I've spent 20+ years in the trenches building businesses. Now I help entrepreneurs skip the hard lessons I learned.
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
                  "I'm not a developer. I'm an entrepreneur who figured out how to make AI do the heavy lifting.
                  If I can do this, you definitely can."
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 pt-10 border-t border-border/40">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex flex-col items-center p-5 rounded-2xl bg-background/40 border border-border/50 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <CountUp
                    to={s.to}
                    prefix={"prefix" in s ? (s as any).prefix : ""}
                    suffix={"suffix" in s ? (s as any).suffix : ""}
                    className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent tabular-nums"
                  />
                  <span className="text-xs text-muted-foreground text-center mt-1 uppercase tracking-widest font-mono">
                    {s.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { AboutHostSection };
