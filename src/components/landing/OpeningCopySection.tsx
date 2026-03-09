import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const OpeningCopySection = () => {
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

  return (
    <Section variant="default" spacing="lg" className="relative overflow-hidden">
      <Container size="wide" className="relative z-10">
        <div 
          ref={sectionRef}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 max-w-[40px] bg-primary/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The Problem</span>
            <div className="h-px flex-1 max-w-[40px] bg-primary/40" />
          </div>

          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-snug">
              You have an app idea.<br />
              <span className="text-muted-foreground font-normal text-xl md:text-2xl">But building it feels impossible.</span>
            </p>
            
            <p className="text-muted-foreground">
              You've had this idea rattling around for months. Maybe years. 
              You <span className="text-foreground font-medium">KNOW</span> it could work — you've seen worse apps making money.
            </p>
            
            <p className="text-muted-foreground">
              But every time you look into building it, you hit the same wall:
            </p>
            
            {/* Pain points as cards */}
            <div className="space-y-3 py-2">
              {[
                { emoji: "💸", text: <>Developers want <span className="text-foreground font-semibold">$15K+</span> (and 6 months of your life)</> },
                { emoji: "😴", text: "Coding tutorials make your eyes glaze over in 10 minutes" },
                { emoji: "🤯", text: '"No-code" tools still feel like learning a foreign language' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <span className="text-xl mt-0.5">{item.emoji}</span>
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 mt-4">
              <p className="text-foreground font-semibold text-xl leading-relaxed">
                Here's the thing — I've built multiple 7-figure businesses and taught 
                150,000+ people to use AI. And I'm telling you: <span className="text-primary">the game has completely changed.</span>
              </p>
            </div>
            
            <p className="text-muted-foreground">
              You can now build a real, working app in 5 days. Not a toy. Not a "prototype." 
              An actual app people can use.
            </p>
            
            <p className="text-2xl font-bold text-gradient-primary pt-2">
              And I'll show you exactly how — for free.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default OpeningCopySection;
