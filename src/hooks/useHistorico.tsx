import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface HistoricoItem {
  id: string;
  lancamento_id: string;
  user_id: string;
  meta_id: string;
  quadrimestre: number;
  ano: number;
  resultado_anterior: number | null;
  resultado_novo: number | null;
  justificativa_anterior: string | null;
  justificativa_nova: string | null;
  acao: string;
  alterado_por: string;
  alterado_em: string;
  perfil_alterador?: {
    nome: string;
    email: string;
    cargo?: string;
    setor?: string;
  };
}

// Query key
const HISTORICO_KEY = (ano: number, metaId?: string) =>
  metaId ? ["historico", ano, metaId] : ["historico", ano];

// Função de fetch
async function fetchHistorico(ano: number, metaId?: string): Promise<HistoricoItem[]> {
  let query = supabase
    .from("lancamentos_historico")
    .select("*")
    .eq("ano", ano)
    .order("alterado_em", { ascending: false });

  if (metaId) {
    query = query.eq("meta_id", metaId);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (!data || data.length === 0) {
    return [];
  }

  // Buscar perfis dos usuários que fizeram alterações
  const userIds = [...new Set(data.map((h) => h.alterado_por))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, nome, email, cargo, setor")
    .in("user_id", userIds);

  const profileMap = new Map(
    profiles?.map((p) => [
      p.user_id,
      {
        nome: p.nome,
        email: p.email,
        cargo: p.cargo,
        setor: p.setor
      }
    ]) || []
  );

  return data.map((h) => ({
    ...h,
    perfil_alterador: profileMap.get(h.alterado_por),
  }));
}

export function useHistorico(metaId?: string, ano: number = 2026) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: historico = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: HISTORICO_KEY(ano, metaId),
    queryFn: () => fetchHistorico(ano, metaId),
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto (dados de auditoria mudam com frequência)
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: HISTORICO_KEY(ano, metaId) });
  };

  return {
    historico,
    loading,
    refresh,
  };
}
