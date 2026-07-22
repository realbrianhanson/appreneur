import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePauseWhenHidden } from "@/hooks/usePauseWhenHidden";
import {
  Check,
  Sparkles,
  Loader2,
  Zap,
  CircleDot,
} from "lucide-react";

const LOOP_MS = 12000;
const PROMPT_TEXT =
  "Build a simple customer quote calculator for my business.";

const CHECKLIST = [
  "Reading what you asked for",
  "Setting up the page",
  "Adding the buttons and fields",
  "Turning on the calculator",
  "Getting a link you can share",
];

// Timeline (ms from cycle start). The right panel builds a simple
// quote-calculator preview step by step: header → input rows → estimated
// total → live/share banner.
const TYPE_START = 200;
const TYPE_END = 3000;
const BUILD_APPEAR = 3200;
const CHECK_STAGGER = 700; // first item at BUILD_APPEAR + 400
const CHECK_FIRST = 3600;
const CHECK_TO_DONE = 500; // spinner -> check delay

const PREVIEW_HEADER = 3400;
const PREVIEW_ROWS = 4400;   // input rows (Service, Quantity)
const PREVIEW_TOTAL = 5800;  // estimated total
const PREVIEW_DEPLOYED = 7200;
const READY_ON = 7400;

const FADE_OUT = 11200;

export const AppBuilderMockup = () => {
  const prefersReducedMotion = useReducedMotion();
  const { ref: containerRef, paused } = usePauseWhenHidden<HTMLDivElement>();
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(prefersReducedMotion ? FADE_OUT - 1 : 0);
  const cycleStartRef = useRef<number>(0);

  // Drive the timeline with a low-frequency timer (~10fps is plenty for a
  // stepped typing/checklist animation) and pause fully when offscreen or
  // when the user prefers reduced motion.
  useEffect(() => {
    if (prefersReducedMotion) {
      // Show the final resting state; skip the loop entirely.
      setNow(FADE_OUT - 1);
      return;
    }
    if (paused) return;

    cycleStartRef.current = performance.now() - now;

    const id = window.setInterval(() => {
      const elapsed = performance.now() - cycleStartRef.current;
      if (elapsed >= LOOP_MS) {
        cycleStartRef.current = performance.now();
        setTick((t) => t + 1);
        setNow(0);
      } else {
        setNow(elapsed);
      }
    }, 100);
    return () => window.clearInterval(id);
    // Intentionally exclude `now` — we only want to (re)start the loop when
    // visibility or motion preference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, prefersReducedMotion]);

  // Typewriter progress
  const typeRatio = Math.max(
    0,
    Math.min(1, (now - TYPE_START) / (TYPE_END - TYPE_START))
  );
  const typedChars = Math.floor(PROMPT_TEXT.length * typeRatio);
  const typedText = PROMPT_TEXT.slice(0, typedChars);
  const isTyping = now < TYPE_END;

  const showBuilding = now >= BUILD_APPEAR;
  const showHeader = now >= PREVIEW_HEADER;
  const showRows = now >= PREVIEW_ROWS;
  const showTotal = now >= PREVIEW_TOTAL;
  const showDeployed = now >= PREVIEW_DEPLOYED;
  const showReady = now >= READY_ON;
  const fadingOut = now >= FADE_OUT;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[560px] mx-auto"
      style={{ perspective: 1400 }}
    >
      {/* Floating chips */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-10 left-2 md:-top-12 md:-left-4 z-20"
      >
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            color: "#F4F2EE",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: "#FFA04D" }} />
          Type it · watch it work
        </span>
      </motion.div>

      <motion.div
        aria-hidden
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 z-20"
      >
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "linear-gradient(135deg, rgba(255,160,77,0.18), rgba(255,106,0,0.18))",
            border: "1px solid rgba(255,133,36,0.4)",
            color: "#FFC89A",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.08em",
          }}
        >
          <Zap className="w-3 h-3" style={{ color: "#FFA04D" }} />
          5-day challenge
        </span>
      </motion.div>

      {/* Browser window */}
      <motion.div
        key={tick}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: fadingOut ? 0.4 : 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 30px 60px -20px rgba(0,0,0,0.7), 0 0 60px -10px rgba(255,133,36,0.15)",
        }}
      >
        {/* Chrome */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
          </div>
          <div
            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxWidth: 320,
              margin: "0 auto",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              color: "rgba(244,242,238,0.75)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#28C840", boxShadow: "0 0 8px #28C840" }} />
            appreneur.ai/build
          </div>
          <div className="w-[54px]" />
        </div>

        {/* Two-panel body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* LEFT — prompt + status */}
          <div
            className="p-4 md:p-5 space-y-4"
            style={{
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.015)",
              minHeight: 340,
            }}
          >
            <PanelLabel>Your Prompt</PanelLabel>

            <div
              className="rounded-lg p-3 text-sm leading-relaxed"
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: 12.5,
                color: "#F4F2EE",
                minHeight: 92,
              }}
            >
              {typedText}
              {isTyping && (
                <span
                  className="inline-block align-middle ml-0.5"
                  style={{
                    width: 7,
                    height: 14,
                    background: "#FFA04D",
                    animation: "cursor-blink 0.9s steps(2) infinite",
                  }}
                />
              )}
            </div>

            <AnimatePresence>
              {showBuilding && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-lg p-3"
                  style={{
                    background: "rgba(255,133,36,0.06)",
                    border: "1px solid rgba(255,133,36,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles
                      className="w-4 h-4 animate-spin"
                      style={{ color: "#FFA04D", animationDuration: "2.5s" }}
                    />
                     <span
                       className="text-xs font-medium"
                       style={{ color: "#FFC89A", letterSpacing: "0.02em" }}
                     >
                       AI is building your page…
                     </span>
                  </div>

                  <ul className="space-y-1.5">
                    {CHECKLIST.map((label, i) => {
                      const appearAt = CHECK_FIRST + i * CHECK_STAGGER;
                      const doneAt = appearAt + CHECK_TO_DONE;
                      const visible = now >= appearAt;
                      const done = now >= doneAt;
                      return (
                        <motion.li
                          key={label}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{
                            opacity: visible ? 1 : 0,
                            x: visible ? 0 : -6,
                          }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 text-xs"
                          style={{ color: done ? "#F4F2EE" : "rgba(244,242,238,0.6)" }}
                        >
                          <span className="inline-flex w-4 h-4 items-center justify-center shrink-0">
                            {done ? (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                                className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                                style={{ background: "#28C840" }}
                              >
                                <Check className="w-2.5 h-2.5" style={{ color: "#08080C" }} strokeWidth={3.5} />
                              </motion.span>
                            ) : (
                              <Loader2
                                className="w-3.5 h-3.5 animate-spin"
                                style={{ color: "#FFA04D" }}
                              />
                            )}
                          </span>
                          {label}
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — live preview */}
          <div
            className="p-4 md:p-5 space-y-3 relative"
            style={{ background: "rgba(0,0,0,0.15)", minHeight: 340 }}
          >
            <div className="flex items-center justify-between">
              <PanelLabel>Live Preview</PanelLabel>
              <AnimatePresence>
                {showReady && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest"
                    style={{
                      fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                      color: "#7CFCA0",
                    }}
                  >
                    <CircleDot className="w-3 h-3" />
                    Ready
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Mini app frame */}
            <div
              className="rounded-lg p-3 space-y-3"
              style={{
                background: "#0d0d13",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Header bar */}
              <AnimatePresence>
                {showHeader && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between pb-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFA04D, #FF6A00)",
                        }}
                      >
                        <Zap className="w-3 h-3" style={{ color: "#1A0D00" }} />
                      </span>
                       <span
                         className="text-[10px] font-semibold"
                         style={{ color: "#F4F2EE" }}
                       >
                         Quote Tool
                       </span>
                    </div>
                     <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #FFA04D, #FF6A00)",
                        color: "#1A0D00",
                      }}
                    >
                      Get Quote
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input rows — Service + Quantity */}
              <AnimatePresence>
                {showRows && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {},
                      visible: { transition: { staggerChildren: 0.12 } },
                    }}
                    className="space-y-1.5"
                  >
                    {[
                      { label: "Service", value: "Website setup" },
                      { label: "Quantity", value: "2" },
                    ].map((row) => (
                      <motion.div
                        key={row.label}
                        variants={{
                          hidden: { opacity: 0, y: 6 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className="flex items-center justify-between rounded-md px-2.5 py-2"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-widest"
                          style={{
                            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                            color: "rgba(244,242,238,0.55)",
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          className="text-[11px] font-semibold"
                          style={{ color: "#F4F2EE" }}
                        >
                          {row.value}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Estimated total */}
              <AnimatePresence>
                {showTotal && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between rounded-md px-2.5 py-2.5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,160,77,0.14), rgba(255,106,0,0.14))",
                      border: "1px solid rgba(255,133,36,0.35)",
                    }}
                  >
                    <span
                      className="text-[10px] uppercase tracking-widest"
                      style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        color: "#FFC89A",
                      }}
                    >
                      Estimated total
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#F4F2EE", letterSpacing: "-0.01em" }}
                    >
                      $1,500
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Deployed banner */}
              <AnimatePresence>
                {showDeployed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="flex items-center justify-between rounded-md px-2.5 py-2"
                    style={{
                      background: "rgba(40,200,64,0.12)",
                      border: "1px solid rgba(40,200,64,0.35)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                        style={{ background: "#28C840" }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: "#08080C" }} strokeWidth={3.5} />
                      </span>
                      <span
                        className="text-[10px] font-semibold"
                        style={{ color: "#B8F5C6" }}
                      >
                        Live · you can share this link
                      </span>
                    </div>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: "rgba(255,133,36,0.15)",
                        border: "1px solid rgba(255,133,36,0.4)",
                        color: "#FFC89A",
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Day 5
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cursor blink keyframes (scoped) */}
      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block"
      style={{
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "#FFA04D",
      }}
    >
      {children}
    </span>
  );
}

export default AppBuilderMockup;