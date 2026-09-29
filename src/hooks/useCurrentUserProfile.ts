import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface CurrentUserProfile {
  user_id: string;
  nome: string;
  email: string;
  cargo: string | null;
  setor: string | null;
  ativo: boolean;
}

const CURRENT_USER_PROFILE_KEY = ["current-user-profile"];

export function useCurrentUserProfile() {
  const { user, loading: authLoading } = useAuth();

  const {
    data: profile = null,
    isLoading,
  } = useQuery({
    queryKey: [...CURRENT_USER_PROFILE_KEY, user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, nome, email, cargo, setor, ativo")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return (data as CurrentUserProfile | null) ?? null;
    },
  });

  return {
    profile,
    loading: authLoading || isLoading,
  };
}
