import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AdminRoleState {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isSupport: boolean;
  role: AppRole | null;
  isLoading: boolean;
}

export function useAdminRole(): AdminRoleState {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<AdminRoleState>({
    isAdmin: false,
    isSuperAdmin: false,
    isSupport: false,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    async function fetchRole() {
      if (authLoading) return;
      
      if (!user) {
        setState({
          isAdmin: false,
          isSuperAdmin: false,
          isSupport: false,
          role: null,
          isLoading: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching admin role:", error);
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const role = data?.role || null;
        setState({
          isAdmin: role === "admin" || role === "super_admin",
          isSuperAdmin: role === "super_admin",
          isSupport: role === "support",
          role,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching admin role:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchRole();
  }, [user, authLoading]);

  return state;
}
