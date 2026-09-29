import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSelectedYear } from "@/contexts/SelectedYearContext";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { AcaoStatusAnual, AvaliacaoAnual, PasMeta } from "@/types/pas";
import { getMetaStatus } from "@/utils/pasHelpers";

const AVALIACOES_KEY = (year: number, userId?: string) => ["avaliacoes-anuais", userId, year];
const ACOES_STATUS_KEY = (year: number, userId?: string) => ["acoes-status", userId, year];

async function fetchAvaliacoes(year: number): Promise<AvaliacaoAnual[]> {
  const { data, error } = await supabase
    .from("avaliacoes_anuais")
    .select("*")
    .eq("ano_referencia", year);

  if (error) throw error;
  return (data || []) as AvaliacaoAnual[];
}

async function fetchAcoesStatus(year: number): Promise<AcaoStatusAnual[]> {
  const { data, error } = await supabase
    .from("acoes_status")
    .select("*")
    .eq("ano_referencia", year);

  if (error) throw error;
  return (data || []) as AcaoStatusAnual[];
}

export function useLancamentos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { selectedYear } = useSelectedYear();
  const { schemaReady, checkingSchema, schemaMessage } = useAnnualSchemaStatus();

  const {
    data: avaliacoes = [],
    isLoading: loadingAvaliacoes,
  } = useQuery({
    queryKey: AVALIACOES_KEY(selectedYear, user?.id),
    queryFn: () => fetchAvaliacoes(selectedYear),
    enabled: !!user && schemaReady,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const {
    data: acoesStatus = [],
    isLoading: loadingAcoesStatus,
  } = useQuery({
    queryKey: ACOES_STATUS_KEY(selectedYear, user?.id),
    queryFn: () => fetchAcoesStatus(selectedYear),
    enabled: !!user && schemaReady,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const loading = checkingSchema || loadingAvaliacoes || loadingAcoesStatus;

  const saveAvaliacaoMutation = useMutation({
    mutationFn: async ({
      meta,
      valorRealizado,
      analiseQualitativa,
    }: {
      meta: PasMeta;
      valorRealizado: number | null;
      analiseQualitativa: string | null;
    }) => {
      if (!schemaReady) {
        throw new Error(
          schemaMessage ||
            "O schema anual ainda não foi aplicado no Supabase deste ambiente.",
        );
      }
      if (!user) throw new Error("Usuário não autenticado");

      const status = getMetaStatus(meta, valorRealizado);
      const existing = avaliacoes.find(
        (avaliacao) => avaliacao.meta_id === meta.id && avaliacao.ano_referencia === selectedYear,
      );

      if (existing) {
        const { error } = await supabase
          .from("avaliacoes_anuais")
          .update({
            valor_realizado: valorRealizado,
            analise_qualitativa: analiseQualitativa,
            status_atingimento: status,
          })
          .eq("id", existing.id);

        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("avaliacoes_anuais").insert({
        meta_id: meta.id,
        ano_referencia: selectedYear,
        valor_realizado: valorRealizado,
        analise_qualitativa: analiseQualitativa,
        status_atingimento: status,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AVALIACOES_KEY(selectedYear, user?.id) });
      toast({
        title: "Avaliação anual salva!",
        description: "Os dados do ano selecionado foram atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("Erro ao salvar avaliação anual:", error);
      toast({
        title: "Erro ao salvar avaliação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
      if (!schemaReady) {
        throw new Error(
          schemaMessage ||
            "O schema anual ainda não foi aplicado no Supabase deste ambiente.",
        );
      }
      if (!user) throw new Error("Usuário não autenticado");

      const existing = acoesStatus.find(
        (acaoStatus) => acaoStatus.acao_id === acaoId && acaoStatus.ano_referencia === selectedYear,
      );

      if (existing) {
        const { error } = await supabase
          .from("acoes_status")
          .update({ concluida })
          .eq("id", existing.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from("acoes_status").insert({
        acao_id: acaoId,
        meta_id: metaId,
        ano_referencia: selectedYear,
        concluida,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACOES_STATUS_KEY(selectedYear, user?.id) });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar ação anual:", error);
      toast({
        title: "Erro ao atualizar ação",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saving = saveAvaliacaoMutation.isPending || toggleAcaoStatusMutation.isPending;

  const getAvaliacao = (metaId: string): AvaliacaoAnual | null =>
    avaliacoes.find((avaliacao) => avaliacao.meta_id === metaId && avaliacao.ano_referencia === selectedYear) || null;

  const getResultado = (metaId: string): number | null => getAvaliacao(metaId)?.valor_realizado ?? null;

  const getAnaliseQualitativa = (metaId: string): string | null => getAvaliacao(metaId)?.analise_qualitativa ?? null;

  const getStatus = (metaId: string) => getAvaliacao(metaId)?.status_atingimento ?? "nao_avaliado";

  const isAcaoConcluida = (acaoId: string): boolean =>
    acoesStatus.find((acaoStatus) => acaoStatus.acao_id === acaoId && acaoStatus.ano_referencia === selectedYear)?.concluida ?? false;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: AVALIACOES_KEY(selectedYear, user?.id) }),
      queryClient.invalidateQueries({ queryKey: ACOES_STATUS_KEY(selectedYear, user?.id) }),
    ]);
  };

  return {
    avaliacoes,
    acoesStatus,
    loading,
    saving,
    selectedYear,
    saveLancamento: (meta: PasMeta, valorRealizado: number | null, analiseQualitativa: string | null) =>
      saveAvaliacaoMutation.mutateAsync({ meta, valorRealizado, analiseQualitativa }),
    toggleAcaoStatus: (acaoId: string, metaId: string, concluida: boolean) =>
      toggleAcaoStatusMutation.mutateAsync({ acaoId, metaId, concluida }),
    getAvaliacao,
    getResultado,
    getAnaliseQualitativa,
    getStatus,
    isAcaoConcluida,
    refresh,
  };
}
