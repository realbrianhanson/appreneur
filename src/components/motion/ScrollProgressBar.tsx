import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin amber gradient scroll-progress bar fixed to the top of the viewport.
 * scaleX is driven by document scroll progress and spring-smoothed.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.3,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "0% 50%",
        background: "linear-gradient(90deg, #FFA04D, #FF6A00)",
      }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] pointer-events-none"
    />
  );
}

export default ScrollProgressBar;