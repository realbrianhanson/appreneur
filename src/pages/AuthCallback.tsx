import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { finalizeRegistration } from "@/lib/finalize-registration";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password recovery flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          setError(error.message);
          return;
        }

        if (data.session) {
          // Redirect recovery flows to settings so user can set new password
          if (type === "recovery") {
            navigate("/dashboard/settings", { replace: true });
            return;
          }

          // Idempotently finalize early-access registration once a valid
          // session exists. Access must not depend on delivery success.
          try {
            await finalizeRegistration();
          } catch (err) {
            console.error("[auth-callback] finalize-registration failed", err);
          }

          {
            // First-time confirmed registrants get routed into the OTO funnel.
            // The "pending_registration" flag is set at signup and cleared here
            // so the VIP offer only shows once per registration.
            let pending = false;
            try {
              pending = localStorage.getItem("pending_registration") === "1";
              if (pending) localStorage.removeItem("pending_registration");
            } catch {}
            navigate(pending ? "/vip-offer" : "/dashboard", { replace: true });
          }
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("An error occurred during authentication");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}
