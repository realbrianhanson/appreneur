import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic" | "forgot">("magic");
  
  const { signIn, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message || "Failed to sign in");
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signInWithMagicLink(email);
    
    if (error) {
      toast.error(error.message || "Failed to send magic link");
      setIsLoading(false);
      return;
    }

    setIsMagicLinkSent(true);
    setIsLoading(false);
    toast.success("Check your email for the magic link!");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      toast.error(error.message || "Failed to send reset link");
    } else {
      toast.success("Check your email for the password reset link!");
    }
    setIsLoading(false);
  };

  if (isMagicLinkSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Container size="tight" className="py-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Check Your Email</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              We've sent a magic link to <span className="font-semibold text-foreground">{email}</span>. 
              Click the link in the email to sign in.
            </p>
            <Button variant="outline" onClick={() => setIsMagicLinkSent(false)}>
              Try a different email
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Container size="tight" className="py-12">
        <div className="space-y-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 justify-center">
            <Zap className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-2xl">Appreneur</span>
          </Link>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold">
              {mode === "forgot" ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "forgot"
                ? "Enter your email and we'll send you a reset link"
                : "Sign in to continue your app-building journey"}
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            {mode === "forgot" ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to login
                </button>
              </form>
            ) : (
              <>
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                  <Button
                    variant={mode === "magic" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("magic")}
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Magic Link
                  </Button>
                  <Button
                    variant={mode === "password" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode("password")}
                    className="flex-1"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </Button>
                </div>

                <form onSubmit={mode === "magic" ? handleMagicLinkLogin : handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  {mode === "password" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-sm text-primary hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {mode === "magic" ? "Send Magic Link" : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  {mode === "password" && (
                    <p className="text-center text-xs text-muted-foreground">
                      Prefer no passwords?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("magic")}
                        className="text-primary hover:underline cursor-pointer font-medium"
                      >
                        Switch to magic link login
                      </button>
                    </p>
                  )}
                </form>
              </>
            )}
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/" className="text-primary hover:underline font-semibold">
              Join the Challenge
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
