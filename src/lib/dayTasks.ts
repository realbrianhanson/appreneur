// Canonical per-day task definitions. This mirrors what public.complete_task
// enforces on the server. Kept as a pure module for reuse in tests and any
// future client-side validation.

export interface TaskDef {
  id: string;
  required: boolean;
}

export const DAY_TASKS: Record<number, readonly TaskDef[]> = {
  1: [
    { id: "watch_video", required: true },
    { id: "define_idea", required: true },
    { id: "create_wireframe", required: true },
    { id: "share_community", required: false },
  ],
  2: [
    { id: "watch_video", required: true },
    { id: "setup_project", required: true },
    { id: "build_layout", required: true },
    { id: "add_navigation", required: false },
  ],
  3: [
    { id: "watch_video", required: true },
    { id: "add_features", required: true },
    { id: "connect_data", required: true },
    { id: "test_app", required: false },
  ],
  4: [
    { id: "watch_video", required: true },
    { id: "add_ai_feature", required: true },
    { id: "refine_prompts", required: true },
    { id: "integrate_ai", required: false },
  ],
  5: [
    { id: "watch_video", required: true },
    { id: "deploy_app", required: true },
    { id: "launch_app", required: true },
    { id: "share_success", required: true },
  ],
};

export function requiredTasks(day: number): string[] {
  return (DAY_TASKS[day] ?? []).filter((t) => t.required).map((t) => t.id);
}

export function optionalTasks(day: number): string[] {
  return (DAY_TASKS[day] ?? []).filter((t) => !t.required).map((t) => t.id);
}

export function knownTasks(day: number): string[] {
  return (DAY_TASKS[day] ?? []).map((t) => t.id);
}

/**
 * Given a set of completed task ids, decide whether a day counts as done.
 * Optional items are intentionally ignored.
 */
export function isDayComplete(day: number, completed: Iterable<string>): boolean {
  const set = new Set(completed);
  const required = requiredTasks(day);
  if (required.length === 0) return false;
  return required.every((id) => set.has(id));
}

// ---------------------------------------------------------------
// complete-day precondition
// ---------------------------------------------------------------

export interface DayRowLike {
  is_completed?: boolean | null;
  completed_at?: string | null;
}

/**
 * The complete-day endpoint is non-authoritative: it may only run when the
 * server has already marked the row complete via complete_task. Callers
 * that get `false` here should respond with HTTP 409.
 */
export function canRecordDayCompletion(row: DayRowLike | null | undefined): boolean {
  if (!row) return false;
  return !!row.is_completed && !!row.completed_at;
}
