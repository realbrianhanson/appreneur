import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { GhostWord } from "@/components/motion/GhostWord";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What if I'm not technical at all?",
    answer:
      "The challenge is built for entrepreneurs, not engineers. If you can write an email, you can follow the daily missions — modern AI tools handle the code while you make the decisions.",
  },
  {
    question: "Are the sessions live?",
    answer:
      "No. The lessons are self-paced and are being recorded now. When you sign up for early access, you'll see the day-by-day plan in your dashboard and get an email the moment the full lessons open.",
  },
  {
    question: "What if I fall behind?",
    answer:
      "There is no cohort deadline. Each mission unlocks after the prior one is completed, and you can move through the five days on your own schedule.",
  },
  {
    question: "Do I need an app idea already?",
    answer:
      "It helps to have a rough idea, but it isn't required. Day 1 focuses on picking and validating a small first idea so the rest of the week has direction.",
  },
  {
    question: "How much time do I need each day?",
    answer:
      "Plan for roughly 60 minutes per focused day. The missions are designed to fit into a single sitting.",
  },
  {
    question: "Why is this free?",
    answer:
      "This is the founding early-access edition. It's free while the experience is being refined so early builders can shape it before wider launch.",
  },
  {
    question: "Do I need to buy any software?",
    answer:
      "You can begin on the free plan of the AI builder you'll use. Nothing is required to complete the challenge itself.",
  },
];

const FAQSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Section variant="default" spacing="xl" className="relative overflow-hidden">
      <GhostWord word="ANSWERS" align="top" className="opacity-70" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-radial from-secondary/5 to-transparent blur-3xl" />

      <Container size="wide" className="relative z-10">
        <div ref={sectionRef} className="max-w-3xl mx-auto">
          {/* Header */}
          <div
            className={`text-center mb-12 space-y-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Badge variant="outline" className="mx-auto">
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.05] tracking-tight">
              Got{" "}
              <span className="font-serifit italic bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                questions?
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about the challenge
            </p>
          </div>

          {/* Accordion */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/50 rounded-2xl px-6 bg-card/30 backdrop-blur-sm data-[state=open]:border-primary/50 data-[state=open]:bg-gradient-to-br data-[state=open]:from-primary/10 data-[state=open]:via-card/50 data-[state=open]:to-accent/5 data-[state=open]:shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.35)] transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary transition-colors py-5 [&[data-state=open]]:text-primary [&[data-state=open]>svg]:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Bottom CTA */}
          <div
            className={`mt-12 text-center transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-muted-foreground mb-4">
              Still have questions?{" "}
              <a
                href="mailto:support@appreneur.ai"
                className="text-primary hover:underline font-medium"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { FAQSection };
