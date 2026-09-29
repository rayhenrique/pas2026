import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardList, Loader2, Target } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HistoricoDialog } from "@/components/HistoricoDialog";
import { useSelectedYear } from "@/contexts/SelectedYearContext";
import { PasMeta } from "@/types/pas";
import {
  STATUS_LABELS,
  formatTargetValue,
  getMetaPas2026,
  getMetaPlan,
  getMetaStatus,
  getMetaTarget,
} from "@/utils/pasHelpers";

interface MetaAccordionProps {
  meta: PasMeta;
  valorRealizado: number | null;
  analiseQualitativa: string | null;
  isAcaoConcluida: (acaoId: string) => boolean;
  onSave: (meta: PasMeta, valorRealizado: number | null, analiseQualitativa: string | null) => Promise<void>;
  onToggleAcao: (acaoId: string, metaId: string, concluida: boolean) => Promise<void>;
  saving: boolean;
  readOnly?: boolean;
}

const statusClassNames = {
  otimo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  bom: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  suficiente: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  regular: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  nao_alcancado: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  nao_avaliado: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  sem_criterio: "bg-violet-500/10 text-violet-700 border-violet-500/20",
} as const;

export function MetaAccordion({
  meta,
  valorRealizado: initialValorRealizado,
  analiseQualitativa: initialAnaliseQualitativa,
  isAcaoConcluida,
  onSave,
  onToggleAcao,
  saving,
  readOnly = false,
}: MetaAccordionProps) {
  const { selectedYear } = useSelectedYear();
  const [valorRealizado, setValorRealizado] = useState(
    initialValorRealizado !== null && initialValorRealizado !== undefined
      ? String(initialValorRealizado)
      : "",
  );
  const [analiseQualitativa, setAnaliseQualitativa] = useState(initialAnaliseQualitativa || "");

  useEffect(() => {
    setValorRealizado(
      initialValorRealizado !== null && initialValorRealizado !== undefined
        ? String(initialValorRealizado)
        : "",
    );
    setAnaliseQualitativa(initialAnaliseQualitativa || "");
  }, [initialValorRealizado, initialAnaliseQualitativa, selectedYear]);

  const target = getMetaTarget(meta, selectedYear);
  const metaPlano = getMetaPlan(meta);
  const metaPas2026 = getMetaPas2026(meta);
  const acoesConcluidas = meta.acoes.filter((acao) => isAcaoConcluida(acao.id)).length;

  const status = useMemo(() => {
    const parsed = valorRealizado === "" ? null : Number.parseFloat(valorRealizado.replace(",", "."));
    return getMetaStatus(meta, Number.isNaN(parsed as number) ? null : parsed);
  }, [meta, valorRealizado]);

  const handleSave = async () => {
    const parsedValue =
      valorRealizado.trim() === "" ? null : Number.parseFloat(valorRealizado.replace(",", "."));

    await onSave(meta, Number.isNaN(parsedValue as number) ? null : parsedValue, analiseQualitativa || null);
  };

  const handleToggleAcao = async (acaoId: string) => {
    const concluida = isAcaoConcluida(acaoId);
    await onToggleAcao(acaoId, meta.id, !concluida);
  };

  return (
    <Accordion type="single" collapsible className="rounded-xl border bg-card">
      <AccordionItem value={meta.id} className="border-none">
        <AccordionTrigger className="px-4 py-4 hover:no-underline md:px-6">
          <div className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {meta.numero}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-medium text-foreground">{meta.descricao}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{meta.responsavel}</span>
                  <span className="hidden md:inline">•</span>
                  <span>
                    {acoesConcluidas}/{meta.acoes.length} ações concluídas
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusClassNames[status]}>
                {STATUS_LABELS[status]}
              </Badge>
              <Badge variant="secondary">
                Meta {selectedYear}: {formatTargetValue(target, meta.unidade_medida)}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t px-4 pb-5 pt-5 md:px-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <Target className="h-4 w-4 text-primary" />
                Alvos
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Meta do ano:{" "}
                  <span className="font-semibold text-foreground">
                    {formatTargetValue(target, meta.unidade_medida)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Meta do plano 2026-2029:{" "}
                  <span className="font-semibold text-foreground">
                    {formatTargetValue(metaPlano, meta.unidade_medida)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Meta PAS 2026:{" "}
                  <span className="font-semibold text-foreground">
                    {formatTargetValue(metaPas2026, meta.unidade_medida)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Unidade: <span className="font-semibold text-foreground">{meta.unidade_medida}</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-muted/30 p-4 lg:col-span-2">
              <p className="text-sm font-medium text-foreground">Indicador</p>
              <p className="mt-1 text-sm text-muted-foreground">{meta.indicador}</p>
              <p className="mt-4 text-sm font-medium text-foreground">Critérios de avaliação</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {meta.criterios_avaliacao || "Critérios não informados."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/10 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">Ações vinculadas</h4>
                </div>
                <div className="space-y-3">
                  {meta.acoes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma ação cadastrada para esta meta.</p>
                  ) : (
                    meta.acoes.map((acao) => {
                      const checked = isAcaoConcluida(acao.id);
                      return (
                        <label
                          key={acao.id}
                          className="flex items-start gap-3 rounded-lg border bg-background p-3"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggleAcao(acao.id)}
                            disabled={saving || readOnly}
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{acao.numero}</Badge>
                              {checked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            </div>
                            <p className="mt-1 text-sm text-foreground">{acao.descricao}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-xl border bg-muted/10 p-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Análise qualitativa de {selectedYear}
                </label>
                <Textarea
                  value={analiseQualitativa}
                  onChange={(event) => setAnaliseQualitativa(event.target.value)}
                  placeholder="Descreva o contexto, principais entregas, riscos e próximos passos."
                  className="min-h-[140px]"
                  disabled={readOnly || saving}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/10 p-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Valor realizado em {selectedYear}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    value={valorRealizado}
                    onChange={(event) => setValorRealizado(event.target.value)}
                    placeholder="Digite o valor realizado"
                    inputMode="decimal"
                    disabled={readOnly || saving}
                  />
                  <Badge variant="secondary" className="shrink-0">
                    {meta.unidade_medida}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  O status é calculado automaticamente a partir dos critérios da meta.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  Situação atual: <span className="font-semibold">{STATUS_LABELS[status]}</span>
                </div>
              </div>

              <div className="rounded-xl border bg-muted/10 p-4">
                <HistoricoDialog metaId={meta.id} metaNome={meta.descricao} />
              </div>

              {!readOnly && (
                <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Salvar avaliação anual
                </Button>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
