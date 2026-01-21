import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
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
      "Perfect. This system is built for entrepreneurs, not engineers. If you can write an email, you can build an app with this method.",
  },
  {
    question: "What if I don't have an app idea?",
    answer:
      "That's what the 750 Profitable App Ideas PDF is for. You'll have more ideas than you know what to do with.",
  },
  {
    question: "Is this just theory or do I actually build something?",
    answer:
      "You will have a live, working app by Day 5. Not a mockup. Not a wireframe. A real app.",
  },
  {
    question: "Why is this free?",
    answer:
      "Because I want you to experience what's possible. When you see how fast you can build, you'll want to go deeper with my other trainings. This is my best foot forward.",
  },
  {
    question: "What kind of apps can I build?",
    answer:
      "Anything from SaaS tools to mobile apps to internal business tools. Past graduates have built CRMs, booking systems, AI chatbots, content generators, and more.",
  },
  {
    question: "How much time do I need each day?",
    answer:
      "Plan for 60-90 minutes per day. Each mission is designed to be completed in one focused session.",
  },
  {
    question: "What if I fall behind?",
    answer:
      "You'll have access to all recordings and can catch up at your own pace. Plus, the community is there to help.",
  },
  {
    question: "What happens after the 5 days?",
    answer:
      "You'll have a live, working app. We'll also invite you to our 2-Day AI For Business event where you'll learn how to turn your app into a real business.",
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
      {/* Background accents */}
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
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Got Questions?
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
                  className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm data-[state=open]:border-primary/30 data-[state=open]:bg-card/50 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:text-primary transition-colors py-5 [&[data-state=open]]:text-primary">
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
