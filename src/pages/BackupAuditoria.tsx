import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import {
  Download,
  Upload,
  History,
  Database,
  FileJson,
  Loader2,
  Search,
  Calendar,
  User,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Trash2,
  FileSpreadsheet
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { saveFileWithPicker } from "@/utils/fileExport";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HistoricoItem {
  id: string;
  lancamento_id: string;
  user_id: string;
  meta_id: string;
  quadrimestre: number;
  ano: number;
  resultado_anterior: number | null;
  resultado_novo: number | null;
  justificativa_anterior: string | null;
  justificativa_nova: string | null;
  acao: string;
  alterado_por: string;
  alterado_em: string;
}

interface Profile {
  user_id: string;
  nome: string;
  email: string;
}

export default function BackupAuditoria() {
  const { toast } = useToast();
  const { settings } = useAppSettings();
  const { isAdmin, isSuperadmin } = useUserRole();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canRestore = isAdmin || isSuperadmin;

  // Backup states
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [backupPreview, setBackupPreview] = useState<any>(null);
  const [replaceOnRestore, setReplaceOnRestore] = useState(false);

  // Auditoria states
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAcao, setFilterAcao] = useState<string>("all");
  const [filterQuadrimestre, setFilterQuadrimestre] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  // Fetch historico
  const fetchHistorico = async () => {
    setLoadingHistorico(true);
    try {
      const { data, error } = await supabase
        .from("lancamentos_historico")
        .select("*")
        .order("alterado_em", { ascending: false })
        .limit(500);

      if (error) throw error;
      setHistorico(data || []);

      // Fetch profiles for user names
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, nome, email");

      setProfiles(profilesData || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingHistorico(false);
    }
  };

  // Export full backup
  const handleExportBackup = async () => {
    setExporting(true);
    try {
      // Fetch all data
      const [eixosRes, diretrizesRes, metasRes, acoesRes, lancamentosRes, acoesStatusRes] = await Promise.all([
        supabase.from("eixos").select("*").order("numero"),
        supabase.from("diretrizes").select("*").order("numero"),
        supabase.from("metas").select("*").order("numero"),
        supabase.from("acoes").select("*").order("numero"),
        supabase.from("lancamentos").select("*"),
        supabase.from("acoes_status").select("*"),
      ]);

      const backup = {
        version: "1.0",
        created_at: new Date().toISOString(),
        app_settings: settings,
        data: {
          eixos: eixosRes.data || [],
          diretrizes: diretrizesRes.data || [],
          metas: metasRes.data || [],
          acoes: acoesRes.data || [],
          lancamentos: lancamentosRes.data || [],
          acoes_status: acoesStatusRes.data || [],
        },
        stats: {
          eixos: eixosRes.data?.length || 0,
          diretrizes: diretrizesRes.data?.length || 0,
          metas: metasRes.data?.length || 0,
          acoes: acoesRes.data?.length || 0,
          lancamentos: lancamentosRes.data?.length || 0,
        },
      };

      const jsonString = JSON.stringify(backup, null, 2);
      const fileName = `backup-pas-${settings?.current_year}-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;

      await saveFileWithPicker(jsonString, fileName, "application/json", [".json"]);

      toast({
        title: "Backup exportado!",
        description: `Arquivo contém ${backup.stats.eixos} eixos, ${backup.stats.metas} metas e ${backup.stats.lancamentos} lançamentos.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao exportar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version || !data.data) {
          throw new Error("Arquivo de backup inválido.");
        }

        setBackupPreview(data);
        setImportDialogOpen(true);
      } catch (error: any) {
        toast({
          title: "Erro ao ler arquivo",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!backupPreview) return;

    setImporting(true);
    try {
      if (replaceOnRestore) {
        // Clear existing data
        await supabase.from("acoes_status").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("lancamentos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("acoes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("metas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("diretrizes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("eixos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }

      const { data } = backupPreview;

      // Restore in order
      if (data.eixos?.length > 0) {
        const { error } = await supabase.from("eixos").upsert(data.eixos, { onConflict: "id" });
        if (error) throw error;
      }

      if (data.diretrizes?.length > 0) {
        const { error } = await supabase.from("diretrizes").upsert(data.diretrizes, { onConflict: "id" });
        if (error) throw error;
      }

      if (data.metas?.length > 0) {
        const { error } = await supabase.from("metas").upsert(data.metas, { onConflict: "id" });
        if (error) throw error;
      }

      if (data.acoes?.length > 0) {
        const { error } = await supabase.from("acoes").upsert(data.acoes, { onConflict: "id" });
        if (error) throw error;
      }

      if (data.lancamentos?.length > 0) {
        const { error } = await supabase.from("lancamentos").upsert(data.lancamentos, { onConflict: "id" });
        if (error) throw error;
      }

      if (data.acoes_status?.length > 0) {
        const { error } = await supabase.from("acoes_status").upsert(data.acoes_status, { onConflict: "id" });
        if (error) throw error;
      }

      toast({
        title: "Backup restaurado!",
        description: "Os dados foram restaurados com sucesso.",
      });

      setImportDialogOpen(false);
      setBackupPreview(null);
    } catch (error: any) {
      toast({
        title: "Erro ao restaurar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  // Get user name from profile
  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.nome || profile?.email || userId.substring(0, 8);
  };

  // Filter historico
  const filteredHistorico = historico.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.meta_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(item.alterado_por).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAcao = filterAcao === "all" || item.acao === filterAcao;
    const matchesQuad = filterQuadrimestre === "all" || item.quadrimestre.toString() === filterQuadrimestre;

    // Date range filter
    const itemDate = new Date(item.alterado_em);
    let matchesDateRange = true;

    if (dateFrom && dateTo) {
      matchesDateRange = isWithinInterval(itemDate, {
        start: startOfDay(dateFrom),
        end: endOfDay(dateTo),
      });
    } else if (dateFrom) {
      matchesDateRange = itemDate >= startOfDay(dateFrom);
    } else if (dateTo) {
      matchesDateRange = itemDate <= endOfDay(dateTo);
    }

    return matchesSearch && matchesAcao && matchesQuad && matchesDateRange;
  });

  // Clear date filters
  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const acaoColors: Record<string, string> = {
    INSERT: "bg-success/10 text-success border-success/20",
    UPDATE: "bg-primary/10 text-primary border-primary/20",
    DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const acaoLabels: Record<string, string> = {
    INSERT: "Criação",
    UPDATE: "Alteração",
    DELETE: "Exclusão",
  };

  // Export to PDF
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text("Histórico de Auditoria", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${settings?.app_name || "PAS Digital"} - ${settings?.municipality || ""}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 34, { align: "center" });

    // Filters info
    const filters = [];
    if (filterAcao !== "all") filters.push(`Ação: ${acaoLabels[filterAcao]}`);
    if (filterQuadrimestre !== "all") filters.push(`${filterQuadrimestre}º Quadrimestre`);
    if (dateFrom) filters.push(`De: ${format(dateFrom, "dd/MM/yyyy", { locale: ptBR })}`);
    if (dateTo) filters.push(`Até: ${format(dateTo, "dd/MM/yyyy", { locale: ptBR })}`);
    if (searchTerm) filters.push(`Busca: "${searchTerm}"`);

    if (filters.length > 0) {
      doc.setFontSize(9);
      doc.text(`Filtros: ${filters.join(" | ")}`, pageWidth / 2, 40, { align: "center" });
    }

    // Table data
    const tableData = filteredHistorico.map(item => [
      format(new Date(item.alterado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      getUserName(item.alterado_por),
      acaoLabels[item.acao] || item.acao,
      `${item.quadrimestre}º Quad/${item.ano}`,
      item.meta_id,
      item.resultado_anterior !== null ? `${item.resultado_anterior}%` : "-",
      item.resultado_novo !== null ? `${item.resultado_novo}%` : "-",
    ]);

    autoTable(doc, {
      startY: filters.length > 0 ? 46 : 40,
      head: [["Data/Hora", "Usuário", "Ação", "Período", "Meta", "Anterior", "Novo"]],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35 },
        5: { cellWidth: 18 },
        6: { cellWidth: 18 },
      },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    const fileName = `auditoria-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
    const blob = await doc.output("blob");
    await saveFileWithPicker(blob, fileName, "application/pdf", [".pdf"]);

    toast({
      title: "PDF exportado!",
      description: `${filteredHistorico.length} registros exportados.`,
    });
  };

  // Export to CSV
  const exportToCSV = async () => {
    const headers = ["Data/Hora", "Usuário", "Email", "Ação", "Período", "Meta ID", "Valor Anterior", "Novo Valor", "Justificativa Anterior", "Justificativa Nova"];

    const rows = filteredHistorico.map(item => {
      const profile = profiles.find(p => p.user_id === item.alterado_por);
      return [
        format(new Date(item.alterado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        profile?.nome || "",
        profile?.email || "",
        acaoLabels[item.acao] || item.acao,
        `${item.quadrimestre}º Quad/${item.ano}`,
        item.meta_id,
        item.resultado_anterior !== null ? `${item.resultado_anterior}` : "",
        item.resultado_novo !== null ? `${item.resultado_novo}` : "",
        item.justificativa_anterior || "",
        item.justificativa_nova || "",
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const BOM = "\uFEFF";
    const content = BOM + csvContent;
    const fileName = `auditoria-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;

    await saveFileWithPicker(content, fileName, "text/csv", [".csv"]);

    toast({
      title: "CSV exportado!",
      description: `${filteredHistorico.length} registros exportados.`,
    });
  };

  // Clear Audit Logs (Super Admin only)
  const handleClearAuditoria = async () => {
    try {
      // First, check if there are any logs to delete
      const { count: totalLogs } = await supabase
        .from("lancamentos_historico")
        .select("*", { count: "exact", head: true });

      if (totalLogs === 0) {
        toast({
          title: "Auditoria já está vazia",
          description: "Não há registros para apagar.",
        });
        return;
      }

      const { error, count } = await supabase
        .from("lancamentos_historico")
        .delete({ count: "exact" }) // Request exact count of deleted rows
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;

      // If no error but count is 0 (and we knew there were logs), it's likely RLS
      if (count === 0) {
        throw new Error("A operação foi bloqueada pelo banco de dados. Verifique as permissões (RLS).");
      }

      toast({
        title: "Auditoria limpa!",
        description: `${count} registros de auditoria foram removidos com sucesso.`,
      });

      fetchHistorico();
    } catch (error: any) {
      console.error("Erro ao limpar auditoria:", error);
      toast({
        title: "Erro ao limpar auditoria",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-header flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Backup & Auditoria
            </h1>
            <p className="text-muted-foreground">
              Gerencie backups e visualize o histórico de alterações
            </p>
          </div>
        </div>

        <Tabs defaultValue="backup" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="backup" className="gap-2">
              <Database className="w-4 h-4" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="gap-2" onClick={fetchHistorico}>
              <History className="w-4 h-4" />
              Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Export Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-primary" />
                    Exportar Backup
                  </CardTitle>
                  <CardDescription>
                    Gere um arquivo JSON com todos os dados do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                    <p className="font-medium">O backup inclui:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Eixos, Diretrizes, Metas e Ações</li>
                      <li>Lançamentos de todos os quadrimestres</li>
                      <li>Status das ações</li>
                      <li>Configurações do aplicativo</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleExportBackup}
                    disabled={exporting}
                    className="w-full gap-2"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Exportar Backup Completo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Import Card - Restricted to Admin/SuperAdmin */}
              {canRestore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-primary" />
                      Restaurar Backup
                    </CardTitle>
                    <CardDescription>
                      Importe um arquivo de backup para restaurar dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Atenção</span>
                      </div>
                      <p className="text-muted-foreground">
                        A restauração pode sobrescrever dados existentes. Faça um backup antes de prosseguir.
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full gap-2"
                    >
                      <FileJson className="w-4 h-4" />
                      Selecionar Arquivo de Backup
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Auditoria Tab */}
          <TabsContent value="auditoria" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  {/* First row: search and selects */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por meta ou usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterAcao} onValueChange={setFilterAcao}>
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Tipo de ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas ações</SelectItem>
                        <SelectItem value="INSERT">Criação</SelectItem>
                        <SelectItem value="UPDATE">Alteração</SelectItem>
                        <SelectItem value="DELETE">Exclusão</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterQuadrimestre} onValueChange={setFilterQuadrimestre}>
                      <SelectTrigger className="w-full md:w-40">
                        <SelectValue placeholder="Quadrimestre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="1">1º Quadrimestre</SelectItem>
                        <SelectItem value="2">2º Quadrimestre</SelectItem>
                        <SelectItem value="3">3º Quadrimestre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Second row: date filters and actions */}
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">De</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full sm:w-[160px] justify-start text-left font-normal",
                                !dateFrom && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dateFrom}
                              onSelect={setDateFrom}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Até</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full sm:w-[160px] justify-start text-left font-normal",
                                !dateTo && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dateTo}
                              onSelect={setDateTo}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {(dateFrom || dateTo) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDateFilters}
                          className="text-muted-foreground self-end h-10"
                        >
                          Limpar datas
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {isSuperadmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="gap-2">
                              <Trash2 className="w-4 h-4" />
                              Limpar Auditoria
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente todo o histórico de alterações do sistema.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleClearAuditoria} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Confirmar Exclusão
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <Button variant="outline" onClick={fetchHistorico} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={filteredHistorico.length === 0}
                        className="gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={exportToCSV}
                        disabled={filteredHistorico.length === 0}
                        className="gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historico Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Histórico de Alterações
                  </span>
                  <Badge variant="outline">
                    {filteredHistorico.length} registro(s)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistorico ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredHistorico.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum registro encontrado</p>
                    <p className="text-sm text-muted-foreground/60">
                      O histórico será preenchido conforme alterações forem feitas
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Novo Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistorico.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(item.alterado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm truncate max-w-[150px]">
                                  {getUserName(item.alterado_por)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", acaoColors[item.acao])}
                              >
                                {acaoLabels[item.acao] || item.acao}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {item.quadrimestre}º Quad/{item.ano}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {item.resultado_anterior !== null ? `${item.resultado_anterior}%` : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">
                                {item.resultado_novo !== null ? `${item.resultado_novo}%` : "-"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Restaurar Backup
            </DialogTitle>
            <DialogDescription>
              Revise as informações do backup antes de restaurar
            </DialogDescription>
          </DialogHeader>

          {backupPreview && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Versão:</span>
                  <span className="font-medium">{backupPreview.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="font-medium">
                    {format(new Date(backupPreview.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm font-medium">Conteúdo:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eixos:</span>
                      <span>{backupPreview.stats?.eixos || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diretrizes:</span>
                      <span>{backupPreview.stats?.diretrizes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Metas:</span>
                      <span>{backupPreview.stats?.metas || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ações:</span>
                      <span>{backupPreview.stats?.acoes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lançamentos:</span>
                      <span>{backupPreview.stats?.lancamentos || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <Checkbox
                  id="replaceOnRestore"
                  checked={replaceOnRestore}
                  onCheckedChange={(checked) => setReplaceOnRestore(checked === true)}
                />
                <div className="flex-1">
                  <Label htmlFor="replaceOnRestore" className="text-sm font-medium cursor-pointer flex items-center gap-2 text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Substituir todos os dados
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remove todos os dados existentes antes de restaurar
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importing}>
              Cancelar
            </Button>
            <Button onClick={handleRestoreBackup} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Restaurar Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
