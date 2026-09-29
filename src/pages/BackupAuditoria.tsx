import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Database, Download, FileJson, History, Loader2, Search, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { usePasData } from "@/hooks/usePasData";
import { YEAR_OPTIONS, StatusAtingimento } from "@/types/pas";
import { saveFileWithPicker } from "@/utils/fileExport";
import { STATUS_LABELS } from "@/utils/pasHelpers";

const backupRowSchema = z.record(z.unknown());
const backupSchema = z.object({
  version: z.literal("2.0"),
  created_at: z.string().datetime(),
  data: z.object({
    diretrizes: z.array(backupRowSchema),
    objetivos: z.array(backupRowSchema),
    metas: z.array(backupRowSchema),
    acoes: z.array(backupRowSchema),
    avaliacoes_anuais: z.array(backupRowSchema),
    acoes_status: z.array(backupRowSchema),
    setores_responsaveis: z.array(backupRowSchema),
    app_settings: z.array(backupRowSchema),
  }),
  stats: z.record(z.number()),
});

type BackupPreview = z.infer<typeof backupSchema>;

interface HistoricoItem {
  id: string;
  meta_id: string;
  ano_referencia: number;
  valor_realizado: number | null;
  analise_qualitativa: string | null;
  status_atingimento: StatusAtingimento;
  updated_at: string;
  user_id: string;
  meta_descricao: string;
  responsavel: string;
  usuario: string;
  operacao: "INSERT" | "UPDATE" | "DELETE";
}

const statusBadge: Record<StatusAtingimento, string> = {
  otimo: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  bom: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  suficiente: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  regular: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  nao_alcancado: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  nao_avaliado: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  sem_criterio: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

export default function BackupAuditoria() {
  const { toast } = useToast();
  const { isAdmin, isSuperadmin } = useUserRole();
  const { diretrizes } = usePasData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canRestore = isAdmin || isSuperadmin;

  const [tab, setTab] = useState("backup");
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [replaceOnRestore, setReplaceOnRestore] = useState(true);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchHistorico = useCallback(async () => {
    setLoadingHistorico(true);
    try {
      const [auditRes, profilesRes] = await Promise.all([
        supabase.from("avaliacoes_anuais_audit").select("*").order("alterado_em", { ascending: false }),
        supabase.from("profiles").select("user_id, nome, email"),
      ]);
      if (auditRes.error) throw auditRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const metaMap = new Map(
        diretrizes.flatMap((diretriz) =>
          diretriz.objetivos.flatMap((objetivo) =>
            objetivo.metas.map((meta) => [meta.id, { descricao: meta.descricao, responsavel: meta.responsavel }] as const),
          ),
        ),
      );
      const profileMap = new Map(
        (profilesRes.data || []).map((profile) => [profile.user_id, profile.nome || profile.email || profile.user_id] as const),
      );

      setHistorico(
        (auditRes.data || []).map((item) => {
          const snapshot = (item.dados_novos || item.dados_anteriores || {}) as Record<string, unknown>;
          const rawStatus = String(snapshot.status_atingimento || "nao_avaliado") as StatusAtingimento;
          const actorId = item.alterado_por || "";

          return {
            id: item.id,
            meta_id: item.meta_id,
            ano_referencia: item.ano_referencia,
            valor_realizado: typeof snapshot.valor_realizado === "number" ? snapshot.valor_realizado : null,
            analise_qualitativa: typeof snapshot.analise_qualitativa === "string" ? snapshot.analise_qualitativa : null,
            status_atingimento: rawStatus in statusBadge ? rawStatus : "nao_avaliado",
            updated_at: item.alterado_em,
            user_id: actorId,
            meta_descricao: metaMap.get(item.meta_id)?.descricao || item.meta_id,
            responsavel: metaMap.get(item.meta_id)?.responsavel || "-",
            usuario: profileMap.get(actorId) || actorId || "Sistema",
            operacao: item.operacao as HistoricoItem["operacao"],
          };
        }),
      );
    } catch (error) {
      toast({
        title: "Erro ao carregar histórico",
        description: error instanceof Error ? error.message : "Falha ao carregar as avaliações anuais.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistorico(false);
    }
  }, [diretrizes, toast]);

  useEffect(() => {
    if (tab === "auditoria") {
      fetchHistorico();
    }
  }, [tab, fetchHistorico]);

  const filteredHistorico = useMemo(
    () =>
      historico.filter((item) => {
        const searchValue = search.toLowerCase();
        const matchesSearch =
          searchValue === "" ||
          item.meta_descricao.toLowerCase().includes(searchValue) ||
          item.usuario.toLowerCase().includes(searchValue) ||
          item.responsavel.toLowerCase().includes(searchValue);
        const matchesYear = filterYear === "all" || String(item.ano_referencia) === filterYear;
        const matchesStatus = filterStatus === "all" || item.status_atingimento === filterStatus;
        return matchesSearch && matchesYear && matchesStatus;
      }),
    [historico, search, filterYear, filterStatus],
  );

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const [
        diretrizesRes,
        objetivosRes,
        metasRes,
        acoesRes,
        avaliacoesRes,
        acoesStatusRes,
        setoresRes,
        appSettingsRes,
      ] = await Promise.all([
        supabase.from("diretrizes").select("*").order("numero"),
        supabase.from("objetivos").select("*").order("numero"),
        supabase.from("metas").select("*").order("numero"),
        supabase.from("acoes").select("*").order("numero"),
        supabase.from("avaliacoes_anuais").select("*"),
        supabase.from("acoes_status").select("*"),
        supabase.from("setores_responsaveis").select("*").order("nome"),
        supabase.from("app_settings").select("*"),
      ]);
      [diretrizesRes, objetivosRes, metasRes, acoesRes, avaliacoesRes, acoesStatusRes, setoresRes, appSettingsRes].forEach((response) => {
        if (response.error) throw response.error;
      });

      const backup: BackupPreview = {
        version: "2.0",
        created_at: new Date().toISOString(),
        data: {
          diretrizes: diretrizesRes.data || [],
          objetivos: objetivosRes.data || [],
          metas: metasRes.data || [],
          acoes: acoesRes.data || [],
          avaliacoes_anuais: avaliacoesRes.data || [],
          acoes_status: acoesStatusRes.data || [],
          setores_responsaveis: setoresRes.data || [],
          app_settings: appSettingsRes.data || [],
        },
        stats: {
          diretrizes: diretrizesRes.data?.length || 0,
          objetivos: objetivosRes.data?.length || 0,
          metas: metasRes.data?.length || 0,
          acoes: acoesRes.data?.length || 0,
          avaliacoes_anuais: avaliacoesRes.data?.length || 0,
          setores_responsaveis: setoresRes.data?.length || 0,
        },
      };

      await saveFileWithPicker(
        JSON.stringify(backup, null, 2),
        `backup-pms-anual-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json",
        [".json"],
      );

      toast({
        title: "Backup exportado",
        description: `${backup.stats.metas} metas e ${backup.stats.avaliacoes_anuais} avaliações anuais exportadas.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar backup",
        description: error instanceof Error ? error.message : "Falha ao gerar o backup.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O backup deve ter no máximo 25 MB.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = backupSchema.parse(JSON.parse(String(reader.result)));
        setBackupPreview(parsed);
        setImportDialogOpen(true);
      } catch (error) {
        toast({
          title: "Erro ao ler o backup",
          description: error instanceof Error ? error.message : "Falha ao abrir o arquivo selecionado.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleRestoreBackup = async () => {
    if (!backupPreview) return;
    setImporting(true);
    try {
      const { error } = await supabase.rpc("restore_pas_backup", {
        backup_data: backupPreview.data as Json,
        replace_existing: replaceOnRestore,
      });
      if (error) throw error;

      toast({ title: "Backup restaurado", description: "Os dados anuais foram restaurados com sucesso." });
      setImportDialogOpen(false);
      setBackupPreview(null);
      if (tab === "auditoria") await fetchHistorico();
    } catch (error) {
      toast({
        title: "Erro ao restaurar backup",
        description: error instanceof Error ? error.message : "Falha ao restaurar os dados anuais.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-header">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Backup & Auditoria</h1>
            <p className="text-muted-foreground">Gerencie o backup do schema anual e acompanhe o histórico das avaliações.</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="backup" className="gap-2"><Database className="h-4 w-4" />Backup</TabsTrigger>
            <TabsTrigger value="auditoria" className="gap-2"><History className="h-4 w-4" />Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-primary" />Exportar backup</CardTitle>
                  <CardDescription>Baixe a árvore anual completa, incluindo avaliações e status das ações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                    O backup inclui `setores_responsaveis`, `diretrizes`, `objetivos`, `metas`, `ações`, `avaliações anuais`, `ações status` e `app_settings`.
                  </div>
                  <Button onClick={handleExportBackup} disabled={exporting} className="w-full gap-2">
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Exportar backup anual
                  </Button>
                </CardContent>
              </Card>

              {canRestore && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" />Restaurar backup</CardTitle>
                    <CardDescription>Importe um arquivo `.json` gerado pela versão anualizada do sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-muted-foreground">
                      A restauração pode sobrescrever dados atuais. Gere um backup antes de prosseguir.
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full gap-2">
                      <FileJson className="h-4 w-4" />
                      Selecionar arquivo de backup
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por meta, usuário ou responsável..." className="pl-10" />
                  </div>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      {YEAR_OPTIONS.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([status, label]) => <SelectItem key={status} value={status}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Histórico anual de avaliações</span>
                  <Badge variant="outline">{filteredHistorico.length} registro(s)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistorico ? (
                  <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : filteredHistorico.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">Nenhuma avaliação anual encontrada para os filtros selecionados.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ano</TableHead>
                          <TableHead>Meta</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead>Realizado</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Operação</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Atualizado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistorico.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.ano_referencia}</TableCell>
                            <TableCell className="min-w-[280px]">{item.meta_descricao}</TableCell>
                            <TableCell>{item.responsavel}</TableCell>
                            <TableCell>{item.valor_realizado ?? "-"}</TableCell>
                            <TableCell><span className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusBadge[item.status_atingimento]}`}>{STATUS_LABELS[item.status_atingimento]}</span></TableCell>
                            <TableCell><Badge variant="outline">{item.operacao}</Badge></TableCell>
                            <TableCell>{item.usuario}</TableCell>
                            <TableCell>{new Date(item.updated_at).toLocaleString("pt-BR")}</TableCell>
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Restaurar backup anual</DialogTitle>
            <DialogDescription>Revise o conteúdo do arquivo antes de aplicar a restauração.</DialogDescription>
          </DialogHeader>
          {backupPreview && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                Versão {backupPreview.version} • criado em {new Date(backupPreview.created_at).toLocaleString("pt-BR")}
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {Object.entries(backupPreview.stats).map(([key, value]) => <div key={key} className="flex justify-between"><span>{key}</span><span>{value}</span></div>)}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <Checkbox id="replace-restore" checked={replaceOnRestore} onCheckedChange={(checked) => setReplaceOnRestore(checked === true)} />
                <div>
                  <Label htmlFor="replace-restore" className="font-medium">Substituir os dados atuais</Label>
                  <p className="text-sm text-muted-foreground">Limpa a estrutura anual e as avaliações antes da restauração.</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleRestoreBackup} disabled={importing} className="gap-2">{importing && <Loader2 className="h-4 w-4 animate-spin" />}Restaurar backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
