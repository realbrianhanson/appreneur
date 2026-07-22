import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { usePauseWhenHidden } from "@/hooks/usePauseWhenHidden";
import { supabase } from "@/integrations/supabase/client";
import { TestimonialData } from "@/components/testimonials";
import { GhostWord } from "@/components/motion/GhostWord";

/**
 * Social proof — approved database testimonials only.
 * Renders nothing when there are zero approved testimonials.
 */
export const SocialProofSection = () => {
  const [testimonials, setTestimonials] = useState<TestimonialData[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.functions.invoke("get-testimonials", {
        body: { limit: 9, featured_first: true },
      });
      if (!error && data?.testimonials?.length) {
        setTestimonials(data.testimonials as TestimonialData[]);
      } else {
        setTestimonials([]);
      }
    })();
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  const rowA = testimonials.filter((_, i) => i % 2 === 0);
  const rowB = testimonials.filter((_, i) => i % 2 === 1);
  const safeRowA = rowA.length > 0 ? rowA : testimonials;
  const safeRowB = rowB;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <GhostWord word="STORIES" align="top" />
      <div className="relative max-w-6xl mx-auto px-4 z-10">
        <div className="eyebrow mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
          <span>From early builders</span>
          <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
        </div>
        <div className="text-center mb-14">
          <h2
            className="font-bold leading-[1.05] tracking-tight"
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
        </div>
      </div>

      <div className="relative mt-4 space-y-6">
        <TestimonialRow items={safeRowA} direction="left" duration={60} />
        {safeRowB.length > 0 && (
          <TestimonialRow items={safeRowB} direction="right" duration={75} />
        )}
        <p className="mt-4 text-center text-[11px] text-muted-foreground/60 max-w-2xl mx-auto px-4">
          Individual results vary. Shipping an app takes showing up and doing the missions.
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
        @media (prefers-reduced-motion: reduce) {
          .testi-track { animation: none !important; }
        }
      `}</style>
    </section>
  );
};

const TestimonialRow = ({
  items,
  direction,
  duration,
}: {
  items: TestimonialData[];
  direction: "left" | "right";
  duration: number;
}) => {
  const reduced = useReducedMotion();
  const { ref, paused } = usePauseWhenHidden<HTMLDivElement>();
  const doubled = reduced ? items : [...items, ...items];
  return (
    <div
      ref={ref}
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
          animation: reduced
            ? "none"
            : `${
                direction === "left" ? "testi-marquee-left" : "testi-marquee-right"
              } ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
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
  const filled = Math.max(0, Math.min(5, t.rating ?? 5));
  return (
    <article
      className="shrink-0 rounded-2xl p-6 flex flex-col"
      style={{
        width: 360,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="flex items-center gap-1 mb-4"
        role="img"
        aria-label={`${filled} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            aria-hidden="true"
            style={
              i < filled
                ? { color: "#FFA04D", fill: "#FFA04D" }
                : { color: "rgba(244,242,238,0.25)", fill: "transparent" }
            }
          />
        ))}
      </div>
      <p
        className="text-base leading-relaxed mb-5"
        style={{ color: "#F4F2EE" }}
      >
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="my-1" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
      <div className="flex items-center gap-3 mt-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
          style={{
            background: "linear-gradient(135deg, #FFA04D 0%, #FF6A00 100%)",
            color: "#1A0D00",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm" style={{ color: "#F4F2EE" }}>
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