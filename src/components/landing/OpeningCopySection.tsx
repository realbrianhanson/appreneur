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
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
      
      <Container size="wide" className="relative z-10">
        <div 
          ref={sectionRef}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              Look, I get it.
            </p>
            
            <p className="text-muted-foreground">
              You've had this app idea rattling around in your head for months. Maybe years. 
              You <span className="text-foreground font-medium">KNOW</span> it could work — you've seen way worse apps making money.
            </p>
            
            <p className="text-muted-foreground">
              But every time you look into actually building it, you hit the same wall:
            </p>
            
            <ul className="space-y-3 text-muted-foreground pl-4">
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Developers want <span className="text-foreground font-semibold">$15K+</span> (and 6 months of your life)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Coding tutorials make your eyes glaze over in 10 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>"No-code" tools still feel like learning a foreign language</span>
              </li>
            </ul>
            
            <p className="text-foreground font-medium text-xl pt-4">
              Here's the thing — I've built multiple 7-figure businesses from scratch. I've taught 
              over 150,000 people how to use AI. And I'm telling you: <span className="text-primary">the game has completely changed.</span>
            </p>
            
            <p className="text-muted-foreground">
              You can now build a real, working app in 5 days. Not a toy. Not a "prototype." 
              An actual app people can use.
            </p>
            
            <p className="text-xl font-bold text-gradient-primary pt-4">
              And I'll show you exactly how — for free.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default OpeningCopySection;
