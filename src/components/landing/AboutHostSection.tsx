import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { Award, Users, TrendingUp, Heart, Check } from "lucide-react";
import brianPhoto from "@/assets/brian-hanson.jpeg";

interface CredentialBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
}

const CredentialBadge = ({ icon, label, value, delay }: CredentialBadgeProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
        {icon}
      </div>
      <span className="text-xl font-bold font-display text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
};

const bioBullets = [
  "4X Inc. 5000 entrepreneur (highest ranking: #80)",
  "Built multiple 7-figure businesses from the ground up",
  "Taught 150,000+ people to leverage AI through AI for Business Live",
  "Currently building Revven, an AI content platform",
  "I still build apps every week using the exact system I'm teaching you",
];

const AboutHostSection = () => {
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

  const credentials = [
    { icon: <Award className="w-5 h-5 text-primary" />, label: "Inc 5000 Honoree", value: "4X", delay: 0 },
    { icon: <TrendingUp className="w-5 h-5 text-accent" />, label: "Highest Ranking", value: "#80", delay: 100 },
    { icon: <Users className="w-5 h-5 text-secondary" />, label: "Students Taught", value: "150K+", delay: 200 },
    { icon: <Heart className="w-5 h-5 text-primary" />, label: "Social Followers", value: "1M+", delay: 300 },
  ];

  return (
    <Section variant="muted" spacing="xl" className="relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-radial from-accent/5 to-transparent blur-3xl" />

      <Container size="wide" className="relative z-10">
        <div ref={sectionRef} className="max-w-5xl mx-auto">
          {/* Main Card */}
          <div
            className={`relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-12 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-50 blur-xl -z-10" />

            <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
              {/* Left - Photo */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  {/* Photo container with glow */}
                  <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/30">
                    {/* Brian's photo */}
                    <img 
                      src={brianPhoto} 
                      alt="Brian Hanson" 
                      className="w-full h-full object-cover object-center"
                    />
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                  </div>
                  {/* Outer glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 blur-2xl -z-10 scale-110" />
                </div>
              </div>

              {/* Right - Content */}
              <div className="md:col-span-3 space-y-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="mb-2">
                    Your Instructor
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    Brian Hanson
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    I've spent 20+ years in the trenches building businesses. Now I help entrepreneurs skip the hard lessons I learned.
                  </p>
                </div>

                {/* Bio Bullets */}
                <ul className="space-y-3">
                  {bioBullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Personal Note */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-foreground/90 font-medium italic border-l-2 border-primary pl-4">
                    "I'm not a developer. I'm an entrepreneur who figured out how to make AI do the heavy lifting. 
                    If I can do this, you definitely can."
                  </p>
                </div>
              </div>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-border/50">
              {credentials.map((cred, index) => (
                <CredentialBadge key={index} {...cred} />
              ))}
            </div>

            {/* Publication Logos Placeholder */}
            <div className="mt-8 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider">
                As Featured In
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
                {["Forbes", "Inc.", "Entrepreneur", "Business Insider", "TechCrunch"].map((pub) => (
                  <span
                    key={pub}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {pub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export { AboutHostSection };
