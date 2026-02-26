import { useState } from "react";
import { Layout } from "@/components/Layout";
import { MetaAccordion } from "@/components/MetaAccordion";
import { ClipboardEdit, Filter, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLancamentos } from "@/hooks/useLancamentos";
import { usePasData } from "@/hooks/usePasData";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useUserRole } from "@/hooks/useUserRole";

export default function Lancamento() {
  const { settings } = useAppSettings();
  const currentYear = settings?.current_year || 2026;

  const [quadrimestre, setQuadrimestre] = useState<1 | 2 | 3>(1);
  const [selectedEixo, setSelectedEixo] = useState<string>("all");

  const { eixos, loading: pasLoading } = usePasData();
  const {
    loading: lancamentosLoading,
    saving,
    saveLancamento,
    toggleAcaoStatus,
    getResultado,
    getJustificativa,
    isAcaoConcluida
  } = useLancamentos(currentYear);
  const { isGestor } = useUserRole();
  const isReadOnly = isGestor;

  const loading = pasLoading || lancamentosLoading;

  const filteredData = selectedEixo === "all"
    ? eixos
    : eixos.filter(eixo => eixo.id === selectedEixo);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
            <ClipboardEdit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Lançamento de Resultados
            </h1>
            <p className="text-muted-foreground">
              Registre os resultados alcançados por quadrimestre - {currentYear}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="w-full sm:w-48">
              <Select
                value={String(quadrimestre)}
                onValueChange={(value) => setQuadrimestre(Number(value) as 1 | 2 | 3)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Quadrimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Quadrimestre</SelectItem>
                  <SelectItem value="2">2º Quadrimestre</SelectItem>
                  <SelectItem value="3">3º Quadrimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-64">
              <Select
                value={selectedEixo}
                onValueChange={setSelectedEixo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Eixo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Eixos</SelectItem>
                  {eixos.map((eixo) => (
                    <SelectItem key={eixo.id} value={eixo.id}>
                      Eixo {eixo.numero} - {eixo.nome.substring(0, 30)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {saving && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Salvando...</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {
        loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : eixos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum eixo cadastrado. Acesse "Gerenciar PAS" para adicionar.
          </div>
        ) : (
          /* Content */
          <div className="space-y-8">
            {filteredData.map((eixo) => (
              <div key={eixo.id} className="space-y-4">
                {/* Eixo Header */}
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">{eixo.numero}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Eixo {eixo.numero}
                    </h2>
                    <p className="text-sm text-muted-foreground">{eixo.nome}</p>
                  </div>
                </div>

                {/* Diretrizes */}
                {eixo.diretrizes.map((diretriz) => (
                  <div key={diretriz.id} className="space-y-4">
                    <div className="pl-4 border-l-2 border-secondary">
                      <h3 className="font-medium text-foreground">
                        Diretriz {diretriz.numero}: {diretriz.nome}
                      </h3>
                      {(diretriz as any).objetivo && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {(diretriz as any).objetivo}
                        </p>
                      )}
                    </div>

                    {/* Metas */}
                    <div className="space-y-3 pl-4">
                      {diretriz.metas.map((meta) => (
                        <MetaAccordion
                          key={meta.id}
                          meta={meta}
                          quadrimestre={quadrimestre}
                          resultado={getResultado(meta.id, quadrimestre)}
                          justificativa={getJustificativa(meta.id, quadrimestre)}
                          isAcaoConcluida={isAcaoConcluida}
                          onSave={saveLancamento}
                          onToggleAcao={toggleAcaoStatus}
                          saving={saving}
                          readOnly={isReadOnly}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      }
    </Layout >
  );
}
