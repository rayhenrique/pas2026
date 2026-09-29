import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { SelectedYear, StatusAtingimento } from "@/types/pas";

export interface HistoricoItem {
  id: string;
  meta_id: string;
  ano_referencia: SelectedYear;
  valor_realizado: number | null;
  analise_qualitativa: string | null;
  status_atingimento: StatusAtingimento;
  user_id: string;
  updated_at: string;
  perfil_alterador?: {
    nome: string;
    email: string;
    cargo?: string | null;
    setor?: string | null;
  };
}

const HISTORICO_KEY = (userId?: string, metaId?: string) =>
  metaId ? ["historico-anual", userId, metaId] : ["historico-anual", userId];

async function fetchHistorico(metaId?: string): Promise<HistoricoItem[]> {
  let query = supabase
    .from("avaliacoes_anuais")
    .select("*")
    .order("ano_referencia", { ascending: false })
    .order("updated_at", { ascending: false });

  if (metaId) {
    query = query.eq("meta_id", metaId);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (!data || data.length === 0) {
    return [];
  }

  const userIds = [...new Set(data.map((item) => item.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, nome, email, cargo, setor")
    .in("user_id", userIds);

  const profileMap = new Map(
    (profiles || []).map((profile) => [
      profile.user_id,
      {
        nome: profile.nome,
        email: profile.email,
        cargo: profile.cargo,
        setor: profile.setor,
      },
    ]),
  );

  return data.map((item) => ({
    ...(item as HistoricoItem),
    perfil_alterador: profileMap.get(item.user_id),
  }));
}

export function useHistorico(metaId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { schemaReady, checkingSchema } = useAnnualSchemaStatus();

  const {
    data: historico = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: HISTORICO_KEY(user?.id, metaId),
    queryFn: () => fetchHistorico(metaId),
    enabled: !!user && schemaReady,
    staleTime: 60 * 1000,
    retry: false,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: HISTORICO_KEY(user?.id, metaId) });
  };

  return {
    historico,
    loading: checkingSchema || loading,
    refresh,
    refetch,
  };
}
