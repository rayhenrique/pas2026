import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, Clock, User, FileText, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHistorico } from "@/hooks/useHistorico";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoricoDialogProps {
  metaId: string;
  metaNome: string;
  ano?: number;
}

export function HistoricoDialog({ metaId, metaNome, ano = 2025 }: HistoricoDialogProps) {
  const [open, setOpen] = useState(false);
  const { historico, loading } = useHistorico(open ? metaId : undefined, ano);

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case "INSERT":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Criação</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">Atualização</Badge>;
      case "DELETE":
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Exclusão</Badge>;
      default:
        return <Badge variant="outline">{acao}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <History className="h-4 w-4" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Alterações
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{metaNome}</p>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma alteração registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    {getAcaoBadge(item.acao)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(item.alterado_em)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-foreground">
                        {item.perfil_alterador?.nome || item.perfil_alterador?.email || "Usuário desconhecido"}
                      </span>
                    </div>

                    {(item.perfil_alterador?.cargo || item.perfil_alterador?.setor) && (
                      <div className="ml-6 text-xs text-muted-foreground/80 flex flex-wrap gap-x-2">
                        {item.perfil_alterador?.cargo && (
                          <span>{item.perfil_alterador.cargo}</span>
                        )}
                        {item.perfil_alterador?.cargo && item.perfil_alterador?.setor && (
                          <span>•</span>
                        )}
                        {item.perfil_alterador?.setor && (
                          <span>{item.perfil_alterador.setor}</span>
                        )}
                      </div>
                    )}

                    <div className="ml-6 text-xs text-muted-foreground/60">
                      Quadrimestre {item.quadrimestre}
                    </div>
                  </div>

                  {item.acao === "UPDATE" && (
                    <div className="space-y-2">
                      {item.resultado_anterior !== item.resultado_novo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Resultado:</span>
                          <span className="text-muted-foreground">
                            {item.resultado_anterior ?? "—"}
                          </span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-foreground font-medium">
                            {item.resultado_novo ?? "—"}
                          </span>
                        </div>
                      )}
                      {item.justificativa_anterior !== item.justificativa_nova && (
                        <div className="text-sm">
                          <span className="font-medium flex items-center gap-1 mb-1">
                            <FileText className="h-3 w-3" />
                            Justificativa alterada:
                          </span>
                          {item.justificativa_anterior && (
                            <p className="text-muted-foreground text-xs line-through mb-1">
                              {item.justificativa_anterior}
                            </p>
                          )}
                          {item.justificativa_nova && (
                            <p className="text-foreground text-xs">{item.justificativa_nova}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {item.acao === "INSERT" && (
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Resultado inicial:</span>{" "}
                        {item.resultado_novo ?? "—"}
                      </p>
                      {item.justificativa_nova && (
                        <p className="text-muted-foreground text-xs">
                          {item.justificativa_nova}
                        </p>
                      )}
                    </div>
                  )}

                  {item.acao === "DELETE" && (
                    <div className="text-sm text-red-600">
                      <p>
                        Resultado removido: {item.resultado_anterior ?? "—"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
