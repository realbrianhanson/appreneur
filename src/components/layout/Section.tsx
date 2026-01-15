import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "gradient";
  spacing?: "sm" | "default" | "lg" | "xl";
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", spacing = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-background",
      muted: "bg-background-secondary",
      gradient: "bg-hero-gradient",
    };

    const spacingStyles = {
      sm: "py-8 md:py-12",
      default: "py-12 md:py-16",
      lg: "py-16 md:py-24",
      xl: "py-24 md:py-32",
    };

    return (
      <section
        ref={ref}
        className={cn(
          variantStyles[variant],
          spacingStyles[spacing],
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
