import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";
import { Sparkles, Home, LayoutDashboard } from "lucide-react";

interface Props {
  page: "vip-offer" | "downsell";
}

export const PrelaunchSalesPlaceholder = ({ page }: Props) => {
  const title =
    page === "vip-offer"
      ? "VIP details are being finalized"
      : "Special offer coming soon";
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${title} — Appreneur Challenge`}
        description="Paid upgrades will be available once the challenge officially launches."
        noindex={true}
      />
      <Container size="tight" className="py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            We're still recording the challenge lessons, so paid upgrades aren't
            available yet. You'll be the first to know when they open.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button variant="cta" asChild className="gap-2">
              <Link to="/dashboard">
                <LayoutDashboard className="w-4 h-4" />
                Go to dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PrelaunchSalesPlaceholder;