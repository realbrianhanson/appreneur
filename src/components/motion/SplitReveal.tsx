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
  const MotionTag = motion(Tag as any);
  const words = text.split(" ");
  let charIndex = 0;

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
      {words.map((word, wi) => (
        <span
          key={`w-${wi}`}
          aria-hidden
          className="inline-block whitespace-nowrap"
        >
          {Array.from(word).map((char, ci) => {
            const key = `${wi}-${ci}-${charIndex++}`;
            return (
              <motion.span
                key={key}
                aria-hidden
                className={cn("inline-block", charClassName)}
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
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </MotionTag>
  );
}

export default SplitReveal;