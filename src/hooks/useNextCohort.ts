import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CohortRecord {
  id: string;
  name: string;
  start_date: string;
  max_participants: number;
  spots_taken: number;
  is_accepting_registrations: boolean;
}

export interface UseNextCohortResult {
  cohort: CohortRecord | null;
  /** Guaranteed to be in the future. Rolls forward if it expires. */
  targetDate: Date;
  /** True when no future DB cohort exists and we're falling back to next-Tuesday-noon. */
  isFallback: boolean;
  loading: boolean;
  /** Spots remaining, only meaningful when isFallback === false. */
  spotsLeft: number | null;
  maxSpots: number | null;
  /** Call when a countdown expires; rolls the fallback target forward. */
  onExpire: () => void;
}

/**
 * Next Tuesday at 12:00 noon local time, strictly in the future.
 * Shared fallback for when no upcoming cohort exists in the DB.
 */
export const nextTuesdayNoon = (from: Date = new Date()): Date => {
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

/**
 * Single source of truth for the "next cohort" across the funnel.
 *
 * Query: is_accepting_registrations = true AND start_date > now(), ORDER BY start_date ASC, LIMIT 1.
 * If none, falls back to next-Tuesday-noon so the funnel always shows an upcoming date.
 * The returned targetDate is guaranteed to be in the future.
 */
export function useNextCohort(): UseNextCohortResult {
  const [cohort, setCohort] = useState<CohortRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackTarget, setFallbackTarget] = useState<Date>(() => nextTuesdayNoon());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const nowIso = new Date().toISOString();
        const { data } = await supabase
          .from("cohorts")
          .select("id, name, start_date, max_participants, spots_taken, is_accepting_registrations")
          .eq("is_accepting_registrations", true)
          .gt("start_date", nowIso)
          .order("start_date", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!cancelled) {
          setCohort((data as CohortRecord | null) ?? null);
        }
      } catch (error) {
        console.error("useNextCohort: fetch failed", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cohortDate = useMemo(
    () => (cohort ? new Date(cohort.start_date) : null),
    [cohort],
  );

  const isFallback = !cohortDate || cohortDate.getTime() <= Date.now();

  const targetDate = useMemo(() => {
    if (cohortDate && cohortDate.getTime() > Date.now()) return cohortDate;
    return fallbackTarget;
  }, [cohortDate, fallbackTarget]);

  const onExpire = useCallback(() => {
    // Roll the fallback forward to the following Tuesday.
    setFallbackTarget((prev) => nextTuesdayNoon(new Date(prev.getTime() + 1000)));
  }, []);

  const spotsLeft = !isFallback && cohort
    ? Math.max(0, cohort.max_participants - cohort.spots_taken)
    : null;
  const maxSpots = !isFallback && cohort ? cohort.max_participants : null;

  return {
    cohort: isFallback ? null : cohort,
    targetDate,
    isFallback,
    loading,
    spotsLeft,
    maxSpots,
    onExpire,
  };
}

export default useNextCohort;