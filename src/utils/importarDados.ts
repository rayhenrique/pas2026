import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { pasData } from "@/data/pasData";

export async function importarDadosParaBanco(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc("import_pas_tree", {
      tree_data: pasData as unknown as Json,
      replace_existing: true,
    });
    if (error) throw error;

    return {
      success: true,
      message: `Importação anual concluída. A estrutura foi resetada, os lançamentos anuais foram removidos e ${pasData.length} diretriz(es) foram importadas com sucesso.`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido durante a importação";
    console.error("Erro na importação anual:", error);
    return {
      success: false,
      message,
    };
  }
}
