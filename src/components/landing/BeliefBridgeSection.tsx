import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

/**
 * Belief-bridge section. Establishes possibility for a scared,
 * nontechnical, older-beginner audience BEFORE asking for commitment.
 * Uses respectful "This challenge was made for you if..." framing.
 * No shaming, age stereotypes, or fearmongering.
 */
const BELIEF_ITEMS: readonly string[] = [
  "AI feels overwhelming and you don't know where to begin.",
  "You rely on someone else for every website or technology change.",
  "You have useful ideas but can't picture yourself building them.",
  "You want to use AI in your business instead of watching others move ahead.",
];

export const BeliefBridgeSection = () => {
  return (
    <Section
      id="belief-bridge"
      variant="default"
      spacing="lg"
      className="relative overflow-hidden"
    >
      <Container size="wide" className="relative z-10">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="eyebrow flex items-center gap-4 justify-center">
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
            <span>Made for you</span>
            <span className="h-px w-8 bg-primary/60" aria-hidden="true" />
          </div>
          <h2
            className="font-bold leading-[1.1] tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            }}
          >
            This challenge was made for you if…
          </h2>
          <ul
            className="text-left space-y-3 max-w-2xl mx-auto"
            data-testid="belief-bridge-list"
          >
            {BELIEF_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "1.0625rem",
                  lineHeight: 1.55,
                  color: "#F4F2EE",
                }}
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 inline-block h-2 w-2 rounded-full shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFA04D, #FF6A00)",
                  }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-base md:text-lg">
            You're in exactly the right place. We'll take it one small step
            at a time.
          </p>
        </div>
      </Container>
    </Section>
  );
};

export default BeliefBridgeSection;