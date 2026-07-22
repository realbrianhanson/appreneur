import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { mergeTimeSnapshot, MAX_TIME_PER_CALL_S, MAX_TOTAL_TIME_S } from "@/lib/dayTasks";

describe("mergeTimeSnapshot — retry-idempotent time calculation", () => {
  it("treats the snapshot as an absolute lower bound, not a delta", () => {
    // Two identical retries must yield the same stored total.
    const a = mergeTimeSnapshot(100, 250);
    expect(a).toBe(250);
    const b = mergeTimeSnapshot(a ?? 0, 250);
    expect(b).toBeNull(); // no-op on retry
  });

  it("never lowers the stored total", () => {
    expect(mergeTimeSnapshot(500, 200)).toBeNull();
  });

  it("no-ops when snapshot is missing / invalid / non-positive", () => {
    expect(mergeTimeSnapshot(100, undefined)).toBeNull();
    expect(mergeTimeSnapshot(100, null)).toBeNull();
    expect(mergeTimeSnapshot(100, 0)).toBeNull();
    expect(mergeTimeSnapshot(100, -5)).toBeNull();
    expect(mergeTimeSnapshot(100, Number.NaN)).toBeNull();
    expect(mergeTimeSnapshot(100, "300" as unknown)).toBeNull();
  });

  it("caps the per-call snapshot at MAX_TIME_PER_CALL_S", () => {
    // Wildly padded client value must be clamped before comparison.
    const huge = 999_999_999;
    expect(mergeTimeSnapshot(0, huge)).toBe(MAX_TIME_PER_CALL_S);
  });

  it("clamps the row total at MAX_TOTAL_TIME_S", () => {
    // Once the stored total is at or above the row ceiling, further
    // retries — even wildly padded ones — are no-ops.
    expect(mergeTimeSnapshot(MAX_TOTAL_TIME_S, 999_999_999)).toBeNull();
    // A stored total already past the per-call cap cannot be raised by
    // any capped snapshot either.
    expect(mergeTimeSnapshot(MAX_TIME_PER_CALL_S + 100, 999_999_999)).toBeNull();
  });

  it("is stable across a full retry storm", () => {
    let cur = 0;
    const snapshot = 1_800; // 30 minutes
    for (let i = 0; i < 25; i++) {
      const next = mergeTimeSnapshot(cur, snapshot);
      if (next !== null) cur = next;
    }
    // Only the first call moves the number; every retry after is a no-op.
    expect(cur).toBe(1_800);
  });
});

// -----------------------------------------------------------
// Trusted-write marker contract (design regression).
//
// This is a doc-style test: we can't run Postgres from Vitest, but we can
// prove the migration + trigger *design* stays intact by scanning the
// on-disk migration SQL. If a future edit removes the transaction-local
// `app.trusted_progress_write` marker from one of the SECURITY DEFINER
// functions — or weakens the trigger check — these assertions fail loudly.
// -----------------------------------------------------------

function loadAllMigrations(): string {
  const dir = join(process.cwd(), "supabase", "migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n-- ---- next file ---- --\n");
}

/** Return the body of the LAST definition of a given function in the SQL. */
function lastFunctionBody(sql: string, name: string): string {
  const re = new RegExp(
    // captures body between the function header and the closing `\$\$;`
    `CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${name}\\b[\\s\\S]*?AS\\s+\\$\\$([\\s\\S]*?)\\$\\$\\s*;`,
    "gi",
  );
  let match: RegExpExecArray | null;
  let last = "";
  while ((match = re.exec(sql)) !== null) last = match[1];
  return last;
}

describe("trusted-write marker contract", () => {
  const sql = loadAllMigrations();

  it("protect_user_progress_gating_columns permits service_role OR the trusted marker only", () => {
    const body = lastFunctionBody(sql, "protect_user_progress_gating_columns");
    expect(body).not.toBe("");

    // Approves the two trusted paths.
    expect(body).toMatch(/auth\.role\(\)\s*=\s*'service_role'/);
    expect(body).toMatch(/current_setting\(\s*'app\.trusted_progress_write'\s*,\s*true\s*\)/);

    // Explicitly reverts every gating column on the untrusted path.
    expect(body).toMatch(/NEW\.is_unlocked\s*:=\s*OLD\.is_unlocked/);
    expect(body).toMatch(/NEW\.is_completed\s*:=\s*OLD\.is_completed/);
    expect(body).toMatch(/NEW\.completed_at\s*:=\s*OLD\.completed_at/);
    expect(body).toMatch(/NEW\.tasks_completed\s*:=\s*OLD\.tasks_completed/);

    // Must NOT rely on role-name detection.
    expect(body).not.toMatch(/current_setting\(\s*'role'/);
    expect(body).not.toMatch(/\bcurrent_user\b/);
  });

  it("complete_task sets the trusted marker before its gating update", () => {
    const body = lastFunctionBody(sql, "complete_task");
    expect(body).not.toBe("");

    // Marker call must appear (transaction-local via the third arg = true).
    const markerRe =
      /PERFORM\s+set_config\(\s*'app\.trusted_progress_write'\s*,\s*'on'\s*,\s*true\s*\)/i;
    expect(body).toMatch(markerRe);

    // ...and it must come before the UPDATE on user_progress.
    const markerIdx = body.search(markerRe);
    const updateIdx = body.search(/UPDATE\s+public\.user_progress/i);
    expect(markerIdx).toBeGreaterThan(-1);
    expect(updateIdx).toBeGreaterThan(-1);
    expect(markerIdx).toBeLessThan(updateIdx);
  });

  it("initialize_user_progress sets the trusted marker before unlocking day 1", () => {
    const body = lastFunctionBody(sql, "initialize_user_progress");
    expect(body).not.toBe("");
    const markerRe =
      /PERFORM\s+set_config\(\s*'app\.trusted_progress_write'\s*,\s*'on'\s*,\s*true\s*\)/i;
    expect(body).toMatch(markerRe);
    const markerIdx = body.search(markerRe);
    const updateIdx = body.search(/UPDATE\s+public\.user_progress/i);
    expect(markerIdx).toBeLessThan(updateIdx);
  });

  it("initialize_user_progress_for sets the trusted marker before unlocking day 1", () => {
    const body = lastFunctionBody(sql, "initialize_user_progress_for");
    expect(body).not.toBe("");
    const markerRe =
      /PERFORM\s+set_config\(\s*'app\.trusted_progress_write'\s*,\s*'on'\s*,\s*true\s*\)/i;
    expect(body).toMatch(markerRe);
    const markerIdx = body.search(markerRe);
    const updateIdx = body.search(/UPDATE\s+public\.user_progress/i);
    expect(markerIdx).toBeLessThan(updateIdx);
  });
});