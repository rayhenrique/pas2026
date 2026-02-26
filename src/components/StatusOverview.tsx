import { CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { usePasData } from "@/hooks/usePasData";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { cn } from "@/lib/utils";

interface Lancamento {
  id: string;
  meta_id: string;
  quadrimestre: number;
  ano: number;
  resultado: number | null;
}

interface StatusOverviewProps {
  lancamentos?: Lancamento[];
}

export function StatusOverview({ lancamentos = [] }: StatusOverviewProps) {
  const { eixos } = usePasData();
  const { settings } = useAppSettings();
  const currentYear = settings?.current_year || 2026;

  // Get current month to determine expected progress
  const currentMonth = new Date().getMonth() + 1;
  const currentQuarter = currentMonth <= 4 ? 1 : currentMonth <= 8 ? 2 : 3;

  // Helper para obter resultado do banco (sem fallback para dados estáticos)
  const getResultado = (metaId: string, quad: number) => {
    const lancamento = lancamentos.find(
      l => l.meta_id === metaId && l.quadrimestre === quad
    );
    return lancamento?.resultado ?? null;
  };

  const getMetaStatus = (metaId: string, metaPlano: string) => {
    const resultado2 = getResultado(metaId, 2);
    const resultado1 = getResultado(metaId, 1);
    const resultado = resultado2 ?? resultado1;
    
    // Se não tem resultado lançado, está pendente
    if (resultado === null || resultado === undefined) return 'pending';
    
    const metaValue = parseFloat(String(metaPlano).replace('%', '').replace(',', '.'));
    
    if (resultado >= metaValue) return 'atingida';
    if (resultado >= metaValue * 0.8) return 'parcial';
    return 'abaixo';
  };

  // Calculate overall status
  let onTrack = 0;
  let behind = 0;
  let pending = 0;

  eixos.forEach(eixo => {
    eixo.diretrizes.forEach(diretriz => {
      diretriz.metas.forEach(meta => {
        const metaPlano = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
        const status = getMetaStatus(meta.id, metaPlano);
        if (status === 'atingida' || status === 'parcial') onTrack++;
        else if (status === 'abaixo') behind++;
        else pending++;
      });
    });
  });

  const total = onTrack + behind + pending;
  const percentOnTrack = total > 0 ? Math.round((onTrack / total) * 100) : 0;

  const statusItems = [
    {
      label: "No Prazo",
      count: onTrack,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Atrasado",
      count: behind,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Pendente",
      count: pending,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Status Geral</h3>
          <p className="text-sm text-muted-foreground">
            {currentQuarter}º Quadrimestre de {currentYear}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{percentOnTrack}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {total > 0 ? (
            <>
              <div 
                className="h-full bg-success transition-all duration-500"
                style={{ width: `${(onTrack / total) * 100}%` }}
              />
              <div 
                className="h-full bg-destructive transition-all duration-500"
                style={{ width: `${(behind / total) * 100}%` }}
              />
              <div 
                className="h-full bg-warning transition-all duration-500"
                style={{ width: `${(pending / total) * 100}%` }}
              />
            </>
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
      </div>

      {/* Status Items */}
      <div className="space-y-3">
        {statusItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", item.bgColor)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <span className="font-medium text-foreground">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{item.count}</span>
              <span className="text-sm text-muted-foreground">metas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
