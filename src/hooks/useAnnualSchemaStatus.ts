import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ANNUAL_SCHEMA_MIGRATION =
  "migrations de 20260321120000 até 20260929164000";
const ANNUAL_SCHEMA_KEY = (userId?: string) => ["annual-schema-status", userId];

interface AnnualSchemaStatus {
  ready: boolean;
  message: string | null;
  missingTargets: string[];
  migrationName: string;
}

function getSchemaErrorMessage(target: string, error: { message?: string; code?: string } | null) {
  const code = error?.code ? ` (${error.code})` : "";
  return `${target}${code}: ${error?.message || "estrutura anual indisponível"}`;
}

async function probeAnnualSchema(): Promise<AnnualSchemaStatus> {
  const [objetivosRes, avaliacoesRes, acoesStatusRes, setoresRes] = await Promise.all([
    supabase.from("objetivos").select("id").limit(1),
    supabase.from("avaliacoes_anuais").select("id").limit(1),
    supabase.from("acoes_status").select("id, ano_referencia").limit(1),
    supabase.from("setores_responsaveis").select("id, nome_normalizado").limit(1),
  ]);

  const failures = [
    objetivosRes.error ? getSchemaErrorMessage("objetivos", objetivosRes.error) : null,
    avaliacoesRes.error ? getSchemaErrorMessage("avaliacoes_anuais", avaliacoesRes.error) : null,
    acoesStatusRes.error ? getSchemaErrorMessage("acoes_status.ano_referencia", acoesStatusRes.error) : null,
    setoresRes.error
      ? getSchemaErrorMessage("setores_responsaveis.nome_normalizado", setoresRes.error)
      : null,
  ].filter(Boolean) as string[];

  if (failures.length === 0) {
    return {
      ready: true,
      message: null,
      missingTargets: [],
      migrationName: ANNUAL_SCHEMA_MIGRATION,
    };
  }

  return {
    ready: false,
    message:
      "O banco Supabase ainda não recebeu o schema anual PMS 2026-2029. " +
      `Aplique a migration ${ANNUAL_SCHEMA_MIGRATION} e recarregue a aplicação.`,
    missingTargets: failures,
    migrationName: ANNUAL_SCHEMA_MIGRATION,
  };
}

export function useAnnualSchemaStatus() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ANNUAL_SCHEMA_KEY(user?.id),
    queryFn: probeAnnualSchema,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    schemaReady: data?.ready ?? false,
    checkingSchema: authLoading || (!!user && isLoading),
    schemaMessage: data?.message ?? null,
    missingTargets: data?.missingTargets ?? [],
    migrationName: data?.migrationName ?? ANNUAL_SCHEMA_MIGRATION,
  };
}
