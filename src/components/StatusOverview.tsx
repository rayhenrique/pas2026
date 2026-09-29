import { CheckCircle2, CircleDashed, CircleHelp, Clock3, Gauge, TriangleAlert, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusAtingimento } from "@/types/pas";
import { STATUS_LABELS } from "@/utils/pasHelpers";

interface StatusOverviewProps {
  counts: Record<StatusAtingimento, number>;
  selectedYear: number;
}

export function StatusOverview({ counts, selectedYear }: StatusOverviewProps) {
  const total =
    counts.otimo +
    counts.bom +
    counts.suficiente +
    counts.regular +
    counts.nao_alcancado +
    counts.nao_avaliado +
    counts.sem_criterio;

  const avaliadas = total - counts.nao_avaliado - counts.sem_criterio;
  const percentAvaliadas = total > 0 ? Math.round((avaliadas / total) * 100) : 0;

  const items = [
    {
      key: "otimo" as const,
      icon: Trophy,
      color: "text-emerald-700",
      bgColor: "bg-emerald-500/10",
    },
    {
      key: "bom" as const,
      icon: CheckCircle2,
      color: "text-sky-700",
      bgColor: "bg-sky-500/10",
    },
    {
      key: "suficiente" as const,
      icon: Gauge,
      color: "text-amber-700",
      bgColor: "bg-amber-500/10",
    },
    {
      key: "regular" as const,
      icon: TriangleAlert,
      color: "text-orange-700",
      bgColor: "bg-orange-500/10",
    },
    {
      key: "nao_alcancado" as const,
      icon: Clock3,
      color: "text-rose-700",
      bgColor: "bg-rose-500/10",
    },
    {
      key: "nao_avaliado" as const,
      icon: CircleDashed,
      color: "text-slate-700",
      bgColor: "bg-slate-500/10",
    },
    {
      key: "sem_criterio" as const,
      icon: CircleHelp,
      color: "text-violet-700",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <div className="card-elevated p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Status Geral</h3>
          <p className="text-sm text-muted-foreground">Consolidação anual de {selectedYear}</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          {percentAvaliadas}% avaliadas
        </div>
      </div>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-muted">
        <div className="flex h-full">
          {items.map((item) => {
            const width = total > 0 ? (counts[item.key] / total) * 100 : 0;
            return (
              <div
                key={item.key}
                className={cn(
                  item.key === "otimo" && "bg-emerald-500",
                  item.key === "bom" && "bg-sky-500",
                  item.key === "suficiente" && "bg-amber-500",
                  item.key === "regular" && "bg-orange-500",
                  item.key === "nao_alcancado" && "bg-rose-500",
                  item.key === "nao_avaliado" && "bg-slate-500",
                  item.key === "sem_criterio" && "bg-violet-500",
                )}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-xl bg-muted/30 p-3"
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg p-2", item.bgColor)}>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </div>
              <span className="font-medium text-foreground">{STATUS_LABELS[item.key]}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{counts[item.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
