import { useState, useRef } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { usePasData, Eixo, Diretriz, Meta, Acao } from "@/hooks/usePasData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  FolderOpen,
  Target,
  ListChecks,
  Layers,
  Upload,
  Download,
  FileJson,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { importarDadosParaBanco } from "@/utils/importarDados";
import { supabase } from "@/integrations/supabase/client";

type FormType = "eixo" | "diretriz" | "meta" | "acao";
type FormMode = "create" | "edit";

// Schemas de validação
const baseSchema = z.object({
  numero: z.string().trim().min(1, "Número é obrigatório").refine(
    (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
    "Número deve ser maior que zero"
  ),
});

const eixoSchema = baseSchema.extend({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(200, "Nome deve ter no máximo 200 caracteres"),
});

const diretrizSchema = baseSchema.extend({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(300, "Nome deve ter no máximo 300 caracteres"),
});

const metaSchema = baseSchema.extend({
  descricao: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
  indicador: z.string().trim().min(1, "Indicador é obrigatório").max(200, "Indicador deve ter no máximo 200 caracteres"),
  metaPlano2026: z.string().trim().min(1, "Meta 2026 é obrigatória").max(50, "Meta deve ter no máximo 50 caracteres"),
  unidadeMedida: z.string().trim().min(1, "Unidade é obrigatória").max(50, "Unidade deve ter no máximo 50 caracteres"),
});

const acaoSchema = baseSchema.extend({
  descricao: z.string().trim().min(1, "Descrição é obrigatória").max(500, "Descrição deve ter no máximo 500 caracteres"),
});

interface FormData {
  id?: string;
  parentId?: string;
  numero: string;
  nome: string;
  descricao?: string;
  indicador?: string;
  metaPlano2026?: string;
  unidadeMedida?: string;
}

interface FormErrors {
  numero?: string;
  nome?: string;
  descricao?: string;
  indicador?: string;
  metaPlano2026?: string;
  unidadeMedida?: string;
}

const initialFormData: FormData = {
  numero: "",
  nome: "",
  descricao: "",
  indicador: "",
  metaPlano2026: "",
  unidadeMedida: "%",
};

export default function GerenciarPas() {
  const {
    eixos,
    loading,
    saving,
    createEixo,
    updateEixo,
    deleteEixo,
    createDiretriz,
    updateDiretriz,
    deleteDiretriz,
    createMeta,
    updateMeta,
    deleteMeta,
    createAcao,
    updateAcao,
    deleteAcao,
  } = usePasData();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJsonDialogOpen, setImportJsonDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importingJson, setImportingJson] = useState(false);
  const [jsonPreview, setJsonPreview] = useState<any[] | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [replaceOnImport, setReplaceOnImport] = useState(false);
  const [formType, setFormType] = useState<FormType>("eixo");
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<{ type: FormType; id: string; nome: string } | null>(null);

  const handleImport = async () => {
    setImporting(true);
    const result = await importarDadosParaBanco();
    setImporting(false);
    setImportDialogOpen(false);

    toast({
      title: result.success ? "Sucesso!" : "Erro",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      // Refresh data
      window.location.reload();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setJsonError('Por favor, selecione um arquivo JSON válido.');
      setJsonPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validar estrutura básica
        if (!Array.isArray(data)) {
          throw new Error('O arquivo deve conter um array de eixos.');
        }

        // Validar estrutura de cada eixo
        for (const eixo of data) {
          if (!eixo.numero || !eixo.nome) {
            throw new Error('Cada eixo deve ter "numero" e "nome".');
          }
          if (eixo.diretrizes && !Array.isArray(eixo.diretrizes)) {
            throw new Error('Diretrizes devem ser um array.');
          }
        }

        setJsonPreview(data);
        setJsonError(null);
        setImportJsonDialogOpen(true);
      } catch (error: any) {
        setJsonError(error.message || 'Erro ao processar o arquivo JSON.');
        setJsonPreview(null);
      }
    };
    reader.readAsText(file);

    // Limpar input para permitir reselecionar o mesmo arquivo
    event.target.value = '';
  };

  const clearAllData = async () => {
    // Deletar na ordem correta por causa das foreign keys
    await supabase.from('acoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('metas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('diretrizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('eixos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  };

  const handleImportJson = async () => {
    if (!jsonPreview) return;

    setImportingJson(true);

    try {
      // Se opção de substituir estiver ativa, limpar dados primeiro
      if (replaceOnImport) {
        await clearAllData();
      }

      for (const eixoData of jsonPreview) {
        // Verificar se o eixo já existe pelo número
        const { data: existingEixo } = await supabase
          .from('eixos')
          .select('id')
          .eq('numero', eixoData.numero)
          .maybeSingle();

        let eixoId: string;

        if (existingEixo) {
          // Atualizar eixo existente
          const { error: updateError } = await supabase
            .from('eixos')
            .update({ nome: eixoData.nome })
            .eq('id', existingEixo.id);

          if (updateError) throw updateError;
          eixoId = existingEixo.id;
        } else {
          // Criar novo eixo
          const { data: newEixo, error: eixoError } = await supabase
            .from('eixos')
            .insert({ numero: eixoData.numero, nome: eixoData.nome })
            .select()
            .single();

          if (eixoError) throw eixoError;
          eixoId = newEixo.id;
        }

        // Criar/atualizar diretrizes
        if (eixoData.diretrizes) {
          for (const diretrizData of eixoData.diretrizes) {
            // Verificar se diretriz já existe
            const { data: existingDiretriz } = await supabase
              .from('diretrizes')
              .select('id')
              .eq('eixo_id', eixoId)
              .eq('numero', diretrizData.numero)
              .maybeSingle();

            let diretrizId: string;

            if (existingDiretriz) {
              const { error: updateError } = await supabase
                .from('diretrizes')
                .update({ nome: diretrizData.nome })
                .eq('id', existingDiretriz.id);

              if (updateError) throw updateError;
              diretrizId = existingDiretriz.id;
            } else {
              const { data: newDiretriz, error: diretrizError } = await supabase
                .from('diretrizes')
                .insert({
                  eixo_id: eixoId,
                  numero: diretrizData.numero,
                  nome: diretrizData.nome
                })
                .select()
                .single();

              if (diretrizError) throw diretrizError;
              diretrizId = newDiretriz.id;
            }

            // Criar/atualizar metas
            if (diretrizData.metas) {
              for (const metaData of diretrizData.metas) {
                const { data: existingMeta } = await supabase
                  .from('metas')
                  .select('id')
                  .eq('diretriz_id', diretrizId)
                  .eq('numero', metaData.numero)
                  .maybeSingle();

                let metaId: string;

                if (existingMeta) {
                  const { error: updateError } = await supabase
                    .from('metas')
                    .update({
                      descricao: metaData.descricao,
                      indicador: metaData.indicador,
                      meta_plano_2025: metaData.metaPlano2025 || metaData.meta_plano_2025 || '0%',
                      unidade_medida: metaData.unidadeMedida || metaData.unidade_medida || '%',
                    })
                    .eq('id', existingMeta.id);

                  if (updateError) throw updateError;
                  metaId = existingMeta.id;
                } else {
                  const { data: newMeta, error: metaError } = await supabase
                    .from('metas')
                    .insert({
                      diretriz_id: diretrizId,
                      numero: metaData.numero,
                      descricao: metaData.descricao,
                      indicador: metaData.indicador,
                      meta_plano_2025: metaData.metaPlano2025 || metaData.meta_plano_2025 || '0%',
                      unidade_medida: metaData.unidadeMedida || metaData.unidade_medida || '%',
                    })
                    .select()
                    .single();

                  if (metaError) throw metaError;
                  metaId = newMeta.id;
                }

                // Criar/atualizar ações
                if (metaData.acoes) {
                  for (const acaoData of metaData.acoes) {
                    const { data: existingAcao } = await supabase
                      .from('acoes')
                      .select('id')
                      .eq('meta_id', metaId)
                      .eq('numero', acaoData.numero)
                      .maybeSingle();

                    if (existingAcao) {
                      const { error: updateError } = await supabase
                        .from('acoes')
                        .update({ descricao: acaoData.descricao })
                        .eq('id', existingAcao.id);

                      if (updateError) throw updateError;
                    } else {
                      const { error: acaoError } = await supabase
                        .from('acoes')
                        .insert({
                          meta_id: metaId,
                          numero: acaoData.numero,
                          descricao: acaoData.descricao,
                        });

                      if (acaoError) throw acaoError;
                    }
                  }
                }
              }
            }
          }
        }
      }

      toast({
        title: "Importação concluída!",
        description: `${jsonPreview.length} eixo(s) importado(s)/atualizado(s) com sucesso.`,
      });

      setImportJsonDialogOpen(false);
      setJsonPreview(null);
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao importar os dados.",
        variant: "destructive",
      });
    } finally {
      setImportingJson(false);
    }
  };

  const handleExport = () => {
    const exportData = eixos.map((eixo) => ({
      numero: eixo.numero,
      nome: eixo.nome,
      diretrizes: eixo.diretrizes.map((diretriz) => ({
        numero: diretriz.numero,
        nome: diretriz.nome,
        metas: diretriz.metas.map((meta) => ({
          numero: meta.numero,
          descricao: meta.descricao,
          indicador: meta.indicador,
          metaPlano2025: meta.meta_plano_2025,
          unidadeMedida: meta.unidade_medida,
          acoes: meta.acoes.map((acao) => ({
            numero: acao.numero,
            descricao: acao.descricao,
          })),
        })),
      })),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pas-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportado!",
      description: "Arquivo JSON baixado com sucesso.",
    });
  };

  const openCreateDialog = (type: FormType, parentId?: string) => {
    setFormType(type);
    setFormMode("create");
    setFormData({ ...initialFormData, parentId });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (type: FormType, data: any) => {
    setFormType(type);
    setFormMode("edit");
    setFormData({
      id: data.id,
      parentId: data.eixo_id || data.diretriz_id || data.meta_id,
      numero: String(data.numero),
      nome: data.nome || data.descricao || "",
      descricao: data.descricao || "",
      indicador: data.indicador || "",
      metaPlano2026: data.meta_plano_2025 || "",
      unidadeMedida: data.unidade_medida || "%",
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const openDeleteDialog = (type: FormType, id: string, nome: string) => {
    setDeleteTarget({ type, id, nome });
    setDeleteDialogOpen(true);
  };

  const validateForm = (): boolean => {
    setFormErrors({});
    let schema;

    switch (formType) {
      case "eixo":
        schema = eixoSchema;
        break;
      case "diretriz":
        schema = diretrizSchema;
        break;
      case "meta":
        schema = metaSchema;
        break;
      case "acao":
        schema = acaoSchema;
        break;
    }

    const result = schema.safeParse(formData);

    if (!result.success) {
      const errors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        errors[field] = err.message;
      });
      setFormErrors(errors);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const numero = parseInt(formData.numero);

    switch (formType) {
      case "eixo":
        if (formMode === "create") {
          await createEixo(numero, formData.nome);
        } else {
          await updateEixo(formData.id!, numero, formData.nome);
        }
        break;
      case "diretriz":
        if (formMode === "create") {
          await createDiretriz(formData.parentId!, numero, formData.nome);
        } else {
          await updateDiretriz(formData.id!, numero, formData.nome);
        }
        break;
      case "meta":
        if (formMode === "create") {
          await createMeta(
            formData.parentId!,
            numero,
            formData.descricao!,
            formData.indicador!,
            formData.metaPlano2026!,
            formData.unidadeMedida!
          );
        } else {
          await updateMeta(
            formData.id!,
            numero,
            formData.descricao!,
            formData.indicador!,
            formData.metaPlano2026!,
            formData.unidadeMedida!
          );
        }
        break;
      case "acao":
        if (formMode === "create") {
          await createAcao(formData.parentId!, numero, formData.descricao!);
        } else {
          await updateAcao(formData.id!, numero, formData.descricao!);
        }
        break;
    }

    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case "eixo":
        await deleteEixo(deleteTarget.id);
        break;
      case "diretriz":
        await deleteDiretriz(deleteTarget.id);
        break;
      case "meta":
        await deleteMeta(deleteTarget.id);
        break;
      case "acao":
        await deleteAcao(deleteTarget.id);
        break;
    }

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const getFormTitle = () => {
    const action = formMode === "create" ? "Novo" : "Editar";
    const labels = { eixo: "Eixo", diretriz: "Diretriz", meta: "Meta", acao: "Ação" };
    return `${action} ${labels[formType]}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar PAS</h1>
            <p className="text-muted-foreground mt-1">
              Administre eixos, diretrizes, metas e ações
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            {eixos.length === 0 && (
              <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="gap-2">
                <Upload className="w-4 h-4" />
                Importar Estáticos
              </Button>
            )}
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <FileJson className="w-4 h-4" />
              Importar JSON
            </Button>
            {eixos.length > 0 && (
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="w-4 h-4" />
                Exportar JSON
              </Button>
            )}
            <Button onClick={() => openCreateDialog("eixo")} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Eixo
            </Button>
          </div>
        </div>

        {eixos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum eixo cadastrado</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => openCreateDialog("eixo")}
              >
                Criar primeiro eixo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {eixos.map((eixo) => (
              <AccordionItem
                key={eixo.id}
                value={eixo.id}
                className="border rounded-lg bg-card px-4"
              >
                <div className="flex items-center w-full">
                  <AccordionTrigger className="hover:no-underline py-4 flex-1">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Eixo {eixo.numero}</Badge>
                          <span className="font-medium mr-2">{eixo.nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {eixo.diretrizes.length} diretrizes
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-1 mr-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog("eixo", eixo)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog("eixo", eixo.id, eixo.nome)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pb-4">
                  <div className="ml-14 space-y-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCreateDialog("diretriz", eixo.id)}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Nova Diretriz
                    </Button>

                    {eixo.diretrizes.map((diretriz) => (
                      <Card key={diretriz.id} className="border-l-4 border-l-primary/30">
                        <CardHeader className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FolderOpen className="w-4 h-4 text-muted-foreground" />
                              <CardTitle className="text-base">
                                <Badge variant="secondary" className="mr-2">
                                  D{diretriz.numero}
                                </Badge>
                                {diretriz.nome}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog("diretriz", diretriz)}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDeleteDialog("diretriz", diretriz.id, diretriz.nome)}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3 pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCreateDialog("meta", diretriz.id)}
                            className="gap-1 mb-2"
                          >
                            <Plus className="w-3 h-3" />
                            Nova Meta
                          </Button>

                          {diretriz.metas.map((meta) => (
                            <div
                              key={meta.id}
                              className="ml-4 p-3 border rounded-lg bg-muted/30 mb-2"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Target className="w-4 h-4 text-primary" />
                                    <Badge>Meta {meta.numero}</Badge>
                                    <span className="text-sm font-medium text-primary">
                                      {meta.meta_plano_2025}
                                    </span>
                                  </div>
                                  <p className="text-sm">{meta.descricao}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Indicador: {meta.indicador}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openEditDialog("meta", meta)}
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openDeleteDialog("meta", meta.id, meta.descricao)}
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-3 ml-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <ListChecks className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Ações ({meta.acoes.length})
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => openCreateDialog("acao", meta.id)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Adicionar
                                  </Button>
                                </div>
                                {meta.acoes.map((acao) => (
                                  <div
                                    key={acao.id}
                                    className="flex items-center justify-between py-1.5 px-2 bg-background rounded text-sm"
                                  >
                                    <span>
                                      <Badge variant="outline" className="mr-2 text-xs">
                                        A{acao.numero}
                                      </Badge>
                                      {acao.descricao}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => openEditDialog("acao", acao)}
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => openDeleteDialog("acao", acao.id, acao.descricao)}
                                      >
                                        <Trash2 className="w-3 h-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{getFormTitle()}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Número <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ex: 1"
                className={formErrors.numero ? "border-destructive" : ""}
              />
              {formErrors.numero && (
                <p className="text-sm text-destructive">{formErrors.numero}</p>
              )}
            </div>

            {(formType === "eixo" || formType === "diretriz") && (
              <div className="space-y-2">
                <Label>Nome <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder={`Nome do ${formType}`}
                  className={formErrors.nome ? "border-destructive" : ""}
                />
                {formErrors.nome && (
                  <p className="text-sm text-destructive">{formErrors.nome}</p>
                )}
              </div>
            )}

            {(formType === "meta" || formType === "acao") && (
              <div className="space-y-2">
                <Label>Descrição <span className="text-destructive">*</span></Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder={`Descrição da ${formType}`}
                  className={formErrors.descricao ? "border-destructive" : ""}
                />
                {formErrors.descricao && (
                  <p className="text-sm text-destructive">{formErrors.descricao}</p>
                )}
              </div>
            )}

            {formType === "meta" && (
              <>
                <div className="space-y-2">
                  <Label>Indicador <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.indicador}
                    onChange={(e) => setFormData({ ...formData, indicador: e.target.value })}
                    placeholder="Ex: Taxa de atendimento"
                    className={formErrors.indicador ? "border-destructive" : ""}
                  />
                  {formErrors.indicador && (
                    <p className="text-sm text-destructive">{formErrors.indicador}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta 2026 <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.metaPlano2026}
                      onChange={(e) => setFormData({ ...formData, metaPlano2026: e.target.value })}
                      placeholder="Ex: 90%"
                      className={formErrors.metaPlano2026 ? "border-destructive" : ""}
                    />
                    {formErrors.metaPlano2026 && (
                      <p className="text-sm text-destructive">{formErrors.metaPlano2026}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade <span className="text-destructive">*</span></Label>
                    <Input
                      value={formData.unidadeMedida}
                      onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                      placeholder="Ex: %"
                      className={formErrors.unidadeMedida ? "border-destructive" : ""}
                    />
                    {formErrors.unidadeMedida && (
                      <p className="text-sm text-destructive">{formErrors.unidadeMedida}</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {formMode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.nome}"?
              {deleteTarget?.type === "eixo" && " Isso excluirá todas as diretrizes, metas e ações vinculadas."}
              {deleteTarget?.type === "diretriz" && " Isso excluirá todas as metas e ações vinculadas."}
              {deleteTarget?.type === "meta" && " Isso excluirá todas as ações vinculadas."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar Dados do PAS</AlertDialogTitle>
            <AlertDialogDescription>
              Isso irá importar todos os eixos, diretrizes, metas e ações do arquivo de dados estático para o banco de dados.
              <br /><br />
              <strong>Esta ação só pode ser realizada uma vez.</strong> Após a importação, você poderá editar os dados diretamente no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Dados
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import JSON Dialog */}
      <Dialog open={importJsonDialogOpen} onOpenChange={setImportJsonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Importar JSON
            </DialogTitle>
            <DialogDescription>
              Revise os dados antes de importar
            </DialogDescription>
          </DialogHeader>

          {jsonError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{jsonError}</span>
            </div>
          )}

          {jsonPreview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">Arquivo válido!</span>
              </div>

              <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-muted/30">
                <p className="text-sm font-medium mb-2">Resumo da importação:</p>
                <ul className="space-y-2 text-sm">
                  {jsonPreview.map((eixo, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Layers className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Eixo {eixo.numero}:</span> {eixo.nome}
                        <p className="text-xs text-muted-foreground">
                          {eixo.diretrizes?.length || 0} diretriz(es), {' '}
                          {eixo.diretrizes?.reduce((acc: number, d: any) => acc + (d.metas?.length || 0), 0) || 0} meta(s)
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 border">
                <Checkbox
                  id="replaceOnImport"
                  checked={replaceOnImport}
                  onCheckedChange={(checked) => setReplaceOnImport(checked === true)}
                />
                <div className="flex-1">
                  <Label htmlFor="replaceOnImport" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Substituir todos os dados
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remove todos os eixos, diretrizes, metas e ações existentes antes de importar
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {replaceOnImport
                  ? "⚠️ Todos os dados existentes serão removidos e substituídos pelos novos."
                  : "ℹ️ Os dados serão mesclados. Registros existentes com mesmo número serão atualizados."
                }
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportJsonDialogOpen(false)} disabled={importingJson}>
              Cancelar
            </Button>
            <Button onClick={handleImportJson} disabled={importingJson || !jsonPreview}>
              {importingJson ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
