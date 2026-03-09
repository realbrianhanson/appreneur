import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

interface StickyCtaBarProps {
  onCtaClick: () => void;
}

const StickyCtaBar = ({ onCtaClick }: StickyCtaBarProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~70vh (hero section)
      setIsVisible(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm md:text-base text-foreground">
              Appreneur Challenge
            </span>
            <span className="hidden md:inline text-sm text-muted-foreground">
              — Free 5-Day App Building Challenge
            </span>
          </div>

          <Button
            variant="cta"
            size="sm"
            className="text-sm"
            onClick={onCtaClick}
          >
            Join Free
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyCtaBar;
