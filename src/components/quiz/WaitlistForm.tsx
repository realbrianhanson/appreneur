import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

interface WaitlistFormProps {
  nextCohortDate: string;
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

const WaitlistForm = ({ nextCohortDate, onSubmit, isLoading }: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    await onSubmit(result.data);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="animate-fade-in text-center space-y-4 p-6 rounded-xl bg-primary/10 border border-primary/30">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-display font-bold">You're on the waitlist!</h3>
        <p className="text-muted-foreground">
          We'll email you as soon as the next cohort opens.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 p-6 rounded-xl bg-secondary/10 border border-secondary/30">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary font-semibold text-sm mb-4">
          <Bell className="w-4 h-4" />
          This Cohort is Full
        </div>
        <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
          Join the Waitlist for {nextCohortDate}
        </h3>
        <p className="text-muted-foreground">
          Be the first to know when the next cohort opens.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="xl"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5" />
              Notify Me When Spots Open
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default WaitlistForm;
