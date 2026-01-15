import { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg bg-card border border-border flex items-center justify-center">
        <span className="text-xl md:text-2xl font-display font-bold text-primary">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-2xl text-muted-foreground font-light">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl text-muted-foreground font-light">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="text-2xl text-muted-foreground font-light">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </div>
  );
};

export default CountdownTimer;
