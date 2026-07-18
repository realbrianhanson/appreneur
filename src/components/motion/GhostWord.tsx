import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface GhostWordProps {
  word: string;
  className?: string;
  /** Horizontal drift range in percent of container width. Default 4. */
  drift?: number;
  /** Vertical position offset (Tailwind class fragment). */
  align?: "top" | "center" | "bottom";
}

/**
 * Giant transparent-fill / stroke-only word rendered behind a section heading.
 * Drifts horizontally a few percent based on scroll progress.
 */
export function GhostWord({
  word,
  className,
  drift = 4,
  align = "center",
}: GhostWordProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [`-${drift}%`, `${drift}%`]);

  const alignClass =
    align === "top" ? "top-0" : align === "bottom" ? "bottom-0" : "top-1/2 -translate-y-1/2";

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 overflow-hidden select-none",
        alignClass,
        className
      )}
    >
      <motion.span
        style={{
          x,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "17vw",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(255,255,255,0.05)",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          display: "block",
        }}
      >
        {word}
      </motion.span>
    </div>
  );
}

export default GhostWord;