import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TestimonialCard, TestimonialData } from "./TestimonialCard";

interface TestimonialGridProps {
  testimonials: TestimonialData[];
  pageSize?: number;
  showFilters?: boolean;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

type RatingFilter = "all" | "5" | "4";

export const TestimonialGrid = ({
  testimonials,
  pageSize = 6,
  showFilters = true,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: TestimonialGridProps) => {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Filter testimonials by rating
  const filteredTestimonials = testimonials.filter((t) => {
    if (ratingFilter === "all") return true;
    if (ratingFilter === "5") return (t.rating || 5) === 5;
    if (ratingFilter === "4") return (t.rating || 5) >= 4;
    return true;
  });

  // Sort featured first
  const sortedTestimonials = [...filteredTestimonials].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  // Paginate
  const visibleTestimonials = sortedTestimonials.slice(0, visibleCount);
  const canShowMore = visibleCount < sortedTestimonials.length || hasMore;

  const handleLoadMore = () => {
    if (visibleCount < sortedTestimonials.length) {
      setVisibleCount((prev) => prev + pageSize);
    } else if (onLoadMore) {
      onLoadMore();
    }
  };

  const filterButtons: { label: string; value: RatingFilter; icon?: React.ReactNode }[] = [
    { label: "All Reviews", value: "all" },
    {
      label: "5 Stars",
      value: "5",
      icon: <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />,
    },
    {
      label: "4+ Stars",
      value: "4",
      icon: <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Rating Filters */}
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.value}
              variant={ratingFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setRatingFilter(filter.value);
                setVisibleCount(pageSize);
              }}
              className="gap-1"
            >
              {filter.icon}
              {filter.label}
            </Button>
          ))}
        </div>
      )}

      {/* Masonry Grid — pt-4 reserves space for the -top-3 Featured badge */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pt-4">
        {visibleTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="break-inside-avoid">
            <TestimonialCard testimonial={testimonial} showFullContent />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTestimonials.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          No testimonials match the selected filter.
        </div>
      )}

      {/* Load More */}
      {canShowMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Testimonials"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
