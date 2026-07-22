import { describe, it, expect } from "vitest";
import { canAccessGraduation, graduationDate } from "@/lib/progressGuards";

describe("progressGuards", () => {
  it("blocks access when progress is empty or unloaded", () => {
    expect(canAccessGraduation([])).toBe(false);
    expect(canAccessGraduation(null)).toBe(false);
    expect(canAccessGraduation(undefined)).toBe(false);
  });

  it("blocks when Day 5 is not completed", () => {
    const progress = [1, 2, 3, 4, 5].map((d) => ({
      day_number: d,
      is_completed: d < 5,
      completed_at: d < 5 ? new Date().toISOString() : null,
    }));
    expect(canAccessGraduation(progress)).toBe(false);
    expect(graduationDate(progress)).toBeNull();
  });

  it("blocks when Day 5 is completed but completed_at is missing", () => {
    const progress = [{ day_number: 5, is_completed: true, completed_at: null }];
    expect(canAccessGraduation(progress)).toBe(false);
    expect(graduationDate(progress)).toBeNull();
  });

  it("allows access when Day 5 is completed with a real timestamp", () => {
    const ts = "2026-03-01T10:00:00.000Z";
    const progress = [{ day_number: 5, is_completed: true, completed_at: ts }];
    expect(canAccessGraduation(progress)).toBe(true);
    expect(graduationDate(progress)?.toISOString()).toBe(ts);
  });
});