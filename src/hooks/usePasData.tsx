import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { PasAcao, PasDiretriz, PasMeta, PasObjetivo } from "@/types/pas";
import { getSetorResponsavelKey, normalizeSetorResponsavelNome } from "@/utils/setoresResponsaveis";
import { useAuth } from "@/hooks/useAuth";

export type Acao = PasAcao;
export type Meta = PasMeta;
export type Objetivo = PasObjetivo;
export type Diretriz = PasDiretriz;

const PAS_DATA_KEY = (userId?: string) => ["pas-data", "annual-structure", userId];

async function ensureResponsavelSectorExists(responsavel: string) {
  const normalizedName = normalizeSetorResponsavelNome(responsavel);
  const normalizedKey = getSetorResponsavelKey(normalizedName);

  if (!normalizedName) {
    throw new Error("Selecione um setor responsável válido.");
  }

  const { data, error } = await supabase
    .from("setores_responsaveis")
    .select("id")
    .eq("nome_normalizado", normalizedKey)
    .eq("ativo", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      "O setor responsável selecionado não existe ou está inativo. Atualize o cadastro no módulo de setores responsáveis.",
    );
  }
}

async function fetchPasData(): Promise<Diretriz[]> {
  const [diretrizesRes, objetivosRes, metasRes, acoesRes] = await Promise.all([
    supabase.from("diretrizes").select("*").order("numero"),
    supabase.from("objetivos").select("*").order("numero"),
    supabase.from("metas").select("*").order("numero"),
    supabase.from("acoes").select("*").order("numero"),
  ]);

  if (diretrizesRes.error) throw diretrizesRes.error;
  if (objetivosRes.error) throw objetivosRes.error;
  if (metasRes.error) throw metasRes.error;
  if (acoesRes.error) throw acoesRes.error;

  const acoesMap = new Map<string, Acao[]>();
  (acoesRes.data || []).forEach((acao) => {
    if (!acoesMap.has(acao.meta_id)) {
      acoesMap.set(acao.meta_id, []);
    }
    acoesMap.get(acao.meta_id)?.push(acao);
  });

  const metasMap = new Map<string, Meta[]>();
  (metasRes.data || []).forEach((meta) => {
    if (!metasMap.has(meta.objetivo_id)) {
      metasMap.set(meta.objetivo_id, []);
    }
    metasMap.get(meta.objetivo_id)?.push({
      ...meta,
      acoes: acoesMap.get(meta.id) || [],
    });
  });

  const objetivosMap = new Map<string, Objetivo[]>();
  (objetivosRes.data || []).forEach((objetivo) => {
    if (!objetivosMap.has(objetivo.diretriz_id)) {
      objetivosMap.set(objetivo.diretriz_id, []);
    }
    objetivosMap.get(objetivo.diretriz_id)?.push({
      ...objetivo,
      metas: metasMap.get(objetivo.id) || [],
    });
  });

  return (diretrizesRes.data || []).map((diretriz) => ({
    ...diretriz,
    objetivos: objetivosMap.get(diretriz.id) || [],
  }));
}

export function usePasData() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { schemaReady, checkingSchema, schemaMessage } = useAnnualSchemaStatus();

  const {
    data: diretrizes = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: PAS_DATA_KEY(user?.id),
    queryFn: fetchPasData,
    enabled: !!user && schemaReady,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const ensureSchemaReady = () => {
    if (!schemaReady) {
      throw new Error(
        schemaMessage ||
          "O schema anual ainda não foi aplicado no Supabase deste ambiente.",
      );
    }
  };

  const invalidateAndToast = async (message: string) => {
    await queryClient.invalidateQueries({ queryKey: PAS_DATA_KEY(user?.id) });
    toast({ title: message });
  };

  const handleMutationError = (error: Error, context: string) => {
    console.error(`Erro ao ${context}:`, error);
    toast({
      title: `Erro ao ${context}`,
      description: error.message,
      variant: "destructive",
    });
  };

  const createDiretrizMutation = useMutation({
    mutationFn: async ({ numero, nome }: { numero: number; nome: string }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("diretrizes").insert({ numero, nome });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar diretriz"),
  });

  const updateDiretrizMutation = useMutation({
    mutationFn: async ({ id, numero, nome }: { id: string; numero: number; nome: string }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("diretrizes").update({ numero, nome }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar diretriz"),
  });

  const deleteDiretrizMutation = useMutation({
    mutationFn: async (id: string) => {
      ensureSchemaReady();
      const { error } = await supabase.from("diretrizes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Diretriz excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir diretriz"),
  });

  const createObjetivoMutation = useMutation({
    mutationFn: async ({
      diretrizId,
      numero,
      nome,
      descricao,
    }: {
      diretrizId: string;
      numero: number;
      nome: string;
      descricao: string;
    }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("objetivos").insert({
        diretriz_id: diretrizId,
        numero,
        nome,
        descricao,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Objetivo criado com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar objetivo"),
  });

  const updateObjetivoMutation = useMutation({
    mutationFn: async ({
      id,
      numero,
      nome,
      descricao,
    }: {
      id: string;
      numero: number;
      nome: string;
      descricao: string;
    }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("objetivos").update({ numero, nome, descricao }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Objetivo atualizado!"),
    onError: (error: Error) => handleMutationError(error, "atualizar objetivo"),
  });

  const deleteObjetivoMutation = useMutation({
    mutationFn: async (id: string) => {
      ensureSchemaReady();
      const { error } = await supabase.from("objetivos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Objetivo excluído!"),
    onError: (error: Error) => handleMutationError(error, "excluir objetivo"),
  });

  const createMetaMutation = useMutation({
    mutationFn: async (meta: Omit<Meta, "id" | "acoes">) => {
      ensureSchemaReady();
      await ensureResponsavelSectorExists(meta.responsavel);
      const { error } = await supabase.from("metas").insert(meta);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar meta"),
  });

  const updateMetaMutation = useMutation({
    mutationFn: async ({ id, ...meta }: Omit<Meta, "acoes">) => {
      ensureSchemaReady();
      await ensureResponsavelSectorExists(meta.responsavel);
      const { error } = await supabase.from("metas").update(meta).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar meta"),
  });

  const deleteMetaMutation = useMutation({
    mutationFn: async (id: string) => {
      ensureSchemaReady();
      const { error } = await supabase.from("metas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Meta excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir meta"),
  });

  const createAcaoMutation = useMutation({
    mutationFn: async ({ metaId, numero, descricao }: { metaId: string; numero: number; descricao: string }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("acoes").insert({
        meta_id: metaId,
        numero,
        descricao,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação criada com sucesso!"),
    onError: (error: Error) => handleMutationError(error, "criar ação"),
  });

  const updateAcaoMutation = useMutation({
    mutationFn: async ({ id, numero, descricao }: { id: string; numero: number; descricao: string }) => {
      ensureSchemaReady();
      const { error } = await supabase.from("acoes").update({ numero, descricao }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação atualizada!"),
    onError: (error: Error) => handleMutationError(error, "atualizar ação"),
  });

  const deleteAcaoMutation = useMutation({
    mutationFn: async (id: string) => {
      ensureSchemaReady();
      const { error } = await supabase.from("acoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidateAndToast("Ação excluída!"),
    onError: (error: Error) => handleMutationError(error, "excluir ação"),
  });

  const saving =
    createDiretrizMutation.isPending ||
    updateDiretrizMutation.isPending ||
    deleteDiretrizMutation.isPending ||
    createObjetivoMutation.isPending ||
    updateObjetivoMutation.isPending ||
    deleteObjetivoMutation.isPending ||
    createMetaMutation.isPending ||
    updateMetaMutation.isPending ||
    deleteMetaMutation.isPending ||
    createAcaoMutation.isPending ||
    updateAcaoMutation.isPending ||
    deleteAcaoMutation.isPending;

  return {
    diretrizes,
    loading: checkingSchema || loading,
    saving,
    refresh: refetch,
    createDiretriz: (numero: number, nome: string) => createDiretrizMutation.mutateAsync({ numero, nome }),
    updateDiretriz: (id: string, numero: number, nome: string) => updateDiretrizMutation.mutateAsync({ id, numero, nome }),
    deleteDiretriz: (id: string) => deleteDiretrizMutation.mutateAsync(id),
    createObjetivo: (diretrizId: string, numero: number, nome: string, descricao: string) =>
      createObjetivoMutation.mutateAsync({ diretrizId, numero, nome, descricao }),
    updateObjetivo: (id: string, numero: number, nome: string, descricao: string) =>
      updateObjetivoMutation.mutateAsync({ id, numero, nome, descricao }),
    deleteObjetivo: (id: string) => deleteObjetivoMutation.mutateAsync(id),
    createMeta: (meta: Omit<Meta, "id" | "acoes">) => createMetaMutation.mutateAsync(meta),
    updateMeta: (meta: Omit<Meta, "acoes">) => updateMetaMutation.mutateAsync(meta),
    deleteMeta: (id: string) => deleteMetaMutation.mutateAsync(id),
    createAcao: (metaId: string, numero: number, descricao: string) => createAcaoMutation.mutateAsync({ metaId, numero, descricao }),
    updateAcao: (id: string, numero: number, descricao: string) => updateAcaoMutation.mutateAsync({ id, numero, descricao }),
    deleteAcao: (id: string) => deleteAcaoMutation.mutateAsync(id),
  };
}
