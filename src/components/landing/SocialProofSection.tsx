import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  isVisible: boolean;
}

const StatItem = ({ value, suffix = "", label, isVisible }: StatItemProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div className="text-center px-6 py-4">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
        {count}{suffix}
      </div>
      <div className="text-muted-foreground mt-2 text-sm md:text-base">{label}</div>
    </div>
  );
};

const testimonials = [
  {
    name: "Sarah M.",
    title: "Marketing Consultant",
    quote: "I built my first SaaS in 5 days. I finally have something real to show for my idea.",
    rating: 5,
    image: "SM",
  },
  {
    name: "Marcus T.",
    title: "Real Estate Investor",
    quote: "I thought I needed to hire a developer. Turns out I just needed this challenge.",
    rating: 5,
    image: "MT",
  },
  {
    name: "Jennifer K.",
    title: "Coach",
    quote: "The prompts alone saved me 100+ hours. Insane value for free.",
    rating: 5,
    image: "JK",
  },
  {
    name: "David R.",
    title: "Startup Founder",
    quote: "Shipped my MVP and got my first paying customer by Day 6.",
    rating: 5,
    image: "DR",
  },
  {
    name: "Amanda L.",
    title: "Content Creator",
    quote: "Finally understood how to turn my ideas into real products.",
    rating: 5,
    image: "AL",
  },
  {
    name: "Chris P.",
    title: "Agency Owner",
    quote: "The community support made all the difference. Never felt stuck.",
    rating: 5,
    image: "CP",
  },
];

const appShowcase = [
  { name: "Habit Tracker Pro", color: "from-blue-500 to-cyan-500" },
  { name: "Invoice Generator", color: "from-purple-500 to-pink-500" },
  { name: "Meal Planner AI", color: "from-orange-500 to-yellow-500" },
  { name: "Client Portal", color: "from-green-500 to-emerald-500" },
  { name: "Booking System", color: "from-red-500 to-orange-500" },
  { name: "Analytics Dashboard", color: "from-indigo-500 to-purple-500" },
];

const TestimonialCard = ({ 
  testimonial, 
  index, 
  isVisible 
}: { 
  testimonial: typeof testimonials[0]; 
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div
      className={`
        relative p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50
        transform transition-all duration-700 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Quote icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
      
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-foreground/90 mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
          {testimonial.image}
        </div>
        <div>
          <div className="font-semibold text-foreground">{testimonial.name}</div>
          <div className="text-sm text-muted-foreground">{testimonial.title}</div>
        </div>
      </div>
    </div>
  );
};

const AppCard = ({ 
  app, 
  index, 
  isVisible 
}: { 
  app: typeof appShowcase[0]; 
  index: number;
  isVisible: boolean;
}) => {
  return (
    <div
      className={`
        group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer
        transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/20
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 75}ms` }}
    >
      {/* App Preview Placeholder */}
      <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-20`} />
      <div className="absolute inset-0 bg-card/80 backdrop-blur-sm border border-border/50 group-hover:border-primary/50 transition-colors" />
      
      {/* Mock UI Elements */}
      <div className="absolute inset-0 p-4 flex flex-col">
        {/* Header bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 h-2 bg-muted/30 rounded-full" />
        </div>
        
        {/* Content placeholders */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-3/4 bg-muted/20 rounded" />
          <div className="h-3 w-1/2 bg-muted/20 rounded" />
          <div className="flex-1 grid grid-cols-2 gap-2 mt-2">
            <div className={`rounded bg-gradient-to-br ${app.color} opacity-30`} />
            <div className="rounded bg-muted/20" />
            <div className="rounded bg-muted/20" />
            <div className={`rounded bg-gradient-to-br ${app.color} opacity-30`} />
          </div>
        </div>
      </div>
      
      {/* Hover overlay with name */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <span className="font-semibold text-foreground">{app.name}</span>
      </div>
    </div>
  );
};

export const SocialProofSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isTestimonialsVisible, setIsTestimonialsVisible] = useState(false);
  const [isAppsVisible, setIsAppsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.dataset.section === "stats") setIsStatsVisible(true);
            if (target.dataset.section === "testimonials") setIsTestimonialsVisible(true);
            if (target.dataset.section === "apps") setIsAppsVisible(true);
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
            Join Entrepreneurs Who've{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Already Built
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real results from real people who took the challenge
          </p>
        </div>

        {/* Stats Bar */}
        <div
          data-section="stats"
          className="flex flex-wrap justify-center gap-4 md:gap-0 md:divide-x divide-border/50 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 mb-20"
        >
          <StatItem value={500} suffix="+" label="Apps Built" isVisible={isStatsVisible} />
          <StatItem value={47} label="Countries" isVisible={isStatsVisible} />
          <StatItem value={4.9} suffix="/5" label="Rating" isVisible={isStatsVisible} />
        </div>

        {/* Testimonials Grid */}
        <div data-section="testimonials" className="mb-24">
          <h3 className="text-2xl font-bold text-center mb-10">What Challengers Say</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
                index={index}
                isVisible={isTestimonialsVisible}
              />
            ))}
          </div>
        </div>

        {/* App Showcase */}
        <div data-section="apps">
          <h3 className="text-2xl font-bold text-center mb-4">
            Apps Built by Challenge Graduates
          </h3>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Real MVPs shipped in just 7 days — from idea to deployed product
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {appShowcase.map((app, index) => (
              <AppCard
                key={app.name}
                app={app}
                index={index}
                isVisible={isAppsVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
