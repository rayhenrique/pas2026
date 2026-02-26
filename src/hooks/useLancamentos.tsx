import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface Lancamento {
  id: string;
  user_id: string;
  meta_id: string;
  quadrimestre: number;
  ano: number;
  resultado: number | null;
  justificativa: string | null;
}

interface AcaoStatus {
  id: string;
  user_id: string;
  acao_id: string;
  meta_id: string;
  concluida: boolean;
  ano: number;
}

// Query keys
const LANCAMENTOS_KEY = (ano: number) => ["lancamentos", ano];
const ACOES_STATUS_KEY = (ano: number) => ["acoes-status", ano];

// Funções de fetch
async function fetchLancamentos(ano: number): Promise<Lancamento[]> {
  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("ano", ano);

  if (error) throw error;
  return data || [];
}

async function fetchAcoesStatus(ano: number): Promise<AcaoStatus[]> {
  const { data, error } = await supabase
    .from("acoes_status")
    .select("*")
    .eq("ano", ano);

  if (error) throw error;
  return data || [];
}

export function useLancamentos(ano: number = 2026) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const {
    data: lancamentos = [],
    isLoading: loadingLancamentos,
  } = useQuery({
    queryKey: LANCAMENTOS_KEY(ano),
    queryFn: () => fetchLancamentos(ano),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const {
    data: acoesStatus = [],
    isLoading: loadingAcoesStatus,
  } = useQuery({
    queryKey: ACOES_STATUS_KEY(ano),
    queryFn: () => fetchAcoesStatus(ano),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  const loading = loadingLancamentos || loadingAcoesStatus;

  // Mutation para salvar lançamento
  const saveLancamentoMutation = useMutation({
    mutationFn: async ({
      metaId,
      quadrimestre,
      resultado,
      justificativa,
    }: {
      metaId: string;
      quadrimestre: number;
      resultado: number | null;
      justificativa: string | null;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const existing = lancamentos.find(
        (l) => l.meta_id === metaId && l.quadrimestre === quadrimestre && l.ano === ano
      );

      if (existing) {
        const { error } = await supabase
          .from("lancamentos")
          .update({ resultado, justificativa })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("lancamentos").insert({
          user_id: user.id,
          meta_id: metaId,
          quadrimestre,
          ano,
          resultado,
          justificativa,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LANCAMENTOS_KEY(ano) });
      toast({
        title: "Lançamento salvo!",
        description: "Os dados foram salvos com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("Erro ao salvar lançamento:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para toggle status da ação
  const toggleAcaoStatusMutation = useMutation({
    mutationFn: async ({
      acaoId,
      metaId,
      concluida,
    }: {
      acaoId: string;
      metaId: string;
      concluida: boolean;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const existing = acoesStatus.find((a) => a.acao_id === acaoId && a.ano === ano);

      if (existing) {
        const { error } = await supabase
          .from("acoes_status")
          .update({ concluida })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("acoes_status").insert({
          user_id: user.id,
          acao_id: acaoId,
          meta_id: metaId,
          concluida,
          ano,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACOES_STATUS_KEY(ano) });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar ação:", error);
      toast({
        title: "Erro ao atualizar ação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saving = saveLancamentoMutation.isPending || toggleAcaoStatusMutation.isPending;

  // Wrapper functions para manter compatibilidade
  const saveLancamento = (
    metaId: string,
    quadrimestre: number,
    resultado: number | null,
    justificativa: string | null
  ) => saveLancamentoMutation.mutateAsync({ metaId, quadrimestre, resultado, justificativa });

  const toggleAcaoStatus = (acaoId: string, metaId: string, concluida: boolean) =>
    toggleAcaoStatusMutation.mutateAsync({ acaoId, metaId, concluida });

  // Helpers para obter dados
  const getResultado = (metaId: string, quadrimestre: number): number | null => {
    const lancamento = lancamentos.find(
      (l) => l.meta_id === metaId && l.quadrimestre === quadrimestre && l.ano === ano
    );
    return lancamento?.resultado ?? null;
  };

  const getJustificativa = (metaId: string, quadrimestre: number): string | null => {
    const lancamento = lancamentos.find(
      (l) => l.meta_id === metaId && l.quadrimestre === quadrimestre && l.ano === ano
    );
    return lancamento?.justificativa ?? null;
  };

  const isAcaoConcluida = (acaoId: string): boolean => {
    const status = acoesStatus.find((a) => a.acao_id === acaoId && a.ano === ano);
    return status?.concluida ?? false;
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: LANCAMENTOS_KEY(ano) }),
      queryClient.invalidateQueries({ queryKey: ACOES_STATUS_KEY(ano) }),
    ]);
  };

  return {
    lancamentos,
    acoesStatus,
    loading,
    saving,
    saveLancamento,
    toggleAcaoStatus,
    getResultado,
    getJustificativa,
    isAcaoConcluida,
    refresh,
  };
}
