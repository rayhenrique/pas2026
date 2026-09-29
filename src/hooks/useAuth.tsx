import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUserId = useRef<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    const applySession = (nextSession: Session | null) => {
      if (!mounted) return;

      const nextUserId = nextSession?.user.id ?? null;
      if (previousUserId.current && previousUserId.current !== nextUserId) {
        queryClient.clear();
      }

      previousUserId.current = nextUserId;
      setSession(nextSession);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => applySession(nextSession),
    );

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      queryClient.clear();
      if (error) throw error;
    },
    isAuthenticated: !!session,
  }), [loading, queryClient, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
