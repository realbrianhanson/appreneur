import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Gift, FileText, Video, Users, Headphones, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface StackItem {
  title: string;
  caption: string;
  icon: LucideIcon;
  value: number;
}

const stackItems: StackItem[] = [
  {
    title: "50 Profitable App Ideas (PDF)",
    caption: "Validated ideas already making money. Pick one or use your own.",
    icon: FileText,
    value: 97,
  },
  {
    title: "5-Day Appreneur Challenge Access",
    caption: "Daily video training + assignments that take you from zero to live app.",
    icon: Video,
    value: 497,
  },
  {
    title: "Private Community Access",
    caption: "Connect with 99+ entrepreneurs building alongside you.",
    icon: Users,
    value: 197,
  },
  {
    title: "Daily Instructor Support from Brian",
    caption: "Get unstuck fast. I'm in there with you every single day.",
    icon: Headphones,
    value: 297,
  },
  {
    title: "Auto-Registration: 2-Day AI for Business Live Event",
    caption: "My flagship event where I go deep on AI for entrepreneurs.",
    icon: Calendar,
    value: 997,
  },
];

const TOTAL_VALUE = stackItems.reduce((sum, item) => sum + item.value, 0);

const ValueStackSection = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [showTotal, setShowTotal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stackItems.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) =>
                  prev.includes(index) ? prev : [...prev, index]
                );
              }, index * 200);
            });
            // Show total after all items
            setTimeout(() => setShowTotal(true), stackItems.length * 200 + 300);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToQuiz = () => {
    const quizElement = document.querySelector("#quiz-section");
    if (quizElement) {
      quizElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto">
      {/* Main Stack Card */}
      <div className="relative">
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 blur-xl opacity-60" />

        <div className="relative rounded-2xl border-2 border-primary/20 bg-card overflow-hidden">
          {/* Header ribbon */}
          <div className="bg-gradient-to-r from-primary to-accent px-6 py-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-primary-foreground" />
              <span className="font-display font-bold text-primary-foreground text-lg tracking-wide uppercase">
                Everything You Get — Instantly
              </span>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            {/* Stack Items */}
            <div className="space-y-3">
              {stackItems.map((item, index) => {
                const Icon = item.icon;
                const isVisible = visibleItems.includes(index);

                return (
                  <div
                    key={index}
                    className={cn(
                      "group relative flex items-start gap-4 p-4 md:p-5 rounded-xl transition-all duration-500",
                      "border border-border/60 hover:border-primary/30",
                      "hover:shadow-[var(--shadow-glow-primary)]",
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-3"
                    )}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {/* Checkmark circle */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500",
                        isVisible
                          ? "bg-primary text-primary-foreground scale-100"
                          : "bg-muted scale-50"
                      )}
                      style={{ transitionDelay: `${index * 50 + 200}ms` }}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Icon className="w-4 h-4 text-accent shrink-0" />
                        <h4 className="font-display font-bold text-foreground leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    {/* Value badge */}
                    <div className="shrink-0 self-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-display font-bold text-sm whitespace-nowrap">
                        ${item.value} value
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Running Total Divider */}
            <div
              className={cn(
                "transition-all duration-700",
                showTotal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

              {/* Price Anchoring Block */}
              <div className="text-center space-y-5">
                {/* Total Value */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-muted-foreground text-sm uppercase tracking-widest font-medium">
                    Total Value
                  </span>
                  <span className="relative text-2xl md:text-3xl font-display font-bold text-muted-foreground">
                    ${TOTAL_VALUE.toLocaleString()}
                    {/* Strikethrough line */}
                    <span className="absolute inset-0 flex items-center">
                      <span className="w-full h-0.5 bg-destructive rotate-[-3deg]" />
                    </span>
                  </span>
                </div>

                {/* Your price */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                    Your Price Today
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    <span className="text-7xl md:text-8xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      FREE
                    </span>
                    <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Button
                    variant="cta"
                    size="xl"
                    className="w-full md:w-auto md:px-16 text-lg py-7 group"
                    onClick={scrollToQuiz}
                  >
                    Claim Your Free Spot
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Seriously. $0. I just want to prove this works.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-muted-foreground">
        {["100% Free", "No Hidden Fees", "Instant Access"].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValueStackSection;
