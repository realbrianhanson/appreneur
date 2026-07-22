import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Magnetic } from "@/components/motion/Magnetic";
import { ArrowRight } from "lucide-react";
import { MOMENTUM_LINE, PRIMARY_CTA_LABEL, CTA_MICROCOPY } from "@/lib/constants";

/**
 * Momentum line + mid-page CTA. Deliberately short and honest — no
 * timer, no seat count, no fake deadline for a self-paced challenge.
 */
export const MomentumLine = ({ onCtaClick }: { onCtaClick: () => void }) => {
  return (
    <Section variant="default" spacing="default" className="relative">
      <Container size="wide" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <p
            className="text-lg md:text-xl text-foreground/90 leading-relaxed"
            data-testid="momentum-line"
          >
            {MOMENTUM_LINE}
          </p>
          <Magnetic strength={0.2}>
            <button
              onClick={onCtaClick}
              className="btn-primary-pill text-base md:text-lg min-h-11"
              style={{ padding: "14px 26px" }}
            >
              {PRIMARY_CTA_LABEL}
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </Magnetic>
          <p className="text-xs text-muted-foreground">{CTA_MICROCOPY}</p>
        </div>
      </Container>
    </Section>
  );
};

export default MomentumLine;