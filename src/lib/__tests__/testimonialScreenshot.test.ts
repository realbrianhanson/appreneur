import { describe, it, expect } from "vitest";
import {
  parseScreenshot,
  isOwnedScreenshotPath,
  buildScreenshotPath,
} from "@/lib/testimonialScreenshot";

describe("testimonialScreenshot", () => {
  describe("parseScreenshot", () => {
    it("prefers app_screenshot_path when present", () => {
      expect(
        parseScreenshot({ app_screenshot_path: "abc/123.png", app_screenshot_url: "https://x/y" })
      ).toEqual({ kind: "path", value: "abc/123.png" });
    });

    it("treats http(s) legacy url as url", () => {
      expect(parseScreenshot({ app_screenshot_url: "https://cdn/x.png" })).toEqual({
        kind: "url",
        value: "https://cdn/x.png",
      });
    });

    it("treats bare legacy value as a path", () => {
      expect(parseScreenshot({ app_screenshot_url: "abc/legacy.png" })).toEqual({
        kind: "path",
        value: "abc/legacy.png",
      });
    });

    it("returns none when both fields empty", () => {
      expect(parseScreenshot({})).toEqual({ kind: "none" });
      expect(parseScreenshot({ app_screenshot_path: "", app_screenshot_url: null })).toEqual({
        kind: "none",
      });
    });
  });

  describe("isOwnedScreenshotPath", () => {
    const uid = "11111111-1111-1111-1111-111111111111";
    it("accepts paths whose first segment matches the user id", () => {
      expect(isOwnedScreenshotPath(`${uid}/1234.png`, uid)).toBe(true);
    });
    it("rejects paths under a different user", () => {
      expect(isOwnedScreenshotPath(`22222222-2222-2222-2222-222222222222/1.png`, uid)).toBe(false);
    });
    it("rejects flat filenames without a folder", () => {
      expect(isOwnedScreenshotPath("1234.png", uid)).toBe(false);
    });
    it("rejects empty inputs", () => {
      expect(isOwnedScreenshotPath("", uid)).toBe(false);
      expect(isOwnedScreenshotPath(`${uid}/1.png`, "")).toBe(false);
    });
  });

  describe("buildScreenshotPath", () => {
    const uid = "user-uid";
    it("produces a path under the owner folder", () => {
      const p = buildScreenshotPath(uid, "shot.png");
      expect(p.startsWith(`${uid}/`)).toBe(true);
      expect(p.endsWith(".png")).toBe(true);
      expect(isOwnedScreenshotPath(p, uid)).toBe(true);
    });
    it("normalizes unsupported extensions to png", () => {
      const p = buildScreenshotPath(uid, "shot.gif");
      expect(p.endsWith(".png")).toBe(true);
    });
    it("keeps allowed extensions", () => {
      expect(buildScreenshotPath(uid, "a.jpg").endsWith(".jpg")).toBe(true);
      expect(buildScreenshotPath(uid, "a.jpeg").endsWith(".jpeg")).toBe(true);
      expect(buildScreenshotPath(uid, "a.webp").endsWith(".webp")).toBe(true);
    });
    it("throws without a user id", () => {
      expect(() => buildScreenshotPath("", "a.png")).toThrow();
    });
  });
});