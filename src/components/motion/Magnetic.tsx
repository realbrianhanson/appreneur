import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Fraction of cursor offset applied to element. Default 0.15 (15%). */
  strength?: number;
}

/**
 * Wraps content so it gently follows the mouse (spring-smoothed),
 * and springs back to origin on leave.
 */
export function Magnetic({ children, className, strength = 0.15 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (reduced) {
    return <div ref={ref} className={cn("inline-block", className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;