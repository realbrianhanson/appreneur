import { useState, useEffect, useRef } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ArrowRight, Shield } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { scrollTo } from "@/lib/scroll";
import { PRIMARY_CTA_LABEL } from "@/lib/constants";

const FinalCTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToQuiz = () => scrollTo("#quiz-section");

  return (
    <Section variant="default" spacing="xl" className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-primary/10 via-accent/5 to-transparent blur-3xl pointer-events-none" />

      <Container size="wide" className="relative z-10">
        <div
          ref={sectionRef}
          className={`max-w-5xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-[1.05] tracking-tight mb-6">
            Ready to move your idea{" "}
            <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              off the shelf?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            One focused mission, one concrete win, five days. Create your
            free account and start Day 1 today.
          </p>

          <Magnetic strength={0.4}>
            <button
              onClick={scrollToQuiz}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-background font-semibold text-base md:text-lg shadow-[0_20px_50px_-15px_hsl(var(--primary)/0.7)] hover:brightness-110 transition-all min-h-11"
            >
              {PRIMARY_CTA_LABEL}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          </Magnetic>

          <div className="mt-6 font-mono text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] uppercase text-muted-foreground px-4">
            Five focused days · On your schedule
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-primary/70" aria-hidden="true" />
            <span>Free · No credit card required · Unsubscribe anytime.</span>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { FinalCTASection };
