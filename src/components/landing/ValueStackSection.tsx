import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, FileText, Video, Users, Mail, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface StackItem {
  title: string;
  caption: string;
  icon: LucideIcon;
  value: string;
}

const stackItems: StackItem[] = [
  {
    title: '"50 Profitable AI App Ideas for 2025" (PDF)',
    caption: "The exact list I use to validate app concepts before building",
    icon: FileText,
    value: "$47",
  },
  {
    title: "7-Day Appreneur Challenge Access",
    caption: "Daily video training from idea to deployment",
    icon: Video,
    value: "$197",
  },
  {
    title: "Private Community Access",
    caption: "Connect with 500+ fellow builders",
    icon: Users,
    value: "$97",
  },
  {
    title: "Daily Mission Emails",
    caption: "Stay accountable with step-by-step guidance",
    icon: Mail,
    value: "$47",
  },
  {
    title: "Certificate of Completion",
    caption: "Show off your new skills",
    icon: Award,
    value: "$27",
  },
  {
    title: "Auto-Registration to 3-Day AI For Business Event",
    caption: "Learn how to turn your app into a real business",
    icon: Calendar,
    value: "$97",
  },
];

const ValueStackSection = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the animations
            stackItems.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => 
                  prev.includes(index) ? prev : [...prev, index]
                );
              }, index * 150);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto">
      {/* Main Stack Card */}
      <div className="relative rounded-2xl p-1 bg-gradient-to-br from-primary/50 via-accent/30 to-secondary/50">
        <div className="rounded-xl bg-card p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <Badge variant="success" className="mx-auto">
              Instant Access
            </Badge>
            <p className="text-muted-foreground">
              Join now and unlock everything below:
            </p>
          </div>

          {/* Stack Items */}
          <div className="space-y-4">
            {stackItems.map((item, index) => {
              const Icon = item.icon;
              const isVisible = visibleItems.includes(index);

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl transition-all duration-500",
                    "bg-gradient-to-r from-muted/50 to-transparent",
                    "border border-border/50",
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {/* Checkmark */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                      isVisible
                        ? "bg-primary text-primary-foreground scale-100"
                        : "bg-muted scale-75"
                    )}
                    style={{ transitionDelay: `${index * 50 + 200}ms` }}
                  >
                    <Check className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-display font-bold text-foreground">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-sm text-muted-foreground line-through shrink-0">
                        {item.value}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Value & Price */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="text-muted-foreground">
                <span className="text-sm">Total Value:</span>
                <span className="ml-2 text-lg line-through">$497</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                Your Price Today
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl md:text-6xl font-display font-bold text-gradient-primary">
                  FREE
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              variant="cta"
              size="xl"
              className="w-full md:w-auto md:px-16"
              onClick={scrollToTop}
            >
              Get Instant Access
            </Button>

            <p className="text-xs text-muted-foreground">
              No credit card required • Instant access • Start building today
            </p>
          </div>
        </div>
      </div>

      {/* Extra trust element */}
      <div className="mt-8 flex items-center justify-center gap-8 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm">100% Free</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm">No Hidden Fees</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm">Instant Access</span>
        </div>
      </div>
    </div>
  );
};

export default ValueStackSection;
