import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Gift, Loader2, Phone } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional(),
});

interface EmailCaptureFormProps {
  onSubmit: (data: { firstName: string; email: string; phone?: string }) => Promise<void>;
  isLoading: boolean;
  onBack?: () => void;
}

const EmailCaptureForm = ({ onSubmit, isLoading, onBack }: EmailCaptureFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({ firstName, email, phone: phone || undefined });
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
      phone: result.data.phone,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="eyebrow font-mono text-xs tracking-[0.2em] text-primary">
          FINAL STEP — CLAIM YOUR SPOT
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
          You're in. Let's get you registered.
        </h3>
        <p className="text-muted-foreground">
          Enter your details below to reserve your free spot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 [&_input]:bg-white/[0.03] [&_input]:border-white/10 [&_input]:text-foreground [&_input]:h-12 [&_input:focus-visible]:ring-primary/60 [&_input:focus-visible]:border-primary/60">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={errors.firstName ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {showPhone ? (
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Phone Number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Get SMS reminders when the challenge starts
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="w-4 h-4" />
            Add phone for SMS reminders (optional)
          </button>
        )}

        <Button
          type="submit"
          size="xl"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent hover:brightness-110 text-background font-semibold shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] rounded-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Reserving Your Spot...
            </>
          ) : (
            <>
              Reserve My Free Spot
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>

      {/* Risk Reversal */}
      <p className="text-center text-xs text-muted-foreground">
        🔒 No spam. No credit card. Unsubscribe anytime. Your info stays private.
      </p>

      {/* Lead Magnet Callout */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">
            Plus, instantly download:
          </p>
          <p className="text-accent font-display">
            "50 Profitable AI App Ideas for 2026"
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailCaptureForm;
