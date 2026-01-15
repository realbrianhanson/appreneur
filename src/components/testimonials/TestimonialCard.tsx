import { useState } from "react";
import { Star, Quote, Award, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface TestimonialData {
  id: string;
  name: string;
  content: string;
  rating: number | null;
  app_name: string | null;
  app_screenshot_url: string | null;
  is_featured: boolean;
}

interface TestimonialCardProps {
  testimonial: TestimonialData;
  showFullContent?: boolean;
  className?: string;
}

export const TestimonialCard = ({
  testimonial,
  showFullContent = false,
  className = "",
}: TestimonialCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const maxChars = 200;
  const isLongContent = testimonial.content.length > maxChars;
  const displayContent =
    showFullContent || isExpanded
      ? testimonial.content
      : testimonial.content.slice(0, maxChars) + (isLongContent ? "..." : "");

  return (
    <>
      <div
        className={`
          relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border h-full flex flex-col
          ${testimonial.is_featured ? "border-primary/50 ring-2 ring-primary/20" : "border-border/50"}
          transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
          ${className}
        `}
      >
        {/* Featured Badge */}
        {testimonial.is_featured && (
          <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" />
            Featured
          </div>
        )}

        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />

        {/* Rating */}
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < (testimonial.rating || 5)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Quote */}
        <div className="flex-1">
          <p className="text-foreground/90 leading-relaxed">"{displayContent}"</p>
          {isLongContent && !showFullContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary text-sm font-medium mt-2 hover:underline"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* App Screenshot Thumbnail */}
        {testimonial.app_screenshot_url && (
          <button
            onClick={() => setShowScreenshot(true)}
            className="mt-4 relative group rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-colors"
          >
            <img
              src={testimonial.app_screenshot_url}
              alt={`${testimonial.app_name || "App"} screenshot`}
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-foreground" />
            </div>
          </button>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">
              {testimonial.name}
            </div>
            {testimonial.app_name && (
              <div className="text-sm text-muted-foreground truncate">
                Built: {testimonial.app_name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      <Dialog open={showScreenshot} onOpenChange={setShowScreenshot}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{testimonial.app_name || "App Screenshot"}</DialogTitle>
          </DialogHeader>
          {testimonial.app_screenshot_url && (
            <img
              src={testimonial.app_screenshot_url}
              alt={`${testimonial.app_name || "App"} screenshot`}
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
