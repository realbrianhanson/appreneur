import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Zap, Calendar } from "lucide-react";
import CountdownTimer from "@/components/quiz/CountdownTimer";

interface UrgencySectionProps {
  cohortStartDate: Date;
}

const UrgencySection = ({ cohortStartDate }: UrgencySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Section variant="muted" spacing="lg" className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      
      <Container size="wide" className="relative z-10">
        <div 
          ref={sectionRef}
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Urgency Banner */}
          <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-8 rounded-2xl border border-primary/30 bg-card/50 backdrop-blur-sm">
            {/* Icon & Date */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">
                  Next Challenge Starts
                </p>
                <p className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {formatDate(cohortStartDate)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-12 bg-border" />

            {/* Countdown */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground mb-2">Time Until Start:</p>
              <CountdownTimer targetDate={cohortStartDate} />
            </div>
          </div>

          {/* Context Text */}
          <p className="mt-6 text-muted-foreground">
            We run live cohorts to keep everyone accountable. Grab your spot before we start.
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default UrgencySection;
