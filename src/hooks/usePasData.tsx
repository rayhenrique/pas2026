import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Acao {
  id: string;
  meta_id: string;
  numero: number;
  descricao: string;
}

export interface Meta {
  id: string;
  diretriz_id: string;
  numero: number;
  descricao: string;
  indicador: string;
  meta_plano_2025: string;
  unidade_medida: string;
  acoes: Acao[];
}

export interface Diretriz {
  id: string;
  eixo_id: string;
  numero: number;
  nome: string;
  metas: Meta[];
}

export interface Eixo {
  id: string;
  numero: number;
  nome: string;
  diretrizes: Diretriz[];
}

// Query key para dados do PAS
const PAS_DATA_KEY = ["pas-data"];

// Função para buscar e construir estrutura aninhada dos dados
async function fetchPasData(): Promise<Eixo[]> {
  const [eixosRes, diretrizesRes, metasRes, acoesRes] = await Promise.all([
    supabase.from("eixos").select("*").order("numero"),
    supabase.from("diretrizes").select("*").order("numero"),
    supabase.from("metas").select("*").order("numero"),
    supabase.from("acoes").select("*").order("numero"),
  ]);

  if (eixosRes.error) throw eixosRes.error;
  if (diretrizesRes.error) throw diretrizesRes.error;
  if (metasRes.error) throw metasRes.error;
  if (acoesRes.error) throw acoesRes.error;

  // Build the nested structure
  const acoesMap = new Map<string, Acao[]>();
  acoesRes.data?.forEach((acao) => {
    if (!acoesMap.has(acao.meta_id)) {
      acoesMap.set(acao.meta_id, []);
    }
    acoesMap.get(acao.meta_id)!.push(acao);
  });

  const metasMap = new Map<string, Meta[]>();
  metasRes.data?.forEach((meta) => {
    if (!metasMap.has(meta.diretriz_id)) {
      metasMap.set(meta.diretriz_id, []);
    }
    metasMap.get(meta.diretriz_id)!.push({
      ...meta,
      acoes: acoesMap.get(meta.id) || [],
    });
  });

  const diretrizesMap = new Map<string, Diretriz[]>();
  diretrizesRes.data?.forEach((diretriz) => {
    if (!diretrizesMap.has(diretriz.eixo_id)) {
      diretrizesMap.set(diretriz.eixo_id, []);
    }
    diretrizesMap.get(diretriz.eixo_id)!.push({
      ...diretriz,
      metas: metasMap.get(diretriz.id) || [],
    });
  });

  return (eixosRes.data || []).map((eixo) => ({
    ...eixo,
    diretrizes: diretrizesMap.get(eixo.id) || [],
  }));
}

export function usePasData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query principal para dados do PAS
  const {
    data: eixos = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: PAS_DATA_KEY,
    queryFn: fetchPasData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });

  // Helper para invalidar cache após mutações
  const invalidateAndToast = async (successMessage: string) => {
    await queryClient.invalidateQueries({ queryKey: PAS_DATA_KEY });
    toast({ title: successMessage });
  };

  const handleMutationError = (error: Error, context: string) => {
    console.error(`Erro ao ${context}:`, error);
    toast({
      title: `Erro ao ${context}`,
      description: error.message,
      variant: "destructive",
    });
  };

  // CRUD Eixos
  const createEixoMutation = useMutation({
    mutationFn: async ({ numero, nome }: { numero: number; nome: string }) => {
      const { error } = await supabase.from("eixos").insert({ numero, nome });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Eixo criado com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar eixo"),
  });

  const updateEixoMutation = useMutation({
    mutationFn: async ({ id, numero, nome }: { id: string; numero: number; nome: string }) => {
      const { error } = await supabase.from("eixos").update({ numero, nome }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Eixo atualizado!"),
    onError: (error: Error) => handleMutationError(error, "atualizar eixo"),
  });

  const deleteEixoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("eixos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Eixo excluído!"),
    onError: (error: Error) => handleMutationError(error, "excluir eixo"),
  });

  // CRUD Diretrizes
  const createDiretrizMutation = useMutation({
    mutationFn: async ({ eixoId, numero, nome }: { eixoId: string; numero: number; nome: string }) => {
      const { error } = await supabase.from("diretrizes").insert({ eixo_id: eixoId, numero, nome });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar diretriz"),
  });

  const updateDiretrizMutation = useMutation({
    mutationFn: async ({ id, numero, nome }: { id: string; numero: number; nome: string }) => {
      const { error } = await supabase.from("diretrizes").update({ numero, nome }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar diretriz"),
  });

  const deleteDiretrizMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("diretrizes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir diretriz"),
  });

  // CRUD Metas
  const createMetaMutation = useMutation({
    mutationFn: async ({
      diretrizId,
      numero,
      descricao,
      indicador,
      metaPlano2025,
      unidadeMedida,
    }: {
      diretrizId: string;
      numero: number;
      descricao: string;
      indicador: string;
      metaPlano2025: string;
      unidadeMedida: string;
    }) => {
      const { error } = await supabase.from("metas").insert({
        diretriz_id: diretrizId,
        numero,
        descricao,
        indicador,
        meta_plano_2025: metaPlano2025,
        unidade_medida: unidadeMedida,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar meta"),
  });

  const updateMetaMutation = useMutation({
    mutationFn: async ({
      id,
      numero,
      descricao,
      indicador,
      metaPlano2025,
      unidadeMedida,
    }: {
      id: string;
      numero: number;
      descricao: string;
      indicador: string;
      metaPlano2025: string;
      unidadeMedida: string;
    }) => {
      const { error } = await supabase.from("metas").update({
        numero,
        descricao,
        indicador,
        meta_plano_2025: metaPlano2025,
        unidade_medida: unidadeMedida,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar meta"),
  });

  const deleteMetaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("metas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir meta"),
  });

  // CRUD Ações
  const createAcaoMutation = useMutation({
    mutationFn: async ({ metaId, numero, descricao }: { metaId: string; numero: number; descricao: string }) => {
      const { error } = await supabase.from("acoes").insert({ meta_id: metaId, numero, descricao });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar ação"),
  });

  const updateAcaoMutation = useMutation({
    mutationFn: async ({ id, numero, descricao }: { id: string; numero: number; descricao: string }) => {
      const { error } = await supabase.from("acoes").update({ numero, descricao }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar ação"),
  });

  const deleteAcaoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("acoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir ação"),
  });

  // Estado de saving agregado de todas as mutations
  const saving =
    createEixoMutation.isPending ||
    updateEixoMutation.isPending ||
    deleteEixoMutation.isPending ||
    createDiretrizMutation.isPending ||
    updateDiretrizMutation.isPending ||
    deleteDiretrizMutation.isPending ||
    createMetaMutation.isPending ||
    updateMetaMutation.isPending ||
    deleteMetaMutation.isPending ||
    createAcaoMutation.isPending ||
    updateAcaoMutation.isPending ||
    deleteAcaoMutation.isPending;

  // Wrapper functions para manter compatibilidade com API anterior
  const createEixo = (numero: number, nome: string) =>
    createEixoMutation.mutateAsync({ numero, nome });

  const updateEixo = (id: string, numero: number, nome: string) =>
    updateEixoMutation.mutateAsync({ id, numero, nome });

  const deleteEixo = (id: string) =>
    deleteEixoMutation.mutateAsync(id);

  const createDiretriz = (eixoId: string, numero: number, nome: string) =>
    createDiretrizMutation.mutateAsync({ eixoId, numero, nome });

  const updateDiretriz = (id: string, numero: number, nome: string) =>
    updateDiretrizMutation.mutateAsync({ id, numero, nome });

  const deleteDiretriz = (id: string) =>
    deleteDiretrizMutation.mutateAsync(id);

  const createMeta = (
    diretrizId: string,
    numero: number,
    descricao: string,
    indicador: string,
    metaPlano2025: string,
    unidadeMedida: string
  ) =>
    createMetaMutation.mutateAsync({
      diretrizId,
      numero,
      descricao,
      indicador,
      metaPlano2025,
      unidadeMedida,
    });

  const updateMeta = (
    id: string,
    numero: number,
    descricao: string,
    indicador: string,
    metaPlano2025: string,
    unidadeMedida: string
  ) =>
    updateMetaMutation.mutateAsync({
      id,
      numero,
      descricao,
      indicador,
      metaPlano2025,
      unidadeMedida,
    });

  const deleteMeta = (id: string) =>
    deleteMetaMutation.mutateAsync(id);

  const createAcao = (metaId: string, numero: number, descricao: string) =>
    createAcaoMutation.mutateAsync({ metaId, numero, descricao });

  const updateAcao = (id: string, numero: number, descricao: string) =>
    updateAcaoMutation.mutateAsync({ id, numero, descricao });

  const deleteAcao = (id: string) =>
    deleteAcaoMutation.mutateAsync(id);

  return {
    eixos,
    loading,
    saving,
    refresh: refetch,
    createEixo,
    updateEixo,
    deleteEixo,
    createDiretriz,
    updateDiretriz,
    deleteDiretriz,
    createMeta,
    updateMeta,
    deleteMeta,
    createAcao,
    updateAcao,
    deleteAcao,
  };
}
