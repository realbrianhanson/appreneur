import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
  /** Called once when the countdown reaches zero, so the parent can roll forward. */
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calc = (target: Date): TimeLeft => {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountdownTimer = ({ targetDate, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calc(targetDate));

  useEffect(() => {
    setTimeLeft(calc(targetDate));
    const timer = setInterval(() => {
      const diff = targetDate.getTime() - Date.now();
      setTimeLeft(calc(targetDate));
      if (diff <= 0 && onExpire) {
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-background/60 border border-primary/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <span
          className="text-2xl md:text-3xl font-bold text-foreground tabular-nums"
          style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
        >
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-[10px] md:text-[11px] text-muted-foreground mt-2 uppercase tracking-[0.18em]"
        style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
      >
        {label}
      </span>
    </div>
  );

  const Colon = () => (
    <span
      className="text-3xl md:text-4xl text-primary/40 font-light pb-6 select-none"
      style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
    >
      :
    </span>
  );

  return (
    <div className="flex items-end gap-2 md:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <Colon />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <Colon />
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <Colon />
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </div>
  );
};

export default CountdownTimer;
