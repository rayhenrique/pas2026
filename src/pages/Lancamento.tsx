import { useMemo, useState } from "react";
import { ClipboardEdit, Filter, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnnualSchemaAlert } from "@/components/AnnualSchemaAlert";
import { MetaAccordion } from "@/components/MetaAccordion";
import { ResponsavelScopeAlert } from "@/components/ResponsavelScopeAlert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLancamentos } from "@/hooks/useLancamentos";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { usePasData } from "@/hooks/usePasData";
import { useSelectedYear } from "@/contexts/SelectedYearContext";
import { useUserRole } from "@/hooks/useUserRole";
import { pasData } from "@/data/pasData";
import { getAvailableResponsaveis } from "@/utils/pasHelpers";

export default function Lancamento() {
  const { selectedYear } = useSelectedYear();
  const { schemaReady, schemaMessage, missingTargets, migrationName } = useAnnualSchemaStatus();
  const [selectedDiretriz, setSelectedDiretriz] = useState<string>("all");
  const [selectedResponsavel, setSelectedResponsavel] = useState<string>("all");
  const { profile, loading: profileLoading } = useCurrentUserProfile();

  const { diretrizes: diretrizesBanco, loading: pasLoading } = usePasData();
  const {
    loading: lancamentosLoading,
    saving,
    saveLancamento,
    toggleAcaoStatus,
    getResultado,
    getAnaliseQualitativa,
    isAcaoConcluida,
  } = useLancamentos();
  const { isGestor, isAdmin, isSuperadmin, loading: roleLoading } = useUserRole();

  const diretrizes = schemaReady ? diretrizesBanco : pasData;
  const responsaveis = useMemo(() => getAvailableResponsaveis(diretrizes), [diretrizes]);
  const restrictToOwnResponsavel = !isAdmin && !isSuperadmin;
  const responsavelVinculado = profile?.setor?.trim() || null;
  const missingResponsavelAssignment = restrictToOwnResponsavel && !responsavelVinculado;
  const effectiveResponsavelFilter = restrictToOwnResponsavel
    ? responsavelVinculado || "__missing_responsavel__"
    : selectedResponsavel;
  const loading = pasLoading || lancamentosLoading || roleLoading || profileLoading;

  const filteredDiretrizes = useMemo(() => {
    return diretrizes
      .filter((diretriz) => selectedDiretriz === "all" || diretriz.id === selectedDiretriz)
      .map((diretriz) => ({
        ...diretriz,
        objetivos: diretriz.objetivos
          .map((objetivo) => ({
            ...objetivo,
            metas: objetivo.metas.filter(
              (meta) => effectiveResponsavelFilter === "all" || meta.responsavel === effectiveResponsavelFilter,
            ),
          }))
          .filter((objetivo) => objetivo.metas.length > 0),
      }))
      .filter((diretriz) => diretriz.objetivos.length > 0);
  }, [diretrizes, effectiveResponsavelFilter, selectedDiretriz]);

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
          Nenhuma meta foi importada neste ambiente ainda. Vá em{" "}
          <span className="font-medium text-foreground">Gerenciar PAS</span> e importe o seed oficial
          antes de lançar avaliações ou marcar ações.
        </div>
      )}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
            <ClipboardEdit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Lançamento de Avaliações
            </h1>
            <p className="text-muted-foreground">
              Preencha os resultados e ações concluídas referentes ao ano {selectedYear}.
            </p>
          </div>
        </div>
      </div>

      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros</span>
          </div>

          <div className={`grid flex-1 gap-4 ${restrictToOwnResponsavel ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
            <Select value={selectedDiretriz} onValueChange={setSelectedDiretriz}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a diretriz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as diretrizes</SelectItem>
                {diretrizes.map((diretriz) => (
                  <SelectItem key={diretriz.id} value={diretriz.id}>
                    Diretriz {diretriz.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!restrictToOwnResponsavel && (
              <Select value={selectedResponsavel} onValueChange={setSelectedResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
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
            )}
          </div>

          {saving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando alterações...
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDiretrizes.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center text-muted-foreground">
          Nenhuma meta encontrada para os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-8">
          {filteredDiretrizes.map((diretriz) => (
            <section key={diretriz.id} className="space-y-4">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">Diretriz {diretriz.numero}</p>
                    <h2 className="text-xl font-semibold text-foreground">{diretriz.nome}</h2>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {diretriz.objetivos.reduce((count, objetivo) => count + objetivo.metas.length, 0)} meta(s)
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {diretriz.objetivos.map((objetivo) => (
                  <div key={objetivo.id} className="space-y-3">
                    <div className="rounded-xl border-l-4 border-l-primary bg-muted/20 p-4">
                      <p className="text-sm font-medium text-primary">
                        Objetivo {diretriz.numero}.{objetivo.numero}
                      </p>
                      <h3 className="font-semibold text-foreground">{objetivo.nome}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{objetivo.descricao}</p>
                    </div>

                    <div className="space-y-3">
                      {objetivo.metas.map((meta) => (
                        <MetaAccordion
                          key={meta.id}
                          meta={meta}
                          valorRealizado={getResultado(meta.id)}
                          analiseQualitativa={getAnaliseQualitativa(meta.id)}
                          isAcaoConcluida={isAcaoConcluida}
                          onSave={saveLancamento}
                          onToggleAcao={toggleAcaoStatus}
                          saving={saving}
                          readOnly={isGestor}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}
