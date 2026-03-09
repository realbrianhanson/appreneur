import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialCarousel, TestimonialData, TestimonialStats } from "@/components/testimonials";

interface StatItemProps {
  value: string;
  label: string;
  isVisible: boolean;
}

const StatItem = ({ value, label, isVisible }: StatItemProps) => {
  return (
    <div className={`text-center px-6 py-4 transition-all duration-700 ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-muted-foreground mt-2 text-sm md:text-base">{label}</div>
    </div>
  );
};

// Fallback testimonials with enhanced format
const fallbackTestimonials: TestimonialData[] = [
  {
    id: "1",
    name: "Sarah M.",
    content: "I went from never building anything to having a live app in 6 days. Brian breaks it down so anyone can do this.",
    rating: 5,
    app_name: "TaskFlow Pro",
    app_screenshot_url: null,
    is_featured: true,
  },
  {
    id: "2",
    name: "Marcus T.",
    content: "I thought I needed to hire a developer. Turns out I just needed this challenge. Built my booking system in 5 days.",
    rating: 5,
    app_name: "BookEasy",
    app_screenshot_url: null,
    is_featured: true,
  },
  {
    id: "3",
    name: "Jennifer K.",
    content: "Zero coding experience. Now I have a live SaaS that's getting paying customers. The prompts alone saved me 100+ hours.",
    rating: 5,
    app_name: "LeadGen AI",
    app_screenshot_url: null,
    is_featured: true,
  },
  {
    id: "4",
    name: "David R.",
    content: "Shipped my MVP and got my first paying customer by Day 6. This system just works.",
    rating: 5,
    app_name: "LeadFlow",
    app_screenshot_url: null,
    is_featured: true,
  },
  {
    id: "5",
    name: "Amanda L.",
    content: "Finally understood how to turn my ideas into real products. Built my client portal in a week.",
    rating: 5,
    app_name: "ClientHub",
    app_screenshot_url: null,
    is_featured: false,
  },
  {
    id: "6",
    name: "Chris P.",
    content: "The community support made all the difference. Never felt stuck for more than an hour.",
    rating: 5,
    app_name: "CoachBot",
    app_screenshot_url: null,
    is_featured: false,
  },
];

export const SocialProofSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isTestimonialsVisible, setIsTestimonialsVisible] = useState(false);
  
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(fallbackTestimonials);

  useEffect(() => {
    // Fetch approved testimonials from database
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, name, content, rating, app_name, app_screenshot_url, is_featured")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(9);
      
      if (!error && data && data.length > 0) {
        setTestimonials(data as TestimonialData[]);
      }
    };
    
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.dataset.section === "stats") setIsStatsVisible(true);
            if (target.dataset.section === "testimonials") setIsTestimonialsVisible(true);
            
          }
        });
      },
      { threshold: 0.2 }
    );

    const sections = sectionRef.current?.querySelectorAll("[data-section]");
    sections?.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Real People. Real Apps.{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Real Results.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            500+ entrepreneurs from 9 countries have built working apps using this exact system.
          </p>
          <TestimonialStats className="mx-auto" />
        </div>

        {/* Stats Bar - Clear & Labeled */}
        <div
          data-section="stats"
          className="flex flex-wrap justify-center gap-4 md:gap-0 md:divide-x divide-border/50 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 mb-20"
        >
          <StatItem value="500+" label="Apps Built" isVisible={isStatsVisible} />
          <StatItem value="9" label="Countries" isVisible={isStatsVisible} />
          <StatItem value="4.9★" label="Rating" isVisible={isStatsVisible} />
        </div>

        {/* Testimonials Carousel */}
        <div 
          data-section="testimonials" 
          className={`mb-24 transition-opacity duration-700 ${isTestimonialsVisible ? "opacity-100" : "opacity-0"}`}
        >
          <h3 className="text-2xl font-bold text-center mb-10">What Challengers Say</h3>
          <TestimonialCarousel testimonials={testimonials} autoplayDelay={5000} />
        </div>

      </div>
    </section>
  );
};
