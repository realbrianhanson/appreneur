import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref + `paused` boolean that flips true when the element is
 * offscreen OR the tab is hidden. Consumers apply
 * `style={{ animationPlayState: paused ? "paused" : "running" }}` to any
 * CSS animation, or short-circuit their rAF loop while paused.
 */
export function usePauseWhenHidden<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let visible = true;
    let docVisible =
      typeof document !== "undefined" ? !document.hidden : true;

    const apply = () => setPaused(!(visible && docVisible));

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
        apply();
      },
      { rootMargin: "50px" }
    );
    io.observe(el);

    const onVis = () => {
      docVisible = !document.hidden;
      apply();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return { ref, paused };
}

export default usePauseWhenHidden;