import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  first_name: string;
  email: string;
  phone: string | null;
  is_vip: boolean;
  cohort_id: string | null;
  quiz_answers: Record<string, string> | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  fb_ad_id: string | null;
  fb_adset_id: string | null;
  fb_campaign_id: string | null;
  notification_preferences: { email: boolean; sms: boolean } | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as unknown as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Single subscription handles both initial session (INITIAL_SESSION event)
    // and subsequent auth changes — no double fetch.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === "SIGNED_OUT" || !newSession?.user) {
          clearAuthState();
          return;
        }

        // INITIAL_SESSION comes from browser storage. Verify it with the auth
        // server before treating protected routes as authenticated; otherwise a
        // stale saved token can be sent to get-progress and blank the dashboard.
        const verifyStoredSession = event === "INITIAL_SESSION";
        setTimeout(async () => {
          if (verifyStoredSession) {
            const { data: verified, error } = await supabase.auth.getUser();
            if (error || !verified.user) {
              await supabase.auth.signOut({ scope: "local" });
              clearAuthState();
              return;
            }
          }

          const { data: current } = await supabase.auth.getSession();
          const trustedSession = current.session;
          if (!trustedSession?.user) {
            clearAuthState();
            return;
          }

          setSession(trustedSession);
          setUser(trustedSession.user);
          const userId = trustedSession.user.id;
          const profileData = await fetchProfile(userId);
          setProfile(profileData);
          setIsLoading(false);
        }, 0);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: metadata,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearAuthState();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
