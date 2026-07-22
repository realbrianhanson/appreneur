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

const faqs: Array<{ id: string; question: string; answer: string }> = [
  {
    id: "not_technical",
    question: "I'm not technical — is this really for me?",
    answer:
      "Yes. The challenge is built for entrepreneurs, not engineers. If you can write an email, you can follow the daily missions. Modern AI builders handle the code while you make the decisions.",
  },
  {
    id: "dont_know_what_to_build",
    question: "I don't know what to build yet. Can I still start?",
    answer:
      "Absolutely. Day 1 is designed for exactly this. You'll narrow down to one audience, one problem, and one outcome by the end of the first mission — even if you're starting from a blank page.",
  },
  {
    id: "what_tools_do_i_need",
    question: "What tools do I need, and do they cost anything?",
    answer:
      "You can begin on the free plan of the AI builder used in the lessons. Nothing paid is required to complete the challenge itself. If you later choose to publish or scale, some tools have paid tiers — but that is your decision, not a requirement.",
  },
  {
    id: "miss_a_day",
    question: "What if I miss a day?",
    answer:
      "Nothing breaks. The challenge is self-paced — pick up wherever you left off. Your progress and next mission are waiting for you when you come back.",
  },
  {
    id: "how_long",
    question: "How long do I have access?",
    answer:
      "Your free account keeps access to the five missions so you can work at your own pace. No deadline, no cohort clock.",
  },
  {
    id: "what_at_the_end",
    question: "What will I actually have at the end?",
    answer:
      "By Day 5 the intended outcome is a working, shareable first version of your app, a clear use case, your core user flow, one useful AI feature, and a next-iteration checklist. Your result depends on completing the missions and using the tools provided.",
  },
  {
    id: "really_free",
    question: "Is it really free? What's the catch?",
    answer:
      "Yes. No credit card, no hidden fee for the challenge itself. You'll create a free Appreneur account to save progress, and that's it.",
  },
  {
    id: "after_signup",
    question: "What happens right after I sign up?",
    answer:
      "You land in your dashboard, Day 1 unlocks immediately, and you can start your first mission the moment your account is created.",
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
                  key={faq.id}
                  data-objection-id={faq.id}
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
