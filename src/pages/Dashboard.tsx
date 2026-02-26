import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { ProgressChart } from "@/components/ProgressChart";
import { StatusOverview } from "@/components/StatusOverview";
import {
  Target,
  CheckCircle2,
  ListTodo,
  Calendar,
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react";
import { pasData } from "@/data/pasData";
import { useLancamentos } from "@/hooks/useLancamentos";
import { usePasData } from "@/hooks/usePasData";
import { useAppSettings } from "@/contexts/AppSettingsContext";

import {
  calculateTotalMetas,
  calculateMetasAtingidas,
  calculateAcoesStats,
  isMetaAtingida
} from "@/utils/calculations";

export default function Dashboard() {
  const { settings } = useAppSettings();
  const currentYear = settings?.current_year || 2026;

  const {
    loading: lancamentosLoading,
    lancamentos,
    acoesStatus,
    getResultado
  } = useLancamentos(currentYear);

  const { eixos: eixosBanco, loading: pasLoading } = usePasData();

  // Usa dados do banco se existirem, senão usa dados estáticos
  const dadosPas = eixosBanco.length > 0 ? eixosBanco : pasData;
  const loading = lancamentosLoading || pasLoading;

  // Calculate stats using utility functions
  const totalMetas = calculateTotalMetas(dadosPas);
  const metasAtingidas = calculateMetasAtingidas(dadosPas, currentYear, getResultado);

  const { total: acoesTotal, completed: acoesCompletas, pending: acoesPendentes } = calculateAcoesStats(dadosPas, acoesStatus);

  // Calculate days until next deadline (end of current quadrimester)
  // Quadrimestre: 1º (Jan-Abr), 2º (Mai-Ago), 3º (Set-Dez)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentQuarter = currentMonth <= 4 ? 1 : currentMonth <= 8 ? 2 : 3;

  // Data de fim do quadrimestre atual
  const quarterEndDates = [
    new Date(currentYear, 3, 30),  // 30 de Abril (mês 3 = abril, índice 0-based)
    new Date(currentYear, 7, 31),  // 31 de Agosto
    new Date(currentYear, 11, 31), // 31 de Dezembro
  ];
  const quarterEndDate = quarterEndDates[currentQuarter - 1];
  const daysUntilDeadline = Math.max(0, Math.ceil((quarterEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Dashboard Executivo
            </h1>
            <p className="text-muted-foreground">
              {settings?.slogan} {currentYear} - {settings?.municipality}/AL
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total de Metas"
          value={totalMetas}
          subtitle="No Plano Municipal"
          icon={Target}
          variant="primary"
        />
        <StatCard
          title="Metas Atingidas"
          value={metasAtingidas}
          subtitle={`${totalMetas > 0 ? Math.round((metasAtingidas / totalMetas) * 100) : 0}% do total`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Ações Realizadas"
          value={`${acoesCompletas}/${acoesTotal}`}
          subtitle={`${acoesPendentes} pendentes`}
          icon={ListTodo}
          variant="info"
        />
        <StatCard
          title="Próximo Prazo"
          value={`${daysUntilDeadline}d`}
          subtitle={`Fim do ${currentQuarter}º Quadrimestre`}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <ProgressChart lancamentos={lancamentos} />
        </div>
        <div>
          <StatusOverview lancamentos={lancamentos} />
        </div>
      </div>

      {/* Recent Activity / Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Eixos Overview */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Eixos Estratégicos</h3>
          <div className="space-y-4">
            {dadosPas.map((eixo) => {
              const totalMetasEixo = eixo.diretrizes.reduce(
                (acc, d) => acc + d.metas.length,
                0
              );
              const metasAtingidasEixo = eixo.diretrizes.reduce((acc, d) => {
                return acc + d.metas.filter(m => isMetaAtingida(m, currentYear, getResultado)).length;
              }, 0);
              const progress = totalMetasEixo > 0 ? Math.round((metasAtingidasEixo / totalMetasEixo) * 100) : 0;

              return (
                <div key={eixo.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{eixo.numero}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{eixo.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {eixo.diretrizes.length} diretriz(es) • {totalMetasEixo} metas
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Período</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-success" />
                <div>
                  <p className="font-medium text-foreground">Evolução Positiva</p>
                  <p className="text-sm text-muted-foreground">Metas com progresso no período</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-success">{lancamentos.length}</span>
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">Distribuição por Diretriz</p>
              <div className="grid grid-cols-2 gap-3">
                {dadosPas.flatMap(eixo =>
                  eixo.diretrizes.map(diretriz => (
                    <div key={diretriz.id} className="text-sm">
                      <p className="font-medium text-foreground truncate" title={diretriz.nome}>
                        {diretriz.nome.length > 25 ? diretriz.nome.substring(0, 25) + '...' : diretriz.nome}
                      </p>
                      <p className="text-muted-foreground">{diretriz.metas.length} metas</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg gradient-gold">
              <Calendar className="w-5 h-5 text-secondary-foreground" />
              <div>
                <p className="font-medium text-secondary-foreground">Período Atual</p>
                <p className="text-sm text-secondary-foreground/80">
                  {currentQuarter}º Quadrimestre de {currentYear}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
