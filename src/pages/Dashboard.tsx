import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ListTodo,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layout } from "@/components/Layout";
import { AnnualSchemaAlert } from "@/components/AnnualSchemaAlert";
import { ProgressChart } from "@/components/ProgressChart";
import { ResponsavelScopeAlert } from "@/components/ResponsavelScopeAlert";
import { StatCard } from "@/components/StatCard";
import { StatusOverview } from "@/components/StatusOverview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedYear } from "@/contexts/SelectedYearContext";
import { pasData } from "@/data/pasData";
import { useLancamentos } from "@/hooks/useLancamentos";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { usePasData } from "@/hooks/usePasData";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { YEAR_OPTIONS } from "@/types/pas";
import {
  STATUS_LABELS,
  flattenMetas,
  formatTargetValue,
  getAvailableResponsaveis,
  getMetaStatus,
  getMetaTarget,
  parseNumericValue,
} from "@/utils/pasHelpers";

interface EvolucaoAvaliacao {
  meta_id: string;
  ano_referencia: (typeof YEAR_OPTIONS)[number];
  valor_realizado: number | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedYear } = useSelectedYear();
  const { schemaReady, schemaMessage, missingTargets, migrationName } = useAnnualSchemaStatus();
  const { diretrizes: diretrizesBanco, loading: pasLoading } = usePasData();
  const { acoesStatus, loading: lancamentosLoading, getAvaliacao } = useLancamentos();
  const { isAdmin, isSuperadmin, isGestor, loading: roleLoading } = useUserRole();
  const { profile, loading: profileLoading } = useCurrentUserProfile();

  const [selectedResponsavel, setSelectedResponsavel] = useState<string>("all");
  const [selectedMetaId, setSelectedMetaId] = useState<string>("all");

  const diretrizes = schemaReady ? diretrizesBanco : pasData;
  const restrictToOwnResponsavel = !isAdmin && !isSuperadmin;
  const responsavelVinculado = profile?.setor?.trim() || null;
  const missingResponsavelAssignment = restrictToOwnResponsavel && !responsavelVinculado;
  const effectiveResponsavelFilter = restrictToOwnResponsavel
    ? responsavelVinculado || "__missing_responsavel__"
    : selectedResponsavel;
  const loading = pasLoading || lancamentosLoading || roleLoading || profileLoading;

  const { data: evolucaoAvaliacoes = [] } = useQuery({
    queryKey: ["dashboard-evolucao-anual", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avaliacoes_anuais")
        .select("meta_id, ano_referencia, valor_realizado");

      if (error) throw error;
      return (data || []) as EvolucaoAvaliacao[];
    },
    enabled: !!user && schemaReady,
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const responsaveis = useMemo(() => getAvailableResponsaveis(diretrizes), [diretrizes]);
  const allMetas = useMemo(() => flattenMetas(diretrizes), [diretrizes]);
  const filteredMetas = useMemo(
    () =>
      allMetas.filter(
        (meta) => effectiveResponsavelFilter === "all" || meta.responsavel === effectiveResponsavelFilter,
      ),
    [allMetas, effectiveResponsavelFilter],
  );

  useEffect(() => {
    if (filteredMetas.length === 0) {
      setSelectedMetaId("all");
      return;
    }

    if (
      selectedMetaId === "all" ||
      !filteredMetas.some((meta) => meta.id === selectedMetaId)
    ) {
      setSelectedMetaId(filteredMetas[0].id);
    }
  }, [filteredMetas, selectedMetaId]);

  const totalMetas = filteredMetas.length;
  const metasAvaliadas = filteredMetas.filter((meta) => !!getAvaliacao(meta.id)).length;
  const totalAcoes = filteredMetas.reduce((sum, meta) => sum + meta.acoes.length, 0);
  const filteredMetaIds = new Set(filteredMetas.map((meta) => meta.id));
  const acoesConcluidas = acoesStatus.filter(
    (acaoStatus) => filteredMetaIds.has(acaoStatus.meta_id) && acaoStatus.concluida,
  ).length;

  const statusCounts = filteredMetas.reduce(
    (acc, meta) => {
      const status = getMetaStatus(meta, getAvaliacao(meta.id)?.valor_realizado ?? null);
      acc[status] += 1;
      return acc;
    },
    {
      otimo: 0,
      bom: 0,
      suficiente: 0,
      regular: 0,
      nao_alcancado: 0,
      nao_avaliado: 0,
      sem_criterio: 0,
    },
  );

  const progressData = diretrizes
    .map((diretriz) => {
      const metasDiretriz = filteredMetas.filter((meta) => meta.diretriz.id === diretriz.id);
      const avaliadas = metasDiretriz.filter((meta) => !!getAvaliacao(meta.id)).length;

      return {
        name: `D${diretriz.numero}`,
        avaliadas,
        pendentes: Math.max(metasDiretriz.length - avaliadas, 0),
        total: metasDiretriz.length,
      };
    })
    .filter((item) => item.total > 0);

  const selectedMeta = filteredMetas.find((meta) => meta.id === selectedMetaId) || null;

  const evolutionData = useMemo(() => {
    if (!selectedMeta) return [];

    return YEAR_OPTIONS.map((year) => {
      const avaliacao = evolucaoAvaliacoes.find(
        (item) => item.meta_id === selectedMeta.id && item.ano_referencia === year,
      );

      return {
        ano: String(year),
        alvo: parseNumericValue(getMetaTarget(selectedMeta, year)),
        realizado: avaliacao?.valor_realizado ?? null,
      };
    });
  }, [evolucaoAvaliacoes, selectedMeta]);

  const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59);
  const today = new Date();
  const daysUntilYearEnd = Math.max(
    0,
    Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {!schemaReady && schemaMessage && (
        <AnnualSchemaAlert
          message={schemaMessage}
          migrationName={migrationName}
          missingTargets={missingTargets}
        />
      )}
      {schemaReady && (
        <ResponsavelScopeAlert
          responsavel={responsavelVinculado}
          missingAssignment={missingResponsavelAssignment}
        />
      )}
      {schemaReady && diretrizesBanco.length === 0 && (
        <div className="mb-6 rounded-2xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
          O schema anual está disponível, mas ainda não existem diretrizes cadastradas neste banco.
          Importe o seed oficial em <span className="font-medium text-foreground">Gerenciar PAS</span> para começar.
        </div>
      )}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-header">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Executivo</h1>
            <p className="text-muted-foreground">
              Acompanhamento anual das metas do PMS 2026-2029, com foco no ano {selectedYear}.
            </p>
          </div>
        </div>

        {!restrictToOwnResponsavel && (
          <div className="w-full max-w-sm">
            <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os responsáveis</SelectItem>
                {responsaveis.map((responsavel) => (
                  <SelectItem key={responsavel} value={responsavel}>
                    {responsavel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Metas filtradas"
          value={totalMetas}
          subtitle="Escopo visível no dashboard"
          icon={Target}
          variant="primary"
        />
        <StatCard
          title="Avaliações lançadas"
          value={metasAvaliadas}
          subtitle={`${totalMetas > 0 ? Math.round((metasAvaliadas / totalMetas) * 100) : 0}% das metas`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Ações concluídas"
          value={`${acoesConcluidas}/${totalAcoes}`}
          subtitle="Checklist anual das ações"
          icon={ListTodo}
          variant="info"
        />
        <StatCard
          title="Encerramento anual"
          value={`${daysUntilYearEnd}d`}
          subtitle={`Até 31/12/${selectedYear}`}
          icon={CalendarDays}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        <ProgressChart data={progressData} selectedYear={selectedYear} />
        <StatusOverview counts={statusCounts} selectedYear={selectedYear} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {(isAdmin || isSuperadmin || isGestor) && (
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Evolução 2026-2029 por Meta
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare o alvo anual com o valor realizado ao longo dos quatro anos.
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <Select value={selectedMetaId} onValueChange={setSelectedMetaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma meta" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMetas.map((meta) => (
                      <SelectItem key={meta.id} value={meta.id}>
                        Meta {meta.numero} - {meta.descricao.slice(0, 70)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedMeta ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                  Nenhuma meta disponível para o filtro atual.
                </div>
              ) : (
                <>
                  <div className="mb-4 rounded-xl bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">{selectedMeta.descricao}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedMeta.responsavel} • Indicador: {selectedMeta.indicador}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Meta {selectedYear}:{" "}
                      <span className="font-semibold text-foreground">
                        {formatTargetValue(getMetaTarget(selectedMeta, selectedYear), selectedMeta.unidade_medida)}
                      </span>
                    </p>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="ano" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="alvo" name="Alvo anual" stroke="hsl(var(--primary))" strokeWidth={3} />
                        <Line type="monotone" dataKey="realizado" name="Realizado" stroke="hsl(var(--secondary))" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Resumo dos responsáveis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribuição atual das metas filtradas por área responsável.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {responsaveis.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                Nenhum responsável encontrado.
              </div>
            ) : (
              responsaveis.map((responsavel) => {
                const metasResponsavel = filteredMetas.filter((meta) => meta.responsavel === responsavel);
                const avaliadasResponsavel = metasResponsavel.filter((meta) => !!getAvaliacao(meta.id)).length;

                return (
                  <div key={responsavel} className="rounded-xl border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{responsavel}</p>
                        <p className="text-sm text-muted-foreground">
                          {avaliadasResponsavel}/{metasResponsavel.length} metas avaliadas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">{metasResponsavel.length}</p>
                        <p className="text-xs text-muted-foreground">metas</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Leitura rápida do ciclo anual</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {STATUS_LABELS.otimo}, {STATUS_LABELS.bom}, {STATUS_LABELS.suficiente}, {STATUS_LABELS.regular} e{" "}
          {STATUS_LABELS.nao_alcancado} são calculados automaticamente conforme os critérios da meta.
        </p>
      </div>
    </Layout>
  );
}
