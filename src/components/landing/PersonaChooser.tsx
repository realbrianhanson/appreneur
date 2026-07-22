import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  PERSONA_CHOICES,
  PERSONA_STORAGE_KEY,
  type PersonaChoice,
} from "@/content/landingCopy";
import { scrollTo } from "@/lib/scroll";

/**
 * "Which describes you?" — a first-party choice that prefills the first
 * quiz answer and scrolls the visitor into the quiz. There is no competing
 * signup form here; the primary path remains the quiz + registration flow.
 *
 * The selection is stored in sessionStorage under PERSONA_STORAGE_KEY. The
 * QuizContainer picks it up on mount, sets answer[0] accordingly, and
 * advances to question 2 so the visitor doesn't answer the same thing twice.
 */
export const PersonaChooser = () => {
  const handlePick = (choice: PersonaChoice) => {
    try {
      sessionStorage.setItem(PERSONA_STORAGE_KEY, choice.quizAnswerValue);
    } catch {
      // sessionStorage disabled — the quiz still works, they'll just see
      // question 1 again.
    }
    scrollTo("#quiz-section", { offset: -40 });
  };

  return (
    <Section
      id="persona-chooser"
      variant="default"
      spacing="default"
      className="relative"
    >
      <Container size="wide" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2
            className="font-bold leading-tight tracking-tight text-foreground"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(1.5rem, 3.4vw, 2rem)",
            }}
          >
            Which of these fits you best?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Pick the path that sounds like you. We'll tailor your first day
            around it.
          </p>
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="group"
            aria-label="Which describes you?"
          >
            {PERSONA_CHOICES.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handlePick(choice)}
                data-testid={`persona-${choice.id}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-primary/[0.05] transition-all px-6 py-5 text-left min-h-11 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span className="block text-base md:text-lg font-semibold text-foreground">
                  {choice.label}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground group-hover:text-foreground/80">
                  Tap to tailor your first day
                </span>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default PersonaChooser;