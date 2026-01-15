import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEOHead from "@/components/seo/SEOHead";
import { trackPageView, trackDownsellView } from "@/lib/analytics";
import { Check, ArrowRight, FileText } from "lucide-react";

const Downsell = () => {
  // Track page view and downsell view on mount
  useEffect(() => {
    trackPageView('/downsell', 'Special Offer — Appreneur Challenge');
    trackDownsellView();
  }, []);

  const features = [
    "47 Copy-Paste Prompts for Lovable",
    "Organized by App Type (SaaS, Mobile, Internal Tools)",
    "Instant PDF Download",
    "Lifetime Access",
  ];

  return (
    <div className="min-h-screen bg-background flex items-center">
      {/* SEO Head - noindex for funnel page */}
      <SEOHead 
        title="Special Offer — Prompt Vault"
        description="Get 47 copy-paste prompts for building apps with Lovable."
        noindex={true}
      />
      <Container size="tight" className="py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center space-y-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-primary" />
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Not Ready for the Full Kit?
            </h1>
            <p className="text-xl text-muted-foreground">
              Grab Just the Prompt Vault for{" "}
              <span className="text-primary font-bold">$7</span>
            </p>
          </div>

          {/* Body Copy */}
          <div className="text-muted-foreground space-y-4 text-left md:text-center">
            <p>
              I get it — maybe you just want to see what this is about first.
            </p>
            <p>
              Here's the deal: My <span className="text-foreground font-semibold">47 Lovable Prompts</span> are 
              the same ones I use to build apps 10x faster. They're copy-paste ready and work immediately.
            </p>
            <p>
              Just $7. And you can always upgrade to the full VIP bundle later.
            </p>
          </div>

          {/* What's Included Card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4">What's Included:</h2>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Pricing */}
            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <div>
                <span className="text-muted-foreground line-through">Value: $67</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Today:</span>
                <span className="text-3xl font-display font-bold text-primary ml-2">$7</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            variant="cta"
            size="xl"
            className="w-full"
          >
            Get the Prompt Vault — $7
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Skip Link */}
          <div className="pt-4">
            <Link
              to="/thank-you"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, take me to my free challenge →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Downsell;
