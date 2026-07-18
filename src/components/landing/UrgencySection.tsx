import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Calendar } from "lucide-react";
import CountdownTimer from "@/components/quiz/CountdownTimer";
import { supabase } from "@/integrations/supabase/client";

interface UrgencySectionProps {
  cohortStartDate?: Date;
}

/** Next Tuesday at 12:00 noon local time, strictly in the future. */
const nextTuesdayNoon = (from: Date = new Date()): Date => {
  const d = new Date(from);
  const day = d.getDay(); // 0 Sun ... 2 Tue
  let daysUntil = (2 - day + 7) % 7;
  const candidate = new Date(d);
  candidate.setHours(12, 0, 0, 0);
  if (daysUntil === 0 && candidate.getTime() <= from.getTime()) {
    daysUntil = 7;
  }
  candidate.setDate(d.getDate() + daysUntil);
  candidate.setHours(12, 0, 0, 0);
  return candidate;
};

const UrgencySection = ({ cohortStartDate: propDate }: UrgencySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cohortStartDate, setCohortStartDate] = useState<Date | null>(propDate || null);
  const [maxSpots, setMaxSpots] = useState<number>(500);
  const [spotsTaken, setSpotsTaken] = useState<number>(0);
  const [fallbackTarget, setFallbackTarget] = useState<Date>(() => nextTuesdayNoon());
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

  useEffect(() => {
    if (propDate) return;

    const fetchCohort = async () => {
      try {
        const { data } = await supabase
          .from("cohorts")
          .select("start_date, max_participants, spots_taken")
          .eq("is_active", true)
          .eq("is_accepting_registrations", true)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (data) {
          setCohortStartDate(new Date(data.start_date));
          if (typeof data.max_participants === "number") setMaxSpots(data.max_participants);
          if (typeof data.spots_taken === "number") setSpotsTaken(data.spots_taken);
        }
      } catch (error) {
        console.error("Error fetching cohort:", error);
      }
    };

    fetchCohort();
  }, [propDate]);

  // Effective target: cohort date if in future, otherwise the next-Tuesday fallback
  const effectiveTarget = useMemo(() => {
    if (cohortStartDate && cohortStartDate.getTime() > Date.now()) {
      return cohortStartDate;
    }
    return fallbackTarget;
  }, [cohortStartDate, fallbackTarget]);

  const handleExpire = useCallback(() => {
    // Roll forward to the next Tuesday after the current fallback
    setFallbackTarget((prev) => nextTuesdayNoon(new Date(prev.getTime() + 1000)));
  }, []);

  const spotsLeft = Math.max(0, maxSpots - spotsTaken);
  const spotsPct = Math.min(100, Math.max(0, (spotsTaken / Math.max(1, maxSpots)) * 100));

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
                {formatDate(effectiveTarget)}
              </p>
            </div>

            {/* Countdown */}
            <div className="flex justify-center">
              <CountdownTimer targetDate={effectiveTarget} onExpire={handleExpire} />
            </div>

            {/* Spots left */}
            <div className="mt-10 max-w-md mx-auto">
              <div
                className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2"
                style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
              >
                <span>
                  <span className="text-primary font-semibold">{spotsLeft}</span> of {maxSpots} spots left
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
