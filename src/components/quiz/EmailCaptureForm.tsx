import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Gift, Loader2 } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

interface EmailCaptureFormProps {
  onSubmit: (data: { firstName: string; email: string }) => Promise<void>;
  isLoading: boolean;
  isVisible: boolean;
}

const EmailCaptureForm = ({ onSubmit, isLoading, isVisible }: EmailCaptureFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string; email?: string }>({});

  if (!isVisible) return null;

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

    await onSubmit({ firstName: result.data.firstName, email: result.data.email });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
          You're in! Let's get you registered.
        </h3>
        <p className="text-muted-foreground">
          Enter your details below to reserve your free spot.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button
          type="submit"
          variant="cta"
          size="xl"
          className="w-full"
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
            "50 Profitable AI App Ideas for 2025"
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailCaptureForm;
