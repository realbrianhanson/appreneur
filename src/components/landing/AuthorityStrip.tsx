import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { getRenderableText } from "@/content/verifiedProof";

/**
 * Tight authority strip that sits directly below the hero.
 * Uses ONLY the owner-confirmed AI For Business positioning. Any pending
 * numeric claim (learner count, country count, ratings, etc.) is gated by
 * `verifiedProof` and does not render until confirmed.
 */
export const AuthorityStrip = () => {
  const line =
    getRenderableText("instructor.brian.ai_for_business") ??
    "Created by Brian Hanson.";
  return (
    <Section
      id="authority-strip"
      variant="default"
      spacing="sm"
      className="relative border-y border-white/[0.06]"
    >
      <Container size="wide" className="relative z-10">
        <a
          href="#instructor"
          className="flex items-center justify-center gap-3 text-center py-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
        >
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: "#FFA04D" }}
          />
          <span>{line}</span>
        </a>
      </Container>
    </Section>
  );
};

export default AuthorityStrip;