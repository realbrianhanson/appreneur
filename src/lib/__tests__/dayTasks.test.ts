import { describe, it, expect } from "vitest";
import {
  DAY_TASKS,
  requiredTasks,
  optionalTasks,
  knownTasks,
  isDayComplete,
  canRecordDayCompletion,
} from "@/lib/dayTasks";

describe("dayTasks required vs optional", () => {
  it("matches the canonical required arrays from the DB migration", () => {
    expect(requiredTasks(1)).toEqual(["watch_video", "define_idea", "create_wireframe"]);
    expect(requiredTasks(2)).toEqual(["watch_video", "setup_project", "build_layout"]);
    expect(requiredTasks(3)).toEqual(["watch_video", "add_features", "connect_data"]);
    expect(requiredTasks(4)).toEqual(["watch_video", "add_ai_feature", "refine_prompts"]);
    expect(requiredTasks(5)).toEqual([
      "watch_video",
      "deploy_app",
      "launch_app",
      "share_success",
    ]);
  });

  it("keeps the known optional items on days 1–4 and none on day 5", () => {
    expect(optionalTasks(1)).toEqual(["share_community"]);
    expect(optionalTasks(2)).toEqual(["add_navigation"]);
    expect(optionalTasks(3)).toEqual(["test_app"]);
    expect(optionalTasks(4)).toEqual(["integrate_ai"]);
    expect(optionalTasks(5)).toEqual([]);
  });

  it("required and optional together equal the known set", () => {
    for (const day of [1, 2, 3, 4, 5]) {
      const merged = [...requiredTasks(day), ...optionalTasks(day)].sort();
      expect(merged).toEqual([...knownTasks(day)].sort());
    }
  });

  it("optional-only completion does NOT finish the day", () => {
    // Day 1: only the optional community share is done — must stay incomplete.
    expect(isDayComplete(1, ["share_community"])).toBe(false);
    // Day 3: only optional test_app checked.
    expect(isDayComplete(3, ["test_app"])).toBe(false);
  });

  it("all required completes the day, even without optionals", () => {
    expect(isDayComplete(1, ["watch_video", "define_idea", "create_wireframe"])).toBe(true);
    expect(isDayComplete(4, ["watch_video", "add_ai_feature", "refine_prompts"])).toBe(true);
  });

  it("optionals do not turn an incomplete day into a completed one", () => {
    // Missing one required task; extra optional check must not tip it over.
    expect(
      isDayComplete(2, ["watch_video", "setup_project", "add_navigation"])
    ).toBe(false);
  });

  it("day 5 requires all four canonical tasks", () => {
    expect(isDayComplete(5, ["watch_video", "deploy_app", "launch_app"])).toBe(false);
    expect(
      isDayComplete(5, ["watch_video", "deploy_app", "launch_app", "share_success"])
    ).toBe(true);
  });

  it("guards against unknown days", () => {
    expect(requiredTasks(0)).toEqual([]);
    expect(requiredTasks(6)).toEqual([]);
    expect(isDayComplete(0, ["anything"])).toBe(false);
  });
});

describe("canRecordDayCompletion (complete-day precondition)", () => {
  it("returns false when the row is missing", () => {
    expect(canRecordDayCompletion(null)).toBe(false);
    expect(canRecordDayCompletion(undefined)).toBe(false);
  });

  it("returns false when the day isn't marked complete", () => {
    expect(canRecordDayCompletion({ is_completed: false, completed_at: null })).toBe(false);
  });

  it("returns false when the flag is set but the timestamp is missing", () => {
    expect(canRecordDayCompletion({ is_completed: true, completed_at: null })).toBe(false);
  });

  it("returns true only when both fields are set", () => {
    expect(
      canRecordDayCompletion({ is_completed: true, completed_at: "2026-05-01T10:00:00Z" })
    ).toBe(true);
  });

  it("DAY_TASKS is frozen-shaped: has exactly 5 days", () => {
    expect(Object.keys(DAY_TASKS).sort()).toEqual(["1", "2", "3", "4", "5"]);
  });
});