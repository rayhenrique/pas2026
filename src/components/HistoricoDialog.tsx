import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock3, FileText, History, User2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistorico } from "@/hooks/useHistorico";
import { STATUS_LABELS } from "@/utils/pasHelpers";

interface HistoricoDialogProps {
  metaId: string;
  metaNome: string;
}

const statusBadgeClass: Record<keyof typeof STATUS_LABELS, string> = {
  otimo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  bom: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  suficiente: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  regular: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  nao_alcancado: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  nao_avaliado: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  sem_criterio: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

export function HistoricoDialog({ metaId, metaNome }: HistoricoDialogProps) {
  const [open, setOpen] = useState(false);
  const { historico, loading } = useHistorico(open ? metaId : undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <History className="h-4 w-4" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Evolução Anual da Meta
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{metaNome}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <History className="mb-4 h-10 w-10 opacity-40" />
              <p className="font-medium">Nenhuma avaliação anual registrada</p>
              <p className="text-sm">Os lançamentos aparecerão aqui conforme forem salvos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.ano_referencia}</Badge>
                      <Badge variant="outline" className={statusBadgeClass[item.status_atingimento]}>
                        {STATUS_LABELS[item.status_atingimento]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {format(new Date(item.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Valor realizado
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {item.valor_realizado ?? "-"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Responsável pelo lançamento
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                        <User2 className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {item.perfil_alterador?.nome ||
                            item.perfil_alterador?.email ||
                            "Usuário não identificado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg bg-muted/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Análise qualitativa
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.analise_qualitativa || "Nenhuma análise registrada para este ano."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
