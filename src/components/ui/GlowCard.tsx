import * as React from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "primary" | "secondary" | "accent";
  hover?: boolean;
}

const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glowColor = "primary", hover = true, children, ...props }, ref) => {
    const glowStyles = {
      primary: "hover:shadow-glow-primary",
      secondary: "hover:shadow-glow-secondary",
      accent: "hover:shadow-glow-accent",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-card p-6 border border-border/50 transition-all duration-300",
          "bg-gradient-to-b from-card-hover to-card",
          hover && glowStyles[glowColor],
          hover && "hover:border-primary/30 hover:scale-[1.01]",
          "border-glow",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlowCard.displayName = "GlowCard";

const GlowCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
GlowCardHeader.displayName = "GlowCardHeader";

const GlowCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold font-display leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
GlowCardTitle.displayName = "GlowCardTitle";

const GlowCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
GlowCardDescription.displayName = "GlowCardDescription";

const GlowCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
GlowCardContent.displayName = "GlowCardContent";

const GlowCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
GlowCardFooter.displayName = "GlowCardFooter";

export {
  GlowCard,
  GlowCardHeader,
  GlowCardTitle,
  GlowCardDescription,
  GlowCardContent,
  GlowCardFooter,
};
