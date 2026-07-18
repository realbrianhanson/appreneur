import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { usePauseWhenHidden } from "@/hooks/usePauseWhenHidden";

const ORBS = [
  { cls: "top-20 left-10 w-2 h-2 bg-primary/30", delay: "0s" },
  { cls: "top-40 right-20 w-3 h-3 bg-accent/30", delay: "0.5s" },
  { cls: "bottom-32 left-1/4 w-2 h-2 bg-secondary/30", delay: "1s" },
  { cls: "top-1/3 right-1/3 w-1.5 h-1.5 bg-primary/20", delay: "1.5s" },
  { cls: "bottom-1/4 right-10 w-2.5 h-2.5 bg-accent/20", delay: "2s" },
  { cls: "top-1/2 left-20 w-1.5 h-1.5 bg-secondary/20", delay: "2.5s" },
];

const FloatingParticles = () => {
  const reduced = useReducedMotion();
  const { ref, paused } = usePauseWhenHidden<HTMLDivElement>();
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const on = () => setIsSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  if (reduced) return null;

  const orbs = isSmall ? ORBS.slice(0, 3) : ORBS;
  const playState = paused ? "paused" : "running";

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full animate-float ${o.cls}`}
          style={{ animationDelay: o.delay, animationPlayState: playState }}
        />
      ))}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
    </div>
  );
};

export default FloatingParticles;
