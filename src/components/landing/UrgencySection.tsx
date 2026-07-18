import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Calendar } from "lucide-react";
import CountdownTimer from "@/components/quiz/CountdownTimer";
import { useNextCohort } from "@/hooks/useNextCohort";

const UrgencySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { targetDate, isFallback, spotsLeft, maxSpots, onExpire } = useNextCohort();

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

  const displayMaxSpots = maxSpots ?? 0;
  const displaySpotsLeft = spotsLeft ?? 0;
  const spotsPct = displayMaxSpots > 0
    ? Math.min(100, Math.max(0, ((displayMaxSpots - displaySpotsLeft) / displayMaxSpots) * 100))
    : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Section variant="muted" spacing="lg" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <Container size="wide" className="relative z-10">
        <div
          ref={sectionRef}
          className={`max-w-3xl mx-auto transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="rounded-3xl border border-primary/25 bg-card/40 backdrop-blur-sm p-8 md:p-10 shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.4)]">
            {/* Eyebrow */}
            <div
              className="flex items-center justify-center gap-2 mb-4"
              style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="text-[11px] md:text-xs uppercase tracking-[0.28em] text-primary font-semibold">
                Next Cohort Starts
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <Calendar className="w-6 h-6 text-primary" />
              <p
                className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                {formatDate(targetDate)}
              </p>
            </div>

            {/* Countdown */}
            <div className="flex justify-center">
              <CountdownTimer targetDate={targetDate} onExpire={onExpire} />
            </div>

            {/* Spots left — only render when a real future cohort exists */}
            {!isFallback && (
            <div className="mt-10 max-w-md mx-auto">
              <div
                className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                <span>
                  <span className="text-primary font-semibold">{displaySpotsLeft}</span> of {displayMaxSpots} spots left
                </span>
                <span className="tabular-nums">{Math.round(spotsPct)}%</span>
              </div>
              <div className="relative h-[3px] w-full rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_12px_hsl(var(--primary)/0.7)] transition-[width] duration-700"
                  style={{ width: `${spotsPct}%` }}
                />
              </div>
            </div>
            )}
          </div>

          <p className="mt-6 text-center text-muted-foreground">
            We run live cohorts to keep everyone accountable. Grab your spot before we start.
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default UrgencySection;
