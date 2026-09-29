import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Settings, Save, Loader2, Building2, Calendar, Type, MessageSquare, Database, Download } from "lucide-react";
import { Navigate } from "react-router-dom";
import { importarDadosParaBanco } from "@/utils/importarDados";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Configuracoes() {
  const { settings, loading: settingsLoading, updateSettings } = useAppSettings();
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showImportSuccessDialog, setShowImportSuccessDialog] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    app_name: "",
    municipality: "",
    slogan: "",
    current_year: 2026,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        app_name: settings.app_name,
        municipality: settings.municipality,
        slogan: settings.slogan,
        current_year: settings.current_year,
      });
    }
  }, [settings]);

  // Verifica se é superadmin
  if (!roleLoading && !isSuperadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateSettings(formData);
    setSaving(false);
  };

  const handleImportData = async () => {
    setShowImportDialog(false);
    setImporting(true);

    // Pequeno delay para permitir que o dialog feche e a UI atualize
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      console.log("Iniciando importação de dados...");
      const result = await importarDadosParaBanco();
      console.log("Resultado da importação:", result);

      if (result.success) {
        setImportSuccessMessage(result.message);
        setShowImportSuccessDialog(true);
      } else {
        toast({
          title: "Erro na importação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Falha ao importar dados.";
      console.error("Erro crítico na importação:", error);
      toast({
        title: "Erro Crítico",
        description: message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReloadAfterImport = () => {
    setShowImportSuccessDialog(false);
    window.location.reload();
  };

  if (settingsLoading || roleLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
            <p className="text-muted-foreground">Personalize a aplicação para seu município</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Identidade da Aplicação
            </CardTitle>
            <CardDescription>
              Configure o nome, município e ano vigente. Estas alterações serão refletidas em toda a aplicação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app_name" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Nome da Aplicação
                  </Label>
                  <Input
                    id="app_name"
                    value={formData.app_name}
                    onChange={(e) => handleChange("app_name", e.target.value)}
                    placeholder="Ex: PAS Digital"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipality" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Município
                  </Label>
                  <Input
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) => handleChange("municipality", e.target.value)}
                    placeholder="Ex: Teotônio Vilela"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Slogan
                  </Label>
                  <Input
                    id="slogan"
                    value={formData.slogan}
                    onChange={(e) => handleChange("slogan", e.target.value)}
                    placeholder="Ex: Programação Anual de Saúde"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_year" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ano Vigente
                  </Label>
                  <Input
                    id="current_year"
                    type="number"
                    min={2020}
                    max={2100}
                    value={formData.current_year}
                    onChange={(e) => handleChange("current_year", parseInt(e.target.value) || 2026)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O ano será utilizado em relatórios, lançamentos e exibição em toda a aplicação.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>


        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Database className="w-5 h-5" />
              Gerenciamento de Dados
            </CardTitle>
            <CardDescription>
              Ações sensíveis de manipulação de dados do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <h4 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4" />
                Importar Dados Padrão (PAS 2026)
              </h4>
              <p className="text-sm mt-1 mb-3">
                Esta ação irá <strong>APAGAR TODOS</strong> os dados atuais e reimportar a estrutura anual completa (Diretrizes, Objetivos, Metas e Ações) do arquivo de configuração.
                Use apenas na configuração inicial ou se precisar resetar o sistema.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowImportDialog(true)}
                disabled={importing || saving}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  "Resetar e Importar Dados"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Atenção: Ação Irreversível</AlertDialogTitle>
              <AlertDialogDescription>
                Isso apagará <strong>TODOS</strong> os dados existentes no banco (diretrizes, objetivos, metas, ações e avaliações anuais).
                <br /><br />
                O sistema será restaurado para o estado inicial com os dados da PAS 2026.
                <br /><br />
                Tem certeza que deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleImportData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, Resetar Tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showImportSuccessDialog} onOpenChange={setShowImportSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Importação concluída</AlertDialogTitle>
              <AlertDialogDescription>
                {importSuccessMessage}
                <br /><br />
                O banco foi resetado e os lançamentos existentes foram removidos. Recarregue a aplicação para refletir a estrutura nova em todas as telas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReloadAfterImport}>
                Recarregar agora
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>Veja como ficará a exibição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-sidebar text-sidebar-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                  <Settings className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">{formData.app_name}</h3>
                  <p className="text-xs text-sidebar-foreground/60">
                    {formData.municipality} - {formData.current_year}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
