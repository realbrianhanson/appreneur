import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { REGISTRATION_CTA_LABEL } from "@/lib/constants";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

interface EmailCaptureFormProps {
  onSubmit: (data: { firstName: string; email: string; phone?: string }) => Promise<void>;
  isLoading: boolean;
  onBack?: () => void;
}

const EmailCaptureForm = ({ onSubmit, isLoading, onBack }: EmailCaptureFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({ firstName, email });
    if (!result.success) {
      const fieldErrors: { firstName?: string; email?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "firstName") fieldErrors.firstName = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit({
      firstName: result.data.firstName,
      email: result.data.email,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow font-mono text-xs tracking-[0.2em] text-primary">
         FINAL STEP · CREATE YOUR FREE ACCOUNT
        </span>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono tracking-wider"
          >
            ← BACK
          </button>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground leading-tight tracking-tight">
        That's exactly who this challenge is built for.
        </h3>
        <p className="text-muted-foreground">
         Create your free account to unlock the full 5-day plan and start Day 1 right now.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 [&_input]:bg-white/[0.03] [&_input]:border-white/10 [&_input]:text-foreground [&_input]:h-12 [&_input:focus-visible]:ring-primary/60 [&_input:focus-visible]:border-primary/60">
        <div className="space-y-2">
          <Label htmlFor="capture-first-name" className="sr-only">
            First name
          </Label>
          <Input
            id="capture-first-name"
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={errors.firstName ? "border-destructive" : ""}
            disabled={isLoading}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "capture-first-name-error" : undefined}
          />
          <p
            id="capture-first-name-error"
            className="text-sm text-destructive"
            aria-live="polite"
          >
            {errors.firstName}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capture-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="capture-email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "capture-email-error" : undefined}
          />
          <p
            id="capture-email-error"
            className="text-sm text-destructive"
            aria-live="polite"
          >
            {errors.email}
          </p>
        </div>

        <Button
          type="submit"
          size="xl"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent hover:brightness-110 text-background font-semibold shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing you up...
            </>
          ) : (
            <>
              {REGISTRATION_CTA_LABEL}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>

      {/* Risk Reversal */}
      <p className="text-center text-xs text-muted-foreground">
        🔒 No spam. No credit card. Unsubscribe anytime. Your info stays private.
      </p>
    </div>
  );
};

export default EmailCaptureForm;
