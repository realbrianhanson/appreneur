// Pure helpers for authorization/completion guards. Kept dependency-free
// so they can be unit-tested and reused by any route or component.

export interface DayProgressLike {
  day_number: number;
  is_unlocked?: boolean;
  is_completed?: boolean;
  completed_at?: string | null;
}

/**
 * Only users who have actually completed Day 5 (with a real completed_at
 * timestamp) may generate a certificate. We never fall back to `new Date()`.
 */
export function canAccessGraduation(progress: DayProgressLike[] | null | undefined): boolean {
  if (!progress || progress.length === 0) return false;
  const day5 = progress.find((p) => p.day_number === 5);
  return !!(day5?.is_completed && day5?.completed_at);
}

/**
 * Returns the completed_at date for Day 5, or null when not completed.
 * Callers must handle null instead of falling back to today.
 */
export function graduationDate(progress: DayProgressLike[] | null | undefined): Date | null {
  if (!canAccessGraduation(progress)) return null;
  const day5 = progress!.find((p) => p.day_number === 5)!;
  return new Date(day5.completed_at!);
}
