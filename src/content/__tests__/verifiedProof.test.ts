import { describe, it, expect } from "vitest";
import { VERIFIED_CLAIMS, isRenderable, getRenderableText } from "@/content/verifiedProof";

describe("verifiedProof render gate", () => {
  it("returns null for pending claims", () => {
    const pending = VERIFIED_CLAIMS.filter((c) => c.status === "pending");
    expect(pending.length).toBeGreaterThan(0);
    for (const c of pending) {
      expect(isRenderable(c.id)).toBe(false);
      expect(getRenderableText(c.id)).toBeNull();
    }
  });

  it("allows confirmed claims to render", () => {
    const confirmed = VERIFIED_CLAIMS.filter((c) => c.status === "confirmed");
    expect(confirmed.length).toBeGreaterThan(0);
    for (const c of confirmed) {
      expect(isRenderable(c.id)).toBe(true);
      expect(getRenderableText(c.id)).toBe(c.text);
    }
  });

  it("has the owner-confirmed AI For Business instructor claim", () => {
    expect(getRenderableText("instructor.brian.ai_for_business")).toContain(
      "AI For Business",
    );
  });

  it("does NOT confirm any numeric scale claims", () => {
    const numericIds = [
      "scale.500_plus",
      "scale.9_countries",
      "rating.4_9",
      "scale.learners_trained",
      "scale.aifb_reach",
    ];
    for (const id of numericIds) {
      expect(isRenderable(id)).toBe(false);
    }
  });
});