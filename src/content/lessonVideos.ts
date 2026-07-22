/**
 * Central registry for the recorded lesson videos and the top-of-page VSL.
 * The customer-facing app must never render a placeholder or empty player.
 * Any `videoUrl` that is empty or literally contains "TODO" is treated as
 * "not configured", and consumers hide the corresponding UI entirely.
 *
 * The release readiness gate (`scripts/release-check.mjs`) fails when any
 * of these URLs are not configured, so the owner cannot accidentally ship
 * an unfinished offer.
 */

export interface LessonVideo {
  day: number;
  title: string;
  videoUrl: string;
}

export const LESSON_VIDEOS: readonly LessonVideo[] = [
  { day: 1, title: "Choose the idea worth building.", videoUrl: "TODO" },
  { day: 2, title: "Turn the idea into a buildable first version.", videoUrl: "TODO" },
  { day: 3, title: "Make the core experience real.", videoUrl: "TODO" },
  { day: 4, title: "Make it genuinely useful with AI.", videoUrl: "TODO" },
  { day: 5, title: "Polish it. Test it. Publish it.", videoUrl: "TODO" },
] as const;

/**
 * Landing-page VSL. 3–5 minute video that appears after the hero + authority
 * strip. Renders only when the URL is real (not empty, not "TODO").
 */
export interface LandingVsl {
  title: string;
  posterUrl: string;
  videoUrl: string;
}

export const LANDING_VSL: LandingVsl = {
  title: "See what you'll build—and why five days is enough.",
  posterUrl: "",
  videoUrl: "TODO",
};

export function isVideoConfigured(url: string | undefined | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.toUpperCase().includes("TODO")) return false;
  return /^https?:\/\//i.test(trimmed);
}