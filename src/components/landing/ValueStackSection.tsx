import { motion } from "framer-motion";
import { Check, ArrowRight, Shield, Lock, Zap } from "lucide-react";

interface StackItem {
  title: string;
  caption: string;
  value: number;
}

const stackItems: StackItem[] = [
  {
    title: "50 Profitable App Ideas (PDF)",
    caption: "Validated ideas already making money. Pick one or use your own.",
    value: 97,
  },
  {
    title: "5-Day Appreneur Challenge Access",
    caption: "Daily video training + assignments that take you from zero to live app.",
    value: 497,
  },
  {
    title: "Private Community Access",
    caption: "Build alongside 500+ entrepreneurs who've been exactly where you are.",
    value: 197,
  },
  {
    title: "Daily Instructor Support from Brian",
    caption: "Get unstuck fast. I'm in there with you every single day.",
    value: 297,
  },
  {
    title: "Free Seat: 3-Day AI For Business Live Event",
    caption: "My flagship event where I go deep on AI for entrepreneurs.",
    value: 997,
  },
];

const TOTAL_VALUE = stackItems.reduce((sum, item) => sum + item.value, 0);

// Barcode: deterministic pseudo-random bar heights & widths
const BARCODE = Array.from({ length: 48 }, (_, i) => {
  const seed = (Math.sin(i * 12.9898) + 1) / 2;
  const h = 22 + Math.round(seed * 30); // 22-52px
  const w = i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
  return { h, w };
});

const ValueStackSection = () => {
  const scrollToQuiz = () => {
    const quizElement = document.querySelector("#quiz-section");
    if (quizElement) {
      quizElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Receipt card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2.5 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        style={{
          filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5)) drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
        }}
      >
        <div
          className="relative bg-[#f5f1e8] text-[#1a1a1a] px-7 md:px-10 pt-8 pb-16"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 3px)",
            clipPath:
              // zigzag torn bottom edge
              "polygon(0 0, 100% 0, 100% calc(100% - 16px), 97% 100%, 94% calc(100% - 16px), 91% 100%, 88% calc(100% - 16px), 85% 100%, 82% calc(100% - 16px), 79% 100%, 76% calc(100% - 16px), 73% 100%, 70% calc(100% - 16px), 67% 100%, 64% calc(100% - 16px), 61% 100%, 58% calc(100% - 16px), 55% 100%, 52% calc(100% - 16px), 49% 100%, 46% calc(100% - 16px), 43% 100%, 40% calc(100% - 16px), 37% 100%, 34% calc(100% - 16px), 31% 100%, 28% calc(100% - 16px), 25% 100%, 22% calc(100% - 16px), 19% 100%, 16% calc(100% - 16px), 13% 100%, 10% calc(100% - 16px), 7% 100%, 4% calc(100% - 16px), 1% 100%, 0 calc(100% - 16px))",
          }}
        >
          {/* Header */}
          <div className="text-center text-[11px] md:text-xs tracking-[0.15em] font-bold">
            APPRENEUR CHALLENGE · ORDER SUMMARY
          </div>
          <div className="text-center text-[11px] md:text-xs tracking-[0.2em] mt-2 opacity-80">
            *** INSTANT ACCESS ***
          </div>

          <Dashed />

          {/* Line items */}
          <div className="space-y-4">
            {stackItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-[13px] leading-snug">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700 stroke-[3]" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold uppercase tracking-wide text-[12.5px]">
                    {item.title}
                  </div>
                  <div className="opacity-70 text-[12px] leading-snug mt-0.5">
                    {item.caption}
                  </div>
                </div>
                <div className="shrink-0 font-bold tabular-nums relative pt-0.5">
                  <span className="relative">
                    ${item.value}
                    <span className="absolute left-[-2px] right-[-2px] top-1/2 h-[1.5px] bg-[#c0392b] rotate-[-6deg]" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Dashed />

          {/* Total value line */}
          <div className="flex items-center justify-between text-[13px] font-bold uppercase tracking-wider">
            <span>Total value</span>
            <span className="relative tabular-nums">
              ${TOTAL_VALUE.toLocaleString()}
              <span className="absolute left-[-4px] right-[-4px] top-1/2 h-[2px] bg-[#c0392b] rotate-[-4deg]" />
            </span>
          </div>

          <Dashed />

          {/* Your price today + FREE */}
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.18em] leading-tight max-w-[40%]">
              Your price
              <br />
              today
            </span>
            <span
              className="font-display font-black leading-none tracking-tight bg-clip-text text-transparent"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(60px, 12vw, 74px)",
                backgroundImage:
                  "linear-gradient(110deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 25%, #fff2c9 45%, hsl(var(--primary)) 60%, hsl(var(--accent)) 100%)",
                backgroundSize: "200% 100%",
                animation: "receipt-shimmer 3s linear infinite",
              }}
            >
              FREE
            </span>
          </div>

          <p className="text-center text-[12px] italic opacity-70 mt-1 mb-5">
            Seriously. $0. I just want to prove this works.
          </p>

          {/* CTA inside receipt */}
          <button
            onClick={scrollToQuiz}
            className="group w-full rounded-full py-4 px-6 font-bold text-white text-[15px] tracking-wide uppercase flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              backgroundImage:
                "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              boxShadow: "0 10px 30px -8px hsl(var(--primary) / 0.6)",
            }}
          >
            Claim Your Free Spot
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <Dashed />

          {/* Barcode */}
          <div className="flex items-end justify-center gap-[2px] h-[54px] mt-2">
            {BARCODE.map((b, i) => (
              <div
                key={i}
                style={{
                  width: `${b.w}px`,
                  height: `${b.h}px`,
                  background: "#1a1a1a",
                }}
              />
            ))}
          </div>
          <div className="text-center text-[10px] tracking-[0.3em] mt-1 opacity-70">
            0 0 0 0 0 · APPRENEUR · 2 0 8 5
          </div>
        </div>

        {/* Shimmer keyframes */}
        <style>{`
          @keyframes receipt-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </motion.div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-muted-foreground">
        {[
          { label: "100% Free", Icon: Shield },
          { label: "No Hidden Fees", Icon: Lock },
          { label: "Instant Access", Icon: Zap },
        ].map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground/80">{label}</span>
          </div>
        ))}
      </div>

      {/* Brian's promise */}
      <div
        className="mt-8 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,160,77,0.10) 0%, rgba(255,106,0,0.06) 100%)",
          border: "1px solid rgba(255,160,77,0.35)",
        }}
      >
        <div
          className="text-[11px] tracking-[0.22em] uppercase mb-3"
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            color: "#FFA04D",
          }}
        >
          My Promise To You
        </div>
        <p className="text-base md:text-lg leading-relaxed text-foreground/90">
          Show up 60 minutes a day for 5 days. If you don't have a live, working app by Day 5, I'll get in there with you and work on it until it ships.
        </p>
        <p
          className="mt-4 text-lg italic"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: "#FFA04D" }}
        >
          Brian
        </p>
      </div>
    </div>
  );
};

const Dashed = () => (
  <div
    aria-hidden
    className="my-5"
    style={{
      borderTop: "1.5px dashed rgba(0,0,0,0.35)",
    }}
  />
  );

export default ValueStackSection;
