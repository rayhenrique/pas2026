import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Database, History } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { saveFileWithPicker } from "@/utils/fileExport";

import {
    BackupTab,
    HistoricoTable,
    AuditoriaFilters,
    RestoreDialog,
} from "./components";
import { HistoricoItem, Profile, acaoLabels } from "./types";

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
            toast({ title: "Erro ao exportar", description: error.message, variant: "destructive" });
        } finally {
            setExporting(false);
        }
    };

    // Handle file selection
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
                toast({ title: "Erro ao ler arquivo", description: error.message, variant: "destructive" });
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
                await supabase.from("acoes_status").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                await supabase.from("lancamentos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                await supabase.from("acoes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                await supabase.from("metas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                await supabase.from("diretrizes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                await supabase.from("eixos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            }

            const { data } = backupPreview;

            if (data.eixos?.length > 0) await supabase.from("eixos").upsert(data.eixos, { onConflict: "id" });
            if (data.diretrizes?.length > 0) await supabase.from("diretrizes").upsert(data.diretrizes, { onConflict: "id" });
            if (data.metas?.length > 0) await supabase.from("metas").upsert(data.metas, { onConflict: "id" });
            if (data.acoes?.length > 0) await supabase.from("acoes").upsert(data.acoes, { onConflict: "id" });
            if (data.lancamentos?.length > 0) await supabase.from("lancamentos").upsert(data.lancamentos, { onConflict: "id" });
            if (data.acoes_status?.length > 0) await supabase.from("acoes_status").upsert(data.acoes_status, { onConflict: "id" });

            toast({ title: "Backup restaurado!", description: "Os dados foram restaurados com sucesso." });
            setImportDialogOpen(false);
            setBackupPreview(null);
        } catch (error: any) {
            toast({ title: "Erro ao restaurar", description: error.message, variant: "destructive" });
        } finally {
            setImporting(false);
        }
    };

    // Helpers
    const getUserName = (userId: string) => {
        const profile = profiles.find(p => p.user_id === userId);
        return profile?.nome || profile?.email || userId.substring(0, 8);
    };

    const filteredHistorico = historico.filter(item => {
        const matchesSearch = searchTerm === "" ||
            item.meta_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getUserName(item.alterado_por).toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAcao = filterAcao === "all" || item.acao === filterAcao;
        const matchesQuad = filterQuadrimestre === "all" || item.quadrimestre.toString() === filterQuadrimestre;

        const itemDate = new Date(item.alterado_em);
        let matchesDateRange = true;

        if (dateFrom && dateTo) {
            matchesDateRange = isWithinInterval(itemDate, { start: startOfDay(dateFrom), end: endOfDay(dateTo) });
        } else if (dateFrom) {
            matchesDateRange = itemDate >= startOfDay(dateFrom);
        } else if (dateTo) {
            matchesDateRange = itemDate <= endOfDay(dateTo);
        }

        return matchesSearch && matchesAcao && matchesQuad && matchesDateRange;
    });

    // Export functions
    const exportToPDF = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(18);
        doc.text("Histórico de Auditoria", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${settings?.app_name || "PAS Digital"} - ${settings?.municipality || ""}`, pageWidth / 2, 28, { align: "center" });
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, pageWidth / 2, 34, { align: "center" });

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
            startY: 40,
            head: [["Data/Hora", "Usuário", "Ação", "Período", "Meta", "Anterior", "Novo"]],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] },
        });

        const fileName = `auditoria-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
        const blob = await doc.output("blob");
        await saveFileWithPicker(blob, fileName, "application/pdf", [".pdf"]);

        toast({ title: "PDF exportado!", description: `${filteredHistorico.length} registros exportados.` });
    };

    const exportToCSV = async () => {
        const headers = ["Data/Hora", "Usuário", "Email", "Ação", "Período", "Meta ID", "Valor Anterior", "Novo Valor"];
        const rows = filteredHistorico.map(item => {
            const profile = profiles.find(p => p.user_id === item.alterado_por);
            return [
                format(new Date(item.alterado_em), "dd/MM/yyyy HH:mm", { locale: ptBR }),
                profile?.nome || "", profile?.email || "",
                acaoLabels[item.acao] || item.acao,
                `${item.quadrimestre}º Quad/${item.ano}`,
                item.meta_id,
                item.resultado_anterior !== null ? `${item.resultado_anterior}` : "",
                item.resultado_novo !== null ? `${item.resultado_novo}` : "",
            ];
        });

        const csvContent = [headers.join(";"), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))].join("\n");
        const content = "\uFEFF" + csvContent;
        const fileName = `auditoria-${format(new Date(), "yyyy-MM-dd-HHmm")}.csv`;

        await saveFileWithPicker(content, fileName, "text/csv", [".csv"]);
        toast({ title: "CSV exportado!", description: `${filteredHistorico.length} registros exportados.` });
    };

    const handleClearAuditoria = async () => {
        try {
            const { error, count } = await supabase
                .from("lancamentos_historico")
                .delete({ count: "exact" })
                .neq("id", "00000000-0000-0000-0000-000000000000");

            if (error) throw error;
            if (count === 0) throw new Error("A operação foi bloqueada pelo banco de dados.");

            toast({ title: "Auditoria limpa!", description: `${count} registros removidos.` });
            fetchHistorico();
        } catch (error: any) {
            toast({ title: "Erro ao limpar auditoria", description: error.message, variant: "destructive" });
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
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Backup & Auditoria</h1>
                        <p className="text-muted-foreground">Gerencie backups e visualize o histórico de alterações</p>
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

                    <TabsContent value="backup" className="space-y-6">
                        <BackupTab
                            canRestore={canRestore}
                            exporting={exporting}
                            onExportBackup={handleExportBackup}
                            onFileSelect={() => fileInputRef.current?.click()}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </TabsContent>

                    <TabsContent value="auditoria" className="space-y-6">
                        <AuditoriaFilters
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            filterAcao={filterAcao}
                            onFilterAcaoChange={setFilterAcao}
                            filterQuadrimestre={filterQuadrimestre}
                            onFilterQuadrimestreChange={setFilterQuadrimestre}
                            dateFrom={dateFrom}
                            onDateFromChange={setDateFrom}
                            dateTo={dateTo}
                            onDateToChange={setDateTo}
                            onClearDates={() => { setDateFrom(undefined); setDateTo(undefined); }}
                            onRefresh={fetchHistorico}
                            onExportPDF={exportToPDF}
                            onExportCSV={exportToCSV}
                            onClearAuditoria={handleClearAuditoria}
                            canExport={filteredHistorico.length > 0}
                            isSuperadmin={isSuperadmin}
                        />
                        <HistoricoTable
                            historico={filteredHistorico}
                            loading={loadingHistorico}
                            getUserName={getUserName}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <RestoreDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                backupPreview={backupPreview}
                replaceOnRestore={replaceOnRestore}
                onReplaceChange={setReplaceOnRestore}
                importing={importing}
                onConfirm={handleRestoreBackup}
            />
        </Layout>
    );
}
