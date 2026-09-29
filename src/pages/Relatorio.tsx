import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnnualSchemaAlert } from "@/components/AnnualSchemaAlert";
import { ResponsavelScopeAlert } from "@/components/ResponsavelScopeAlert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelectedYear } from "@/contexts/SelectedYearContext";
import { pasData } from "@/data/pasData";
import { useLancamentos } from "@/hooks/useLancamentos";
import { useAnnualSchemaStatus } from "@/hooks/useAnnualSchemaStatus";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { usePasData } from "@/hooks/usePasData";
import { useUserRole } from "@/hooks/useUserRole";
import { StatusAtingimento } from "@/types/pas";
import { saveFileWithPicker } from "@/utils/fileExport";
import {
  STATUS_LABELS,
  flattenMetas,
  formatTargetValue,
  getAvailableResponsaveis,
  getMetaTarget,
  getMetaStatus,
} from "@/utils/pasHelpers";

const statusClassNames: Record<StatusAtingimento, string> = {
  otimo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  bom: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  suficiente: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  regular: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  nao_alcancado: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  nao_avaliado: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  sem_criterio: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

export default function Relatorio() {
  const { selectedYear } = useSelectedYear();
  const { schemaReady, schemaMessage, missingTargets, migrationName } = useAnnualSchemaStatus();
  const [selectedDiretriz, setSelectedDiretriz] = useState("all");
  const [selectedResponsavel, setSelectedResponsavel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const { profile, loading: profileLoading } = useCurrentUserProfile();
  const { isAdmin, isSuperadmin, loading: roleLoading } = useUserRole();

  const { diretrizes: diretrizesBanco, loading: pasLoading } = usePasData();
  const { loading: lancamentosLoading, getAvaliacao, getResultado, getAnaliseQualitativa } =
    useLancamentos();

  const diretrizes = schemaReady ? diretrizesBanco : pasData;
  const restrictToOwnResponsavel = !isAdmin && !isSuperadmin;
  const responsavelVinculado = profile?.setor?.trim() || null;
  const missingResponsavelAssignment = restrictToOwnResponsavel && !responsavelVinculado;
  const effectiveResponsavelFilter = restrictToOwnResponsavel
    ? responsavelVinculado || "__missing_responsavel__"
    : selectedResponsavel;
  const loading = pasLoading || lancamentosLoading || roleLoading || profileLoading;
  const responsaveis = useMemo(() => getAvailableResponsaveis(diretrizes), [diretrizes]);
  const rows = useMemo(
    () =>
      flattenMetas(diretrizes)
        .filter(
          (meta) =>
            (selectedDiretriz === "all" || meta.diretriz.id === selectedDiretriz) &&
            (effectiveResponsavelFilter === "all" || meta.responsavel === effectiveResponsavelFilter),
        )
        .filter((meta) => {
          const status = getMetaStatus(meta, getAvaliacao(meta.id)?.valor_realizado ?? null);
          return selectedStatus === "all" || status === selectedStatus;
        }),
    [diretrizes, effectiveResponsavelFilter, getAvaliacao, selectedDiretriz, selectedStatus],
  );

  const exportToPDF = async () => {
    setExporting(true);

    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const tableBody = rows.map((meta) => {
        const avaliacao = getAvaliacao(meta.id);
        const status = getMetaStatus(meta, avaliacao?.valor_realizado ?? null);

        return [
          `D${meta.diretriz.numero}`,
          `O${meta.diretriz.numero}.${meta.objetivo.numero}`,
          meta.numero,
          meta.descricao.slice(0, 60),
          meta.responsavel,
          formatTargetValue(getMetaTarget(meta, selectedYear), meta.unidade_medida),
          avaliacao?.valor_realizado ?? "-",
          STATUS_LABELS[status],
          (getAnaliseQualitativa(meta.id) || "").slice(0, 50),
        ];
      });

      doc.setFontSize(16);
      doc.text(`Relatório anual PMS ${selectedYear}`, 14, 16);
      doc.setFontSize(10);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [[
          "Diretriz",
          "Objetivo",
          "Meta",
          "Descrição",
          "Responsável",
          `Alvo ${selectedYear}`,
          "Realizado",
          "Status",
          "Análise",
        ]],
        body: tableBody,
        theme: "striped",
        headStyles: { fillColor: [12, 74, 110] },
        bodyStyles: { fontSize: 7.5 },
      });

      const blob = await doc.output("blob");
      await saveFileWithPicker(
        blob,
        `relatorio-pms-${selectedYear}.pdf`,
        "application/pdf",
        [".pdf"],
      );
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = async () => {
    const headers = [
      "Diretriz",
      "Objetivo",
      "Meta",
      "Descricao",
      "Responsavel",
      `Alvo_${selectedYear}`,
      "Realizado",
      "Status",
      "Analise",
    ];

    const content = [
      headers.join(";"),
      ...rows.map((meta) => {
        const avaliacao = getAvaliacao(meta.id);
        const status = getMetaStatus(meta, avaliacao?.valor_realizado ?? null);

        return [
          `Diretriz ${meta.diretriz.numero}`,
          `Objetivo ${meta.diretriz.numero}.${meta.objetivo.numero}`,
          meta.numero,
          `"${meta.descricao.replace(/"/g, '""')}"`,
          `"${meta.responsavel.replace(/"/g, '""')}"`,
          `"${formatTargetValue(getMetaTarget(meta, selectedYear), meta.unidade_medida)}"`,
          avaliacao?.valor_realizado ?? "",
          `"${STATUS_LABELS[status]}"`,
          `"${(getAnaliseQualitativa(meta.id) || "").replace(/"/g, '""')}"`,
        ].join(";");
      }),
    ].join("\n");

    await saveFileWithPicker(
      `\uFEFF${content}`,
      `relatorio-pms-${selectedYear}.csv`,
      "text/csv",
      [".csv"],
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
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
          Não há dados anuais cadastrados neste banco ainda. Importe o seed oficial em{" "}
          <span className="font-medium text-foreground">Gerenciar PAS</span> para gerar relatórios.
        </div>
      )}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Relatório Consolidado</h1>
          <p className="text-muted-foreground">
            Visão anual das metas, resultados, responsáveis e análises qualitativas.
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={exporting} className="gap-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros</span>
          </div>

          <div className={`grid flex-1 gap-4 ${restrictToOwnResponsavel ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            <Select value={selectedDiretriz} onValueChange={setSelectedDiretriz}>
              <SelectTrigger>
                <SelectValue placeholder="Diretriz" />
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
                  <SelectValue placeholder="Responsável" />
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {rows.length} meta(s) encontrada(s)
          </div>
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Diretriz</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead className="min-w-[320px]">Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-center">Alvo {selectedYear}</TableHead>
                <TableHead className="text-center">Realizado</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="min-w-[260px]">Análise qualitativa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    Nenhuma meta encontrada com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((meta) => {
                  const avaliacao = getAvaliacao(meta.id);
                  const status = getMetaStatus(meta, avaliacao?.valor_realizado ?? null);

                  return (
                    <TableRow key={meta.id}>
                      <TableCell>Diretriz {meta.diretriz.numero}</TableCell>
                      <TableCell>{meta.diretriz.numero}.{meta.objetivo.numero}</TableCell>
                      <TableCell>{meta.numero}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{meta.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-1">{meta.objetivo.nome}</p>
                        </div>
                      </TableCell>
                      <TableCell>{meta.responsavel}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{meta.indicador}</TableCell>
                      <TableCell className="text-center font-semibold text-primary">
                        {formatTargetValue(getMetaTarget(meta, selectedYear), meta.unidade_medida)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getResultado(meta.id) ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusClassNames[status]}`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getAnaliseQualitativa(meta.id) || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
