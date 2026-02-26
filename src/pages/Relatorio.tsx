import { useState } from "react";
import { Layout } from "@/components/Layout";
import { FileSpreadsheet, Filter, Download, Check, AlertTriangle, Clock, Minus, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLancamentos } from "@/hooks/useLancamentos";
import { usePasData } from "@/hooks/usePasData";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveFileWithPicker } from "@/utils/fileExport";

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

type StatusKey = keyof typeof statusConfig;

export default function Relatorio() {
  const { settings } = useAppSettings();
  const currentYear = settings?.current_year || 2026;
  const municipality = settings?.municipality || "Teotônio Vilela";

  const [selectedEixo, setSelectedEixo] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedQuadrimestre, setSelectedQuadrimestre] = useState<1 | 2 | 3>(1);
  const [exporting, setExporting] = useState(false);

  const { eixos, loading: pasLoading } = usePasData();
  const { loading: lancamentosLoading, getResultado, getJustificativa } = useLancamentos(currentYear);

  const loading = pasLoading || lancamentosLoading;

  // Helper para calcular status baseado em dados do banco
  const getMetaStatus = (metaId: string, metaPlano: string): StatusKey => {
    const resultado2 = getResultado(metaId, 2);
    const resultado1 = getResultado(metaId, 1);
    const resultado = resultado2 ?? resultado1;

    if (resultado === null || resultado === undefined) return "pendente";

    const metaValue = parseFloat(String(metaPlano).replace("%", "").replace(",", "."));

    if (resultado >= metaValue) return "atingida";
    if (resultado >= metaValue * 0.8) return "parcial";
    return "abaixo";
  };

  // Helper para obter resultado formatado
  const getResultadoFormatado = (metaId: string, quadrimestre: number, unidade: string) => {
    const resultado = getResultado(metaId, quadrimestre);
    if (resultado === null || resultado === undefined) return "-";
    return `${resultado}${unidade === "Percentual" || unidade === "%" ? "%" : ""}`;
  };

  // Flatten data for table
  const allMetas = eixos.flatMap(eixo =>
    eixo.diretrizes.flatMap(diretriz =>
      diretriz.metas.map(meta => ({
        ...meta,
        eixoNumero: eixo.numero,
        eixoNome: eixo.nome,
        diretrizNumero: diretriz.numero,
        diretrizNome: diretriz.nome,
        eixoId: eixo.id,
      }))
    )
  );

  // Filter data
  const filteredMetas = allMetas.filter(meta => {
    const metaPlano = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
    const matchEixo = selectedEixo === "all" || meta.eixoId === selectedEixo;
    const status = getMetaStatus(meta.id, metaPlano);
    const matchStatus = selectedStatus === "all" || status === selectedStatus;
    return matchEixo && matchStatus;
  });

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`Relatório de Acompanhamento - ${settings?.app_name || 'PAS'} ${currentYear}`, 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Prefeitura Municipal de ${municipality} - AL`, 14, 28);
      doc.text(`${selectedQuadrimestre}º Quadrimestre de ${currentYear}`, 14, 34);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 40);

      // Resumo
      const atingidas = allMetas.filter(m => {
        const metaPlano = (m as any).meta_plano_2025 || (m as any).metaPlano2026 || '0';
        return getMetaStatus(m.id, metaPlano) === "atingida";
      }).length;
      const parciais = allMetas.filter(m => {
        const metaPlano = (m as any).meta_plano_2025 || (m as any).metaPlano2026 || '0';
        return getMetaStatus(m.id, metaPlano) === "parcial";
      }).length;
      const abaixo = allMetas.filter(m => {
        const metaPlano = (m as any).meta_plano_2025 || (m as any).metaPlano2026 || '0';
        return getMetaStatus(m.id, metaPlano) === "abaixo";
      }).length;
      const pendentes = allMetas.filter(m => {
        const metaPlano = (m as any).meta_plano_2025 || (m as any).metaPlano2026 || '0';
        return getMetaStatus(m.id, metaPlano) === "pendente";
      }).length;

      doc.setFontSize(10);
      doc.text(`Resumo: ${atingidas} atingidas | ${parciais} parciais | ${abaixo} abaixo | ${pendentes} pendentes | Total: ${allMetas.length} metas`, 14, 48);

      // Table data
      const tableData = filteredMetas.map(meta => {
        const metaPlano = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
        const unidade = (meta as any).unidade_medida || (meta as any).unidadeMedida || '%';
        const status = getMetaStatus(meta.id, metaPlano);
        const justificativa = getJustificativa(meta.id, selectedQuadrimestre) || "";

        return [
          meta.numero.toString(),
          meta.descricao.substring(0, 50) + (meta.descricao.length > 50 ? "..." : ""),
          meta.indicador.substring(0, 40) + (meta.indicador.length > 40 ? "..." : ""),
          metaPlano,
          getResultadoFormatado(meta.id, 1, unidade),
          getResultadoFormatado(meta.id, 2, unidade),
          getResultadoFormatado(meta.id, 3, unidade),
          statusConfig[status].label,
          justificativa.substring(0, 30) + (justificativa.length > 30 ? "..." : ""),
        ];
      });

      autoTable(doc, {
        startY: 54,
        head: [["Nº", "Descrição", "Indicador", "Meta", "1º Q", "2º Q", "3º Q", "Status", "Justificativa"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [0, 75, 141],
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 7,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 50 },
          2: { cellWidth: 45 },
          3: { cellWidth: 15 },
          4: { cellWidth: 15 },
          5: { cellWidth: 15 },
          6: { cellWidth: 15 },
          7: { cellWidth: 20 },
          8: { cellWidth: 45 },
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(128);
          doc.text(
            `Página ${doc.getCurrentPageInfo().pageNumber}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );
        },
      });

      // Save
      const fileName = `Relatorio_PAS_${selectedQuadrimestre}Q_${currentYear}.pdf`;
      const blob = await doc.output("blob");
      await saveFileWithPicker(blob, fileName, "application/pdf", [".pdf"]);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    const headers = ["Nº", "Descrição", "Indicador", `Meta ${currentYear}`, "1º QDM", "2º QDM", "3º QDM", "Status", "Justificativa", "Eixo", "Diretriz"];

    const rows = filteredMetas.map(meta => {
      const metaPlano = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
      const unidade = (meta as any).unidade_medida || (meta as any).unidadeMedida || '%';
      const status = getMetaStatus(meta.id, metaPlano);
      const justificativa = getJustificativa(meta.id, selectedQuadrimestre) || "";

      return [
        meta.numero,
        `"${meta.descricao.replace(/"/g, '""')}"`,
        `"${meta.indicador.replace(/"/g, '""')}"`,
        metaPlano,
        getResultadoFormatado(meta.id, 1, unidade),
        getResultadoFormatado(meta.id, 2, unidade),
        getResultadoFormatado(meta.id, 3, unidade),
        statusConfig[status].label,
        `"${justificativa.replace(/"/g, '""')}"`,
        `"Eixo ${meta.eixoNumero}"`,
        `"Diretriz ${meta.diretrizNumero}"`,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const content = "\ufeff" + csv;
    const fileName = `Relatorio_PAS_${selectedQuadrimestre}Q_${currentYear}.csv`;

    await saveFileWithPicker(content, fileName, "text/csv", [".csv"]);
  };

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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Relatório Consolidado
              </h1>
              <p className="text-muted-foreground">
                Visualização completa das metas e resultados - {currentYear}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2" disabled={exporting}>
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToPDF} className="gap-2">
                <FileText className="w-4 h-4" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Exportar como CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                value={String(selectedQuadrimestre)}
                onValueChange={(value) => setSelectedQuadrimestre(Number(value) as 1 | 2 | 3)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quadrimestre" />
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
                      Eixo {eixo.numero} - {eixo.nome.substring(0, 25)}...
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="atingida">Atingida</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="abaixo">Abaixo</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground self-center">
            {filteredMetas.length} meta(s) encontrada(s)
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12 font-semibold">Nº</TableHead>
                <TableHead className="min-w-[300px] font-semibold">Descrição da Meta</TableHead>
                <TableHead className="min-w-[200px] font-semibold">Indicador</TableHead>
                <TableHead className="w-24 text-center font-semibold">Meta {currentYear}</TableHead>
                <TableHead className="w-24 text-center font-semibold">1º QDM</TableHead>
                <TableHead className="w-24 text-center font-semibold">2º QDM</TableHead>
                <TableHead className="w-24 text-center font-semibold">3º QDM</TableHead>
                <TableHead className="w-28 text-center font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma meta encontrada com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetas.map((meta) => {
                  const metaPlano = (meta as any).meta_plano_2025 || (meta as any).metaPlano2026 || '0';
                  const unidade = (meta as any).unidade_medida || (meta as any).unidadeMedida || '%';
                  const status = getMetaStatus(meta.id, metaPlano);
                  const statusInfo = statusConfig[status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <TableRow key={meta.id} className="hover:bg-muted/20">
                      <TableCell>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{meta.numero}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{meta.descricao}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Eixo {meta.eixoNumero} • Diretriz {meta.diretrizNumero}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {meta.indicador}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-primary">{metaPlano}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {getResultadoFormatado(meta.id, 1, unidade)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {getResultadoFormatado(meta.id, 2, unidade)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">
                          {getResultadoFormatado(meta.id, 3, unidade)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn("inline-flex items-center gap-1.5", statusInfo.className)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 grid sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = allMetas.filter(m => {
            const metaPlano = (m as any).meta_plano_2025 || (m as any).metaPlano2026 || '0';
            return getMetaStatus(m.id, metaPlano) === key;
          }).length;
          const StatusIcon = config.icon;
          return (
            <div key={key} className="card-elevated p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg",
                key === "atingida" && "bg-success/10",
                key === "parcial" && "bg-warning/10",
                key === "abaixo" && "bg-destructive/10",
                key === "pendente" && "bg-info/10"
              )}>
                <StatusIcon className={cn("w-5 h-5",
                  key === "atingida" && "text-success",
                  key === "parcial" && "text-warning",
                  key === "abaixo" && "text-destructive",
                  key === "pendente" && "text-info"
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
