/**
 * Native smooth-scroll helper. Signature-compatible with the removed Lenis
 * helper so existing call sites keep working.
 */
export function scrollTo(
  target: string | HTMLElement | number,
  options?: { offset?: number }
) {
  const offset = options?.offset ?? 0;
  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior: "smooth" });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (offset) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export default scrollTo;