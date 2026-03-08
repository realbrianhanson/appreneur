import { Container } from "@/components/layout/Container";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Terms of Service — Appreneur Challenge"
        description="Terms of service for the Appreneur Challenge."
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
            Terms of Service
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Last updated: January 15, 2026
          </p>

          <section className="space-y-4 text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Appreneur Challenge, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              The Appreneur Challenge is a free 5-day educational program designed to teach participants 
              how to build applications using no-code and AI-powered tools.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and 
              for all activities that occur under your account. You agree to use the service for lawful 
              purposes only.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
            <p>
              All content provided through the challenge, including videos, templates, and resources, 
              is the property of AI For Beginners and is protected by copyright laws. You may not 
              redistribute or resell any materials without prior written consent.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Refund Policy</h2>
            <p>
              The free challenge has no cost. For paid products (VIP Bundle, etc.), we offer a 100% 
              money-back guarantee if you're not satisfied with your purchase.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              AI For Beginners shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising from your use of the service.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes via email or through the platform.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@appreneur.ai" className="text-primary hover:underline">
                legal@appreneur.ai
              </a>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default Terms;