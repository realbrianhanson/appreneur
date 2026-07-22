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

          <p className="text-muted-foreground mb-6">Last updated: July 22, 2026</p>

          <section className="space-y-4 text-muted-foreground">
            <p>
              The Appreneur Challenge (the "Service") is a project of AI For
              Business ("we", "us"). This policy explains, in plain English,
              what personal information we collect when you use the Service
              and how we use it. Questions:{" "}
              <a href="mailto:privacy@appreneur.ai" className="text-primary hover:underline">
                privacy@appreneur.ai
              </a>
              .
            </p>

            <h2 className="text-xl font-semibold text-foreground">1. Information we collect</h2>
            <p>We collect only what we need to run the Service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Account and profile data</strong> you provide when you
                register — first name and email address.
              </li>
              <li>
                <strong>Quiz answers</strong> you submit in the short pre-signup
                questionnaire.
              </li>
              <li>
                <strong>First-party funnel and attribution data</strong> such as
                anonymous session identifiers, referral parameters (UTM
                parameters, ad IDs when present in a link), page and event
                interactions on our own site.
              </li>
              <li>
                <strong>Learning progress</strong> — which days of the challenge
                you have opened and completed, and time spent on each day.
              </li>
              <li>
                <strong>Content you optionally submit</strong> such as a
                testimonial or an app screenshot, and only if you choose to
                submit it.
              </li>
              <li>
                <strong>Purchase data</strong> — only if we introduce paid
                products in the future. In that case the payment provider
                processes card details; we receive a purchase record.
              </li>
            </ul>
            <p>
              We do not collect phone numbers or SMS opt-ins in the current
              product, and we do not run SMS marketing.
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. How we use your information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To create and secure your account.</li>
              <li>To deliver the challenge experience and track your progress.</li>
              <li>
                To send you transactional email about the Service (for example a
                welcome email, login link, or an important update).
              </li>
              <li>
                To understand how the funnel performs so we can improve it.
                First-party funnel events may reference your account after you
                sign in.
              </li>
              <li>To respond to your questions and support requests.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">3. Third-party service providers</h2>
            <p>
              We use a small set of infrastructure providers to run the Service.
              They only receive what they need to do their job:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Lovable</strong> — hosting for the web application.
              </li>
              <li>
                <strong>Supabase</strong> — authentication, database, and file
                storage.
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery, when
                email is configured.
              </li>
              <li>
                <strong>Payment providers</strong> — only if paid products are
                introduced in the future.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">4. Third-party analytics and advertising</h2>
            <p>
              Third-party analytics (such as Google Analytics or the Meta
              Pixel) are disabled by default. If we enable external analytics
              later, we will not send email addresses or account identifiers
              to them. Any dedupe id used will be an anonymous per-browser
              session identifier.
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. No sale of personal information</h2>
            <p>
              We do not sell your personal information, and we do not share it
              with third parties for their own advertising.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Retention</h2>
            <p>
              We retain account and progress data while your account is active
              and for a reasonable period afterward to satisfy legal,
              accounting, or dispute-resolution needs, and then delete or
              anonymize it. You can ask us to delete your account and personal
              information at any time.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Security</h2>
            <p>
              We use reasonable technical and organizational measures to protect
              personal information, including access controls at the database
              layer and encrypted transport. No system is perfectly secure and
              we cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Your choices and rights</h2>
            <p>
              You can access, correct, or delete your personal information by
              emailing{" "}
              <a href="mailto:privacy@appreneur.ai" className="text-primary hover:underline">
                privacy@appreneur.ai
              </a>
              . You can opt out of non-transactional email at any time by
              replying and asking to be removed. Transactional email required to
              operate your account (for example a login link) may continue.
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Children</h2>
            <p>
              The Service is not directed to children under 13. If you believe a
              child has provided us information, contact us and we will delete
              it.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. International processing</h2>
            <p>
              Our providers may process personal information in countries other
              than the one you live in. We rely on those providers' safeguards
              for cross-border transfers.
            </p>

            <h2 className="text-xl font-semibold text-foreground">11. Changes to this policy</h2>
            <p>
              We may update this policy as the Service evolves. Material changes
              will be reflected in the "Last updated" date above and, where
              appropriate, communicated by email.
            </p>

            <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
            <p>
              Questions or requests:{" "}
              <a href="mailto:privacy@appreneur.ai" className="text-primary hover:underline">
                privacy@appreneur.ai
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
};

export default Privacy;