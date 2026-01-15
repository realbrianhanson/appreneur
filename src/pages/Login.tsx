import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<"password" | "magic">("magic");
  
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
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue your app-building journey
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
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
                    <Link 
                      to="/forgot-password" 
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
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
            </form>
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
