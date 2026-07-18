import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SplitRevealProps {
  text: string;
  /**
   * Class applied to EACH character span.
   * Use this for gradient text (background-clip:text) since applying
   * a gradient on the parent breaks across inline-block children.
   */
  charClassName?: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
  stagger?: number;
  duration?: number;
}

/**
 * Splits text into characters and animates each one on mount with a
 * staggered fade + slide-up + slight rotate-out.
 */
export function SplitReveal({
  text,
  charClassName,
  className,
  as: Tag = "span",
  delay = 0,
  stagger = 0.05,
  duration = 0.4,
}: SplitRevealProps) {
  const MotionTag = motion(Tag as any);
  const words = text.split(" ");
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <Tag className={cn("inline-block", className)}>
        <span className="sr-only">{text}</span>
        {charClassName ? (
          <span aria-hidden className={charClassName}>{text}</span>
        ) : (
          <span aria-hidden>{text}</span>
        )}
      </Tag>
    );
  }

  return (
    <MotionTag
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      <span className="sr-only">{text}</span>
      {words.map((word, wi) => (
        <span key={`wg-${wi}`} aria-hidden>
          <motion.span
            aria-hidden
            className={cn("inline-flex", charClassName)}
            variants={{
              hidden: { opacity: 0, y: "0.5em" },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {word}
          </motion.span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </MotionTag>
  );
}

export default SplitReveal;