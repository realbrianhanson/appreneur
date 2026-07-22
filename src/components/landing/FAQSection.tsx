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
      "Yes. The challenge is built for business owners and beginners, not engineers. If you can write an email, you can follow the daily missions. AI handles the technical parts while you make the decisions in everyday English.",
  },
  {
    id: "too_old_or_nontechnical",
    question: "Am I too old or too nontechnical to do this?",
    answer:
      "No. This challenge was built with older business owners and total beginners in mind. Lessons move at a patient pace, define every term in plain English, and show exactly what to click. If you use email, you can do this.",
  },
  {
    id: "never_built",
    question: "What if I've never built anything before?",
    answer:
      "That's exactly who this is for. You don't need any prior experience with building websites or apps. Day 1 assumes you're starting from zero and walks you through every step.",
  },
  {
    id: "write_code",
    question: "Do I have to write code?",
    answer:
      "No. You build by describing what you want in everyday English. AI does the technical work behind the scenes. You never write code and you never open a code editor.",
  },
  {
    id: "for_existing_business",
    question: "Can I build something for my existing business?",
    answer:
      "Yes. Many people use the challenge to build a custom website, a simple internal tool, or a helpful automation for the business they already run. You choose the direction on Day 1.",
  },
  {
    id: "to_sell",
    question: "Can I build something I can sell or offer to clients?",
    answer:
      "Yes. You can pick a website or simple app you'd like to offer to customers as a product or service. The challenge focuses on getting a real, working first version live so you can decide what to do next.",
  },
  {
    id: "dont_know_what_to_build",
    question: "I don't know what to build yet. Can I still start?",
    answer:
      "Absolutely. Day 1 is designed for exactly this. By the end of the first day you'll have picked one clear idea — who it's for, what it does, and why it's useful — even if you're starting from a blank page.",
  },
  {
    id: "what_tools_do_i_need",
    question: "What tools do I need, and do they cost anything?",
    answer:
      "You can start on the free plan of the AI builder used in the lessons. Nothing paid is required to complete the challenge itself. Later, if you choose to publish or scale, some tools offer paid tiers — but that's your decision, not a requirement.",
  },
  {
    id: "miss_a_day",
    question: "What if I miss a day or get behind?",
    answer:
      "Nothing breaks. The challenge is self-paced — pick up wherever you left off. Your progress and next mission are waiting for you when you come back.",
  },
  {
    id: "how_long",
    question: "How long do I have access?",
    answer:
      "Your free account keeps access to the five missions so you can work at your own pace. Start anytime. No deadline.",
  },
  {
    id: "what_at_the_end",
    question: "What will I actually have at the end?",
    answer:
      "By Day 5, the intended outcome is a working website or simple app, a clear purpose, pages and buttons that work, one useful AI-powered feature, a link you can share, and a short list of what to improve next. Your result depends on completing the missions and using the tools provided.",
  },
  {
    id: "really_free",
    question: "Is it really free? What's the catch?",
    answer:
      "Yes. No credit card, no hidden fee for the challenge itself. You'll create a free Appreneur account so your progress is saved, and that's it.",
  },
  {
    id: "after_signup",
    question: "What happens right after I sign up?",
    answer:
      "You land in your dashboard, Day 1 unlocks immediately, and you can start your first mission the moment your account is created.",
  },
  {
    id: "get_stuck",
    question: "What if I get stuck along the way?",
    answer:
      "Every lesson defines its terms, shows exactly what to click, and points out the mistakes beginners usually make so you can avoid them. If a step doesn't work the first time, the lesson walks you through fixing it before moving on.",
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
