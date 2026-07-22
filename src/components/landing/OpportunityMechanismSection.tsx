import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { MECHANISM_LINE } from "@/lib/constants";

/**
 * Opportunity + mechanism block. Placed after the hero authority strip and
 * the problem block, and before the founder/curriculum sections.
 *
 * Copy is deliberately concrete and energetic — no unverified numbers,
 * no fake urgency.
 */
export const OpportunityMechanismSection = () => {
  const beginnerStalls = [
    "Too many ideas, no clear pick",
    "Scope grows before anything ships",
    "Blank-screen paralysis when it's time to build",
    "Gimmicky AI features that don't move the needle",
    "Fear of publishing anything less than perfect",
  ];

  return (
    <Section
      id="opportunity"
      variant="default"
      spacing="xl"
      className="relative overflow-hidden"
    >
      <GhostWord word="SEQUENCE" align="top" className="opacity-70" />
      <Container size="wide" className="relative z-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="eyebrow flex items-center gap-4">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span>The opportunity</span>
          </div>
          <h2
            className="font-bold leading-[1.05] tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
            }}
          >
            Your app isn't waiting on code.{" "}
            <span
              className="font-serifit italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              It's waiting on the right sequence.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            AI and no-code builders removed the developer bottleneck. What's
            left is a sequencing problem — the wrong order, the wrong scope,
            and the wrong first move. That's why beginners stall on the
            same five things:
          </p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-muted-foreground text-[15px] md:text-base list-disc pl-5 max-w-2xl">
            {beginnerStalls.map((stall) => (
              <li key={stall}>{stall}</li>
            ))}
          </ul>
          <div
            className="relative rounded-2xl p-6 md:p-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,160,77,0.10) 0%, rgba(255,106,0,0.05) 100%)",
              border: "1px solid rgba(255,160,77,0.30)",
            }}
          >
            <p
              className="text-xl md:text-2xl font-semibold leading-snug"
              style={{
                color: "#F4F2EE",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
              data-testid="mechanism-line"
            >
              {MECHANISM_LINE}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default OpportunityMechanismSection;