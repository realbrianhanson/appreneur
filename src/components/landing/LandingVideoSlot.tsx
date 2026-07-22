import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { LANDING_VSL, isVideoConfigured } from "@/content/lessonVideos";

/**
 * Conditional landing video slot. Renders ONLY when a real, configured
 * video URL exists — never shows an empty player or "video coming soon"
 * placeholder. The release readiness gate requires the final URL before
 * the owner ships.
 */
export const LandingVideoSlot = () => {
  if (!isVideoConfigured(LANDING_VSL.videoUrl)) return null;

  return (
    <Section
      id="landing-video"
      variant="default"
      spacing="lg"
      className="relative"
    >
      <Container size="wide" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2
            className="font-bold leading-tight tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            }}
          >
            {LANDING_VSL.title}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            A short walkthrough that answers three things: Is this really
            possible? Can someone who isn't technical actually do it? And
            what will I have at the end?
          </p>
          <div
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-black"
            style={{ aspectRatio: "16 / 9" }}
          >
            <video
              className="absolute inset-0 h-full w-full"
              controls
              preload="metadata"
              poster={LANDING_VSL.posterUrl || undefined}
              src={LANDING_VSL.videoUrl}
            >
              Sorry, your browser doesn't support embedded video.
            </video>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default LandingVideoSlot;