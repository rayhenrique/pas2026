import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ensureSetoresResponsaveis,
  getSetorResponsavelKey,
  normalizeSetorResponsavelNome,
} from "@/utils/setoresResponsaveis";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type ResponsavelSector = Tables<"setores_responsaveis"> & {
  metasCount: number;
  usersCount: number;
};

const RESPONSAVEL_SECTORS_KEY = ["responsavel-sectors"];

interface UseResponsavelSectorsOptions {
  includeInactive?: boolean;
}

async function fetchResponsavelSectors(includeInactive: boolean): Promise<ResponsavelSector[]> {
  const [sectorsRes, metasRes, profilesRes] = await Promise.all([
    (includeInactive
      ? supabase.from("setores_responsaveis").select("*")
      : supabase.from("setores_responsaveis").select("*").eq("ativo", true)
    ).order("nome"),
    supabase.from("metas").select("id, responsavel"),
    supabase.from("profiles").select("id, setor"),
  ]);

  if (sectorsRes.error) throw sectorsRes.error;
  if (metasRes.error) throw metasRes.error;
  if (profilesRes.error) throw profilesRes.error;

  return (sectorsRes.data || []).map((sector) => {
    const metasCount = (metasRes.data || []).filter(
      (meta) => getSetorResponsavelKey(meta.responsavel) === sector.nome_normalizado,
    ).length;
    const usersCount = (profilesRes.data || []).filter(
      (profile) => getSetorResponsavelKey(profile.setor) === sector.nome_normalizado,
    ).length;

    return {
      ...sector,
      metasCount,
      usersCount,
    };
  });
}

export function useResponsavelSectors(options: UseResponsavelSectorsOptions = {}) {
  const { includeInactive = false } = options;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: sectors = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: [...RESPONSAVEL_SECTORS_KEY, user?.id, includeInactive ? "all" : "active"],
    queryFn: () => fetchResponsavelSectors(includeInactive),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: RESPONSAVEL_SECTORS_KEY }),
      queryClient.invalidateQueries({ queryKey: ["pas-data", "annual-structure"] }),
      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] }),
    ]);
  };

  const createSectorMutation = useMutation({
    mutationFn: async (nome: string) => {
      const normalizedName = normalizeSetorResponsavelNome(nome);
      if (!normalizedName) {
        throw new Error("Informe o nome do setor responsável.");
      }

      await ensureSetoresResponsaveis([normalizedName]);
    },
    onSuccess: async () => {
      await invalidateAll();
      toast({ title: "Setor responsável criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar setor responsável",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSectorMutation = useMutation({
    mutationFn: async ({
      id,
      currentName,
      nome,
      ativo,
      metasCount,
      usersCount,
    }: {
      id: string;
      currentName: string;
      nome: string;
      ativo: boolean;
      metasCount: number;
      usersCount: number;
    }) => {
      const normalizedCurrentName = normalizeSetorResponsavelNome(currentName);
      const normalizedNewName = normalizeSetorResponsavelNome(nome);

      if (!normalizedNewName) {
        throw new Error("Informe o nome do setor responsável.");
      }

      if (!ativo && (metasCount > 0 || usersCount > 0)) {
        throw new Error(
          "Esse setor está vinculado a metas ou usuários. Reatribua esses vínculos antes de inativá-lo.",
        );
      }

      const { error: sectorError } = await supabase
        .from("setores_responsaveis")
        .update({
          nome: normalizedNewName,
          nome_normalizado: getSetorResponsavelKey(normalizedNewName),
          ativo,
        })
        .eq("id", id);

      if (sectorError) throw sectorError;

      if (normalizedCurrentName !== normalizedNewName) {
        const { error: renameError } = await supabase.rpc("rename_setor_responsavel_references", {
          current_normalized_name: getSetorResponsavelKey(normalizedCurrentName),
          new_display_name: normalizedNewName,
        });

        if (renameError) throw renameError;
      }
    },
    onSuccess: async () => {
      await invalidateAll();
      toast({ title: "Setor responsável atualizado!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar setor responsável",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSectorMutation = useMutation({
    mutationFn: async ({
      id,
      ativo,
      metasCount,
      usersCount,
    }: {
      id: string;
      ativo: boolean;
      metasCount: number;
      usersCount: number;
    }) => {
      if (!ativo && (metasCount > 0 || usersCount > 0)) {
        throw new Error(
          "Esse setor está vinculado a metas ou usuários. Reatribua esses vínculos antes de inativá-lo.",
        );
      }

      const { error } = await supabase
        .from("setores_responsaveis")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: async (_, variables) => {
      await invalidateAll();
      toast({
        title: variables.ativo ? "Setor responsável ativado!" : "Setor responsável inativado!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao alterar status do setor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSectorMutation = useMutation({
    mutationFn: async ({
      id,
      metasCount,
      usersCount,
    }: {
      id: string;
      metasCount: number;
      usersCount: number;
    }) => {
      if (metasCount > 0 || usersCount > 0) {
        throw new Error(
          "Esse setor está vinculado a metas ou usuários. Reatribua esses vínculos antes de excluí-lo.",
        );
      }

      const { error } = await supabase.from("setores_responsaveis").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await invalidateAll();
      toast({ title: "Setor responsável excluído!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir setor responsável",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    sectors,
    loading,
    saving:
      createSectorMutation.isPending ||
      updateSectorMutation.isPending ||
      toggleSectorMutation.isPending ||
      deleteSectorMutation.isPending,
    refresh: refetch,
    createSector: (nome: string) => createSectorMutation.mutateAsync(nome),
    updateSector: (payload: {
      id: string;
      currentName: string;
      nome: string;
      ativo: boolean;
      metasCount: number;
      usersCount: number;
    }) =>
      updateSectorMutation.mutateAsync(payload),
    toggleSector: (payload: { id: string; ativo: boolean; metasCount: number; usersCount: number }) =>
      toggleSectorMutation.mutateAsync(payload),
    deleteSector: (payload: { id: string; metasCount: number; usersCount: number }) =>
      deleteSectorMutation.mutateAsync(payload),
  };
}
