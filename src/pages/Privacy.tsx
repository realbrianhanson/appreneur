import { Container } from "@/components/layout/Container";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Privacy Policy — Appreneur Challenge"
        description="Privacy policy for the Appreneur Challenge."
        noindex={true}
      />
      
      <Container size="tight" className="py-12 md:py-16">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-xl">Appreneur</span>
        </div>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            Privacy Policy
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: January 15, 2026
          </p>

          <section className="space-y-4 text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              participate in the challenge, or contact us for support. This may include your name, 
              email address, phone number, and quiz responses.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to provide, maintain, and improve our services, 
              send you challenge-related communications, and respond to your requests.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share your information with service 
              providers who assist us in operating our platform and delivering the challenge experience.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information. 
              You can also opt out of marketing communications at any time.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@appreneur.ai" className="text-primary hover:underline">
                privacy@appreneur.ai
              </a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default Privacy;