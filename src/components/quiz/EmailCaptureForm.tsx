import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Gift, Loader2, Phone, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().max(20).optional(),
});

interface EmailCaptureFormProps {
  onSubmit: (data: { firstName: string; email: string; password: string; phone?: string }) => Promise<void>;
  isLoading: boolean;
  isVisible: boolean;
}

const EmailCaptureForm = ({ onSubmit, isLoading, isVisible }: EmailCaptureFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; password?: string }>({});

  if (!isVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse({ firstName, email, password, phone: phone || undefined });
    if (!result.success) {
      const fieldErrors: { firstName?: string; email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "firstName") fieldErrors.firstName = err.message;
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit({ 
      firstName: result.data.firstName, 
      email: result.data.email,
      password: result.data.password,
      phone: result.data.phone,
    });
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

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "border-destructive pr-10" : "pr-10"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
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
            "50 Profitable AI App Ideas for 2026"
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailCaptureForm;
