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

          <p className="text-muted-foreground mb-6">Last updated: July 22, 2026</p>

          <section className="space-y-4 text-muted-foreground">
            <p>
              These Terms govern your use of the Appreneur Challenge (the
              "Service"), a project of AI For Business ("we", "us"). By
              creating an account or otherwise using the Service, you agree to
              these Terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground">1. Eligibility</h2>
            <p>
              You must be at least 13 years old to use the Service, and old
              enough under your local law to form a binding agreement. If you
              use the Service on behalf of an organization, you represent that
              you have authority to bind it.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Your account</h2>
            <p>
              You are responsible for the information you provide, for keeping
              your login credentials secure, and for activity that happens under
              your account. Please contact us promptly if you believe your
              account has been used without your permission.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. Acceptable use</h2>
            <p>
              Use the Service only for lawful purposes. Don't attempt to
              disrupt or reverse-engineer the Service, don't use it to harass
              others, don't upload malicious content, and don't share access
              with people who haven't accepted these Terms.
            </p>

            <h2 className="text-xl font-semibold text-foreground">4. Educational purpose — no outcome guarantee</h2>
            <p>
              The Appreneur Challenge is a free, self-paced, five-day
              educational roadmap that shows a way to move from an app idea to a
              working first version using no-code and AI-powered tools. It is
              provided for educational purposes. We do not guarantee any
              specific result, income, launch, or business outcome. Your
              results depend on the effort you put in and factors outside our
              control.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Service availability</h2>
            <p>
              The Service is offered on an as-available basis. We may change,
              suspend, or evolve the content, features, and delivery of the
              Service at any time as we improve it. Some lessons, tools, or
              downloadable resources may be added, changed, or removed over
              time.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. User-submitted content</h2>
            <p>
              You retain ownership of anything you submit to the Service, such
              as a testimonial, comment, or app screenshot. By submitting
              content, you grant AI For Business a limited, worldwide,
              royalty-free license to store, reproduce, and display that
              content solely to operate the Service. We will only publicly
              display testimonials, screenshots, or other user-submitted
              content after you have submitted them for that purpose and we
              have approved them for display.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Intellectual property</h2>
            <p>
              The Service and its original content — including the site design,
              text, and any videos or downloadable materials we publish as part
              of the challenge — are owned by AI For Business and are protected
              by intellectual-property laws. You may use the Service for your
              own personal learning. You may not resell or redistribute our
              materials without written permission.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Third-party tools</h2>
            <p>
              The challenge may mention or link to third-party tools. Your use
              of those tools is governed by their own terms and pricing. We are
              not responsible for third-party services.
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Future paid offers</h2>
            <p>
              The core challenge is free. If we introduce a paid offer in the
              future, we will clearly show its price and its purchase and refund
              terms before you check out. Nothing in these Terms creates a
              current obligation for either of us related to a paid product.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Changes and termination</h2>
            <p>
              We may change, suspend, or discontinue any part of the Service at
              any time. You may stop using the Service or ask us to delete your
              account at any time. We may suspend or terminate access for users
              who violate these Terms or use the Service in a way that harms
              others or the Service.
            </p>

            <h2 className="text-xl font-semibold text-foreground">11. Disclaimers</h2>
            <p>
              The Service is provided "as is" and "as available" without
              warranties of any kind, whether express or implied, to the fullest
              extent permitted by law. We do not warrant that the Service will
              be uninterrupted, error-free, or that it will produce any
              particular result.
            </p>

            <h2 className="text-xl font-semibold text-foreground">12. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, AI For Business is not
              liable for indirect, incidental, special, consequential, or
              punitive damages, or for lost profits or revenue, arising from
              your use of the Service. Nothing in these Terms limits any
              liability that cannot be limited under applicable law.
            </p>

            <h2 className="text-xl font-semibold text-foreground">13. Changes to these Terms</h2>
            <p>
              We may update these Terms as the Service evolves. Material changes
              will be reflected in the "Last updated" date above and, where
              appropriate, communicated by email.
            </p>

            <h2 className="text-xl font-semibold text-foreground">14. Contact</h2>
            <p>
              Questions about these Terms:{" "}
              <a href="mailto:legal@appreneur.ai" className="text-primary hover:underline">
                legal@appreneur.ai
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default Terms;