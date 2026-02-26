import { useState, useEffect } from "react";
import { ChevronDown, Check, AlertTriangle, Clock, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HistoricoDialog } from "@/components/HistoricoDialog";

// Tipo flexível que aceita dados do banco ou estáticos
interface MetaType {
  id: string;
  numero: number;
  descricao: string;
  indicador: string;
  metaPlano2026?: string;
  meta_plano_2025?: string;
  unidadeMedida?: string;
  unidade_medida?: string;
  acoes: Array<{
    id: string;
    descricao: string;
  }>;
}

interface MetaAccordionProps {
  meta: MetaType;
  quadrimestre: 1 | 2 | 3;
  resultado: number | null;
  justificativa: string | null;
  isAcaoConcluida: (acaoId: string) => boolean;
  onSave: (metaId: string, quadrimestre: number, resultado: number | null, justificativa: string | null) => Promise<void>;
  onToggleAcao: (acaoId: string, metaId: string, concluida: boolean) => Promise<void>;
  saving: boolean;
  readOnly?: boolean;
}

const statusConfig = {
  atingida: {
    label: "Atingida",
    icon: Check,
    className: "badge-success",
  },
  parcial: {
    label: "Parcial",
    icon: Minus,
    className: "badge-warning",
  },
  abaixo: {
    label: "Abaixo",
    icon: AlertTriangle,
    className: "badge-danger",
  },
  pendente: {
    label: "Pendente",
    icon: Clock,
    className: "badge-info",
  },
};

function getStatus(resultado: number | null, metaValue: number): keyof typeof statusConfig {
  if (resultado === null) return "pendente";
  if (resultado >= metaValue) return "atingida";
  if (resultado >= metaValue * 0.8) return "parcial";
  return "abaixo";
}

export function MetaAccordion({
  meta,
  quadrimestre,
  resultado: initialResultado,
  justificativa: initialJustificativa,
  isAcaoConcluida,
  onSave,
  onToggleAcao,
  saving,
  readOnly = false
}: MetaAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resultado, setResultado] = useState<string>(
    initialResultado !== null ? String(initialResultado) : ""
  );
  const [justificativa, setJustificativa] = useState(initialJustificativa || "");

  // Atualizar estado local quando props mudam (ex: mudança de quadrimestre)
  useEffect(() => {
    setResultado(initialResultado !== null ? String(initialResultado) : "");
    setJustificativa(initialJustificativa || "");
  }, [initialResultado, initialJustificativa, quadrimestre]);

  const metaPlanoStr = meta.metaPlano2026 || meta.meta_plano_2025 || '0';
  const metaValue = parseFloat(String(metaPlanoStr).replace("%", "").replace(",", "."));
  const unidade = meta.unidadeMedida || meta.unidade_medida || '%';
  const currentResultado = resultado ? parseFloat(resultado) : null;
  const status = getStatus(currentResultado, metaValue);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const handleAcaoToggle = async (acaoId: string) => {
    const currentStatus = isAcaoConcluida(acaoId);
    await onToggleAcao(acaoId, meta.id, !currentStatus);
  };

  const handleSave = async () => {
    const numResult = resultado ? parseFloat(resultado) : null;
    await onSave(meta.id, quadrimestre, numResult, justificativa || null);
  };

  const acoesCompletas = meta.acoes.filter(a => isAcaoConcluida(a.id)).length;
  const acoesTotal = meta.acoes.length;

  return (
    <div className="card-elevated overflow-hidden animate-fade-in">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{meta.numero}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate pr-4">{meta.descricao}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">
              {acoesCompletas}/{acoesTotal} ações concluídas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("flex items-center gap-1.5", statusInfo.className)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-border animate-fade-in">
          <div className="grid gap-6 pt-6">
            {/* Meta Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-1">Indicador</p>
                <p className="text-foreground">{meta.indicador}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground mb-1">Meta do Plano</p>
                <p className="text-2xl font-bold text-primary">{metaPlanoStr}</p>
              </div>
            </div>

            {/* Resultado Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resultado Alcançado - {quadrimestre}º Quadrimestre
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  placeholder="Digite o resultado"
                  className="input-field max-w-xs"
                  disabled={readOnly || saving}
                />
                <span className="text-muted-foreground">{unidade}</span>
              </div>
            </div>

            {/* Ações Checklist */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Ações Vinculadas</p>
              <div className="space-y-2">
                {meta.acoes.map((acao) => {
                  const concluida = isAcaoConcluida(acao.id);
                  return (
                    <label
                      key={acao.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={concluida}
                        onCheckedChange={() => handleAcaoToggle(acao.id)}
                        className="mt-0.5"
                        disabled={saving || readOnly}
                      />
                      <span
                        className={cn(
                          "text-sm transition-all",
                          concluida ? "text-muted-foreground line-through" : "text-foreground"
                        )}
                      >
                        {acao.descricao}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Justificativa / Análise Qualitativa
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva as principais ações realizadas, dificuldades encontradas e próximos passos..."
                className="input-field min-h-[100px] resize-y"
                disabled={readOnly || saving}
              />
            </div>

            {/* Save Button and History */}
            <div className="flex items-center justify-between">
              <HistoricoDialog metaId={meta.id} metaNome={meta.descricao} />
              {!readOnly && (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
