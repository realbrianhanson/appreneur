import { motion } from "framer-motion";
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
  stagger = 0.025,
  duration = 0.6,
}: SplitRevealProps) {
  const chars = Array.from(text);
  const MotionTag = motion(Tag as any);

  return (
    <MotionTag
      aria-label={text}
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
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          className={cn("inline-block whitespace-pre", charClassName)}
          variants={{
            hidden: { opacity: 0, y: "0.6em", rotate: -8 },
            visible: {
              opacity: 1,
              y: 0,
              rotate: 0,
              transition: { duration, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </MotionTag>
  );
}

export default SplitReveal;