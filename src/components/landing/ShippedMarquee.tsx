import { Smartphone } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { usePauseWhenHidden } from "@/hooks/usePauseWhenHidden";

const APPS = [
  "Revven.com",
  "SpyBench.com",
  "BigDeck.io",
  "Validifier.com",
  "PushTen.com",
  "EarlyStart.ai",
  "BloodDecoder.com",
  "RankLab.ai",
  "BrianHanson.com",
  "904News.com",
  "GarlicBread.ai",
];

function MarqueeItem({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-3 shrink-0 px-8">
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Smartphone className="w-3.5 h-3.5" style={{ color: "#FFA04D" }} />
      </span>
      <span
        className="text-base md:text-lg font-medium whitespace-nowrap"
        style={{ color: "#F4F2EE", fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {name}
      </span>
      <span
        className="inline-flex items-center gap-1.5 shrink-0"
        style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#7CFCA0",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#28C840", boxShadow: "0 0 8px #28C840" }}
        />
        Shipped
      </span>
    </li>
  );
}

export const ShippedMarquee = () => {
  const reduced = useReducedMotion();
  const { ref, paused } = usePauseWhenHidden<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden py-5 md:py-6"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.015)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
      }}
      aria-label="Apps built by challenge graduates"
    >
      <ul
        className="flex items-center w-max"
        style={{
          animation: reduced ? "none" : "shipped-marquee 38s linear infinite",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {APPS.map((n, i) => (
          <MarqueeItem key={`a-${i}`} name={n} />
        ))}
        {!reduced && APPS.map((n, i) => (
          <MarqueeItem key={`b-${i}`} name={n} />
        ))}
      </ul>

      <style>{`
        @keyframes shipped-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ShippedMarquee;