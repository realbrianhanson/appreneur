// Helpers for resolving testimonial screenshot values.
//
// Historically we stored a permanent public URL in `app_screenshot_url`.
// After the P0 lockdown, the app-screenshots bucket is private and new
// submissions store an object path (e.g. "<uid>/<ts>.png") in
// `app_screenshot_path`. Consumers must resolve paths to short-lived
// signed URLs; legacy full URLs are returned as-is for graceful fallback.

export type ScreenshotRef = { kind: "path"; value: string } | { kind: "url"; value: string } | { kind: "none" };

/**
 * Parse a testimonial row's screenshot fields. Prefers the new
 * `app_screenshot_path` column when present. Any http(s) value is
 * treated as a legacy public URL.
 */
export function parseScreenshot(row: {
  app_screenshot_path?: string | null;
  app_screenshot_url?: string | null;
}): ScreenshotRef {
  const path = row.app_screenshot_path?.trim();
  if (path) return { kind: "path", value: path };

  const legacy = row.app_screenshot_url?.trim();
  if (!legacy) return { kind: "none" };
  if (/^https?:\/\//i.test(legacy)) return { kind: "url", value: legacy };
  // A bare filename ended up in the old column — treat as a path.
  return { kind: "path", value: legacy };
}

/**
 * Owner-scope check: the first path segment must equal the user id.
 * Mirrors the storage.objects RLS predicate.
 */
export function isOwnedScreenshotPath(path: string, userId: string): boolean {
  if (!path || !userId) return false;
  const [first] = path.split("/");
  return first === userId;
}

/**
 * Build the canonical object path for a new upload.
 * Rejects filenames that would escape the owner's folder.
 */
export function buildScreenshotPath(userId: string, filename: string): string {
  if (!userId) throw new Error("userId required");
  const ext = (filename.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "png";
  return `${userId}/${Date.now()}.${safeExt}`;
}