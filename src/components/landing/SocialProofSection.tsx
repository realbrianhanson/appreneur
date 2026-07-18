import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialData } from "@/components/testimonials";
import { CountUp } from "@/components/motion/CountUp";
import { GhostWord } from "@/components/motion/GhostWord";

// Fallback testimonials with enhanced format
const fallbackTestimonials: TestimonialData[] = [
  {
    id: "1",
    name: "Sarah M.",
    content: "I went from never building anything to having a live app in 5 days. Brian breaks it down so anyone can do this.",
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
    content: "Zero coding experience. Now I have a live SaaS with real users. The prompts alone saved me 100+ hours.",
    rating: 5,
    app_name: "LeadGen AI",
    app_screenshot_url: null,
    is_featured: true,
  },
  {
    id: "4",
    name: "David R.",
    content: "Shipped my MVP by Day 5. This system just works.",
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
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(fallbackTestimonials);

  useEffect(() => {
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

  // Split testimonials into two rows
  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);
  const safeRowA = rowA.length > 0 ? rowA : testimonials;
  const safeRowB = rowB.length > 0 ? rowB : testimonials;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <GhostWord word="SHIPPED" align="top" />

      <div className="relative max-w-6xl mx-auto px-4 z-10">
        {/* Eyebrow */}
        <div className="eyebrow mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-primary/60" />
          <span>Social Proof</span>
          <span className="h-px w-8 bg-primary/60" />
        </div>

        {/* Headline */}
        <div className="text-center mb-14">
          <h2
            className="font-bold leading-[1.05] tracking-tight mb-4"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              color: "#F4F2EE",
            }}
          >
            They had an idea.{" "}
            <span
              className="font-serifit bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              Now they have an app.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            500+ entrepreneurs from 9 countries have built working apps using this exact system.
          </p>
        </div>

        {/* Stats band */}
        <StatsBand />
      </div>

      {/* Testimonial wall — full-bleed marquee */}
      <div className="relative mt-16 space-y-6">
        <TestimonialRow items={safeRowA} direction="left" duration={60} />
        <TestimonialRow items={safeRowB} direction="right" duration={75} />
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60 max-w-2xl mx-auto px-4">
          Individual results vary. An app by Day 5 requires showing up and doing the daily missions.
        </p>
      </div>

      <style>{`
        @keyframes testi-marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes testi-marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .testi-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
};

/* -------------------- Stats band -------------------- */
const StatsBand = () => {
  return (
    <div
      className="grid grid-cols-3 rounded-2xl overflow-hidden mb-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <StatCell>
        <StatNumber>
          <CountUp to={500} duration={1.8} />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)" }}
          >
            +
          </span>
        </StatNumber>
        <StatLabel>Apps Built</StatLabel>
      </StatCell>

      <StatCell divider>
        <StatNumber>
          <CountUp to={9} duration={1.4} />
        </StatNumber>
        <StatLabel>Countries</StatLabel>
      </StatCell>

      <StatCell divider>
        <StatNumber>
          <span className="inline-flex items-center gap-2 md:gap-3">
            <CountUp to={4.9} decimals={1} duration={1.6} />
            <Star
              className="w-6 h-6 md:w-8 md:h-8"
              style={{ color: "#FFA04D", fill: "#FFA04D" }}
            />
          </span>
        </StatNumber>
        <StatLabel>Rating</StatLabel>
      </StatCell>
    </div>
  );
};

const StatCell = ({
  children,
  divider = false,
}: {
  children: React.ReactNode;
  divider?: boolean;
}) => (
  <div
    className="flex flex-col items-center justify-center text-center py-8 md:py-10 px-4"
    style={divider ? { borderLeft: "1px solid rgba(255,255,255,0.08)" } : undefined}
  >
    {children}
  </div>
);

const StatNumber = ({ children }: { children: React.ReactNode }) => (
  <div
    className="font-bold leading-none tracking-tight bg-clip-text text-transparent"
    style={{
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
      backgroundImage: "linear-gradient(180deg, #F4F2EE 0%, #FFA04D 120%)",
    }}
  >
    {children}
  </div>
);

const StatLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    className="mt-3"
    style={{
      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      fontSize: 11,
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: "rgba(244,242,238,0.55)",
    }}
  >
    {children}
  </div>
);

/* -------------------- Testimonial marquee -------------------- */
const TestimonialRow = ({
  items,
  direction,
  duration,
}: {
  items: TestimonialData[];
  direction: "left" | "right";
  duration: number;
}) => {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%)",
      }}
    >
      <div
        className="testi-track flex gap-5 w-max py-2"
        style={{
          animation: `${
            direction === "left" ? "testi-marquee-left" : "testi-marquee-right"
          } ${duration}s linear infinite`,
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
};

const TestimonialCard = ({ t }: { t: TestimonialData }) => {
  const initial = (t.name || "?").trim().charAt(0).toUpperCase();
  return (
    <article
      className="shrink-0 rounded-2xl p-6 flex flex-col"
      style={{
        width: 360,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            style={{ color: "#FFA04D", fill: "#FFA04D" }}
          />
        ))}
      </div>

      {/* Quote */}
      <p
        className="text-base leading-relaxed mb-5"
        style={{ color: "#F4F2EE" }}
      >
        "{t.content}"
      </p>

      {/* Divider */}
      <div
        className="my-1"
        style={{ height: 1, background: "rgba(255,255,255,0.08)" }}
      />

      {/* Attribution */}
      <div className="flex items-center gap-3 mt-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
          style={{
            background: "linear-gradient(135deg, #FFA04D 0%, #FF6A00 100%)",
            color: "#1A0D00",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div
            className="font-semibold text-sm"
            style={{ color: "#F4F2EE" }}
          >
            {t.name}
          </div>
          {t.app_name && (
            <div
              className="text-xs"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                color: "rgba(244,242,238,0.55)",
              }}
            >
              Built:{" "}
              <span
                className="bg-clip-text text-transparent font-semibold"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
                }}
              >
                {t.app_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
