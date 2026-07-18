import Lenis from "lenis";

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initLenis(): Lenis {
  if (lenisInstance) return lenisInstance;
  lenisInstance = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });
  const raf = (time: number) => {
    lenisInstance?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
  return lenisInstance;
}

export function destroyLenis() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
  lenisInstance?.destroy();
  lenisInstance = null;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Smooth scroll to a target. Falls back to native scroll if Lenis isn't ready.
 * Accepts a selector string, element, or numeric offset (in px from top).
 */
export function scrollTo(
  target: string | HTMLElement | number,
  options?: { offset?: number; duration?: number; immediate?: boolean }
) {
  const lenis = lenisInstance;
  if (lenis) {
    lenis.scrollTo(target as never, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.15,
      immediate: options?.immediate ?? false,
    });
    return;
  }
  // Fallback
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (typeof target === "string") {
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (target instanceof HTMLElement) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}