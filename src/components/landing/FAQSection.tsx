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
    question: "Do I need to know how to code?",
    answer:
      "Absolutely not. We use AI-powered tools that let you describe what you want in plain English. If you can explain your idea, you can build it.",
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
    question: "Is this really free?",
    answer:
      "Yes. The challenge itself is 100% free. We offer optional upgrades for those who want additional resources, but everything you need to build your app is included free.",
  },
  {
    question: "What happens after the 7 days?",
    answer:
      "You'll have a live, working app. We'll also invite you to our 3-Day AI For Business event where you'll learn how to turn your app into a real business.",
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
