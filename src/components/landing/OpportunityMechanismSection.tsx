import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GhostWord } from "@/components/motion/GhostWord";
import { MECHANISM_LINE, BELIEF_ANALOGY } from "@/lib/constants";

/**
 * Opportunity + mechanism block. Placed after the hero authority strip and
 * the problem block, and before the founder/curriculum sections.
 *
 * Copy is deliberately concrete and energetic — no unverified numbers,
 * no fake urgency.
 */
export const OpportunityMechanismSection = () => {
  const beginnerStalls = [
    "Technology has always felt intimidating",
    "Hiring a developer costs too much",
    "Too many ideas, none of them started",
    "Not sure where to begin",
    "Afraid to share anything less than perfect",
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
            You do not need to become a tech person.{" "}
            <span
              className="font-serifit italic bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #FFA04D 0%, #FF6A00 100%)",
              }}
            >
              You need to learn how to tell AI what you want.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            AI can now take everyday English and turn it into a working
            website or app. That means an ordinary business owner — no
            coding, no developer, no tech background — can describe the
            pages and features they want and watch a real version take shape.
            The only thing left to learn is how to tell AI what you want.
          </p>
          <p className="text-foreground text-lg leading-relaxed max-w-3xl">
            You're not behind. You've just been waiting on the tools to
            catch up. Here's what usually gets in the way — and what this
            challenge replaces it with:
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
            <p
              className="mt-3 text-base md:text-lg text-muted-foreground"
              data-testid="belief-analogy"
            >
              {BELIEF_ANALOGY}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default OpportunityMechanismSection;