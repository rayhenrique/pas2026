import { supabase } from "@/integrations/supabase/client";

export function normalizeSetorResponsavelNome(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function getSetorResponsavelKey(value: string | null | undefined): string {
  return normalizeSetorResponsavelNome(value || "").toLocaleLowerCase("pt-BR");
}

export function dedupeSetorResponsavelNomes(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (value ? normalizeSetorResponsavelNome(value) : ""))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export async function ensureSetoresResponsaveis(names: Array<string | null | undefined>) {
  const normalizedNames = dedupeSetorResponsavelNomes(names);

  if (normalizedNames.length === 0) {
    return;
  }

  const payload = normalizedNames.map((nome) => ({
    nome,
    nome_normalizado: getSetorResponsavelKey(nome),
    ativo: true,
  }));
  const { error } = await supabase
    .from("setores_responsaveis")
    .upsert(payload, { onConflict: "nome_normalizado" });

  if (error) {
    throw error;
  }
}
