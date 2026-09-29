import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCircle, Download, FileJson, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePasData } from "@/hooks/usePasData";
import { useResponsavelSectors } from "@/hooks/useResponsavelSectors";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { saveFileWithPicker } from "@/utils/fileExport";
import { importarDadosParaBanco } from "@/utils/importarDados";

type FormType = "diretriz" | "objetivo" | "meta" | "acao";

const jsonActionSchema = z.object({
  numero: z.number().int().positive(),
  descricao: z.string().trim().min(1),
});

const jsonMetaSchema = z.object({
  numero: z.number().int().positive(),
  descricao: z.string().trim().min(1),
  indicador: z.string().trim().min(1),
  criterios_avaliacao: z.string(),
  meta_2026: z.string().trim().min(1),
  meta_2027: z.string().trim().min(1),
  meta_2028: z.string().trim().min(1),
  meta_2029: z.string().trim().min(1),
  meta_plano_2026_2029: z.string().trim().min(1),
  meta_pas_2026: z.string().trim().min(1),
  unidade_medida: z.string().trim().min(1),
  responsavel: z.string().trim().min(1),
  acoes: z.array(jsonActionSchema).max(1_000).optional(),
});

const jsonObjectiveSchema = z.object({
  numero: z.number().int().positive(),
  nome: z.string().trim().min(1),
  descricao: z.string().trim().min(1),
  metas: z.array(jsonMetaSchema).max(1_000).optional(),
});

const jsonTreeSchema = z.array(z.object({
  numero: z.number().int().positive(),
  nome: z.string().trim().min(1),
  objetivos: z.array(jsonObjectiveSchema).max(1_000).optional(),
})).max(100);

type JsonTree = z.infer<typeof jsonTreeSchema>;

const schema = z.object({
  type: z.enum(["diretriz", "objetivo", "meta", "acao"]),
  id: z.string().optional(),
  parentId: z.string().optional(),
  numero: z.coerce.number().int().positive(),
  nome: z.string().optional(),
  descricao: z.string().optional(),
  indicador: z.string().optional(),
  criterios_avaliacao: z.string().optional(),
  meta_2026: z.string().optional(),
  meta_2027: z.string().optional(),
  meta_2028: z.string().optional(),
  meta_2029: z.string().optional(),
  meta_plano_2026_2029: z.string().optional(),
  meta_pas_2026: z.string().optional(),
  unidade_medida: z.string().optional(),
  responsavel: z.string().optional(),
}).superRefine((values, ctx) => {
  const required = (field: keyof typeof values, message: string) => {
    const value = values[field];
    if (typeof value !== "string" || value.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
    }
  };

  if (values.type === "diretriz") required("nome", "Informe o nome da diretriz.");
  if (values.type === "objetivo") {
    required("nome", "Informe o nome do objetivo.");
    required("descricao", "Informe a descrição do objetivo.");
  }
  if (values.type === "meta") {
    ["descricao", "indicador", "criterios_avaliacao", "meta_2026", "meta_2027", "meta_2028", "meta_2029", "meta_plano_2026_2029", "meta_pas_2026", "unidade_medida", "responsavel"]
      .forEach((field) => required(field as keyof typeof values, "Campo obrigatório."));
    if (
      values.criterios_avaliacao &&
      !/(Ótimo|Otimo)\s*:.*Bom\s*:.*Suficiente\s*:.*Regular\s*:/i.test(values.criterios_avaliacao)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["criterios_avaliacao"],
        message: "Use o padrão com Ótimo, Bom, Suficiente e Regular.",
      });
    }
  }
  if (values.type === "acao") required("descricao", "Informe a descrição da ação.");
});

type Values = z.infer<typeof schema>;

const defaults: Values = {
  type: "diretriz",
  numero: 1,
  nome: "",
  descricao: "",
  indicador: "",
  criterios_avaliacao: "",
  meta_2026: "",
  meta_2027: "",
  meta_2028: "",
  meta_2029: "",
  meta_plano_2026_2029: "",
  meta_pas_2026: "",
  unidade_medida: "",
  responsavel: "",
};

export default function GerenciarPas() {
  const {
    diretrizes,
    loading,
    saving,
    refresh,
    createDiretriz,
    updateDiretriz,
    deleteDiretriz,
    createObjetivo,
    updateObjetivo,
    deleteObjetivo,
    createMeta,
    updateMeta,
    deleteMeta,
    createAcao,
    updateAcao,
    deleteAcao,
  } = usePasData();
  const { sectors, loading: sectorsLoading } = useResponsavelSectors();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importSeedOpen, setImportSeedOpen] = useState(false);
  const [importJsonOpen, setImportJsonOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importingSeed, setImportingSeed] = useState(false);
  const [importingJson, setImportingJson] = useState(false);
  const [replaceOnImport, setReplaceOnImport] = useState(true);
  const [jsonPreview, setJsonPreview] = useState<JsonTree | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: FormType; id: string; label: string } | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });

  const totals = useMemo(() => {
    const objetivos = diretrizes.reduce((sum, d) => sum + d.objetivos.length, 0);
    const metas = diretrizes.reduce((sum, d) => sum + d.objetivos.reduce((acc, o) => acc + o.metas.length, 0), 0);
    const acoes = diretrizes.reduce((sum, d) => sum + d.objetivos.reduce((acc, o) => acc + o.metas.reduce((m, meta) => m + meta.acoes.length, 0), 0), 0);
    return { objetivos, metas, acoes };
  }, [diretrizes]);
  const responsavelOptions = useMemo(
    () => sectors.map((sector) => sector.nome),
    [sectors],
  );

  const openCreate = (type: FormType, parentId?: string) => {
    form.reset({ ...defaults, type, parentId, numero: 1 });
    setFormOpen(true);
  };

  const openEdit = (type: FormType, values: Partial<Values> & { id: string; numero: number }, parentId?: string) => {
    form.reset({ ...defaults, type, parentId, ...values });
    setFormOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setJsonPreview(null);
      setJsonError("O arquivo JSON deve ter no máximo 10 MB.");
      setImportJsonOpen(true);
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = jsonTreeSchema.parse(JSON.parse(String(reader.result)));
        setJsonPreview(parsed);
        setJsonError(null);
      } catch (error) {
        setJsonPreview(null);
        setJsonError(error instanceof Error ? error.message : "Falha ao interpretar o JSON.");
      }
      setImportJsonOpen(true);
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleSeedImport = async () => {
    setImportingSeed(true);
    try {
      const result = await importarDadosParaBanco();
      if (!result.success) throw new Error(result.message);
      await refresh();
      toast({ title: "Seed importado", description: result.message });
      setImportSeedOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao importar seed",
        description: error instanceof Error ? error.message : "Falha ao importar o seed oficial.",
        variant: "destructive",
      });
    } finally {
      setImportingSeed(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonPreview) return;
    setImportingJson(true);
    try {
      const { error } = await supabase.rpc("import_pas_tree", {
        tree_data: jsonPreview as unknown as Json,
        replace_existing: replaceOnImport,
      });
      if (error) throw error;
      await refresh();
      toast({ title: "JSON importado", description: `${jsonPreview.length} diretriz(es) processada(s).` });
      setImportJsonOpen(false);
      setJsonPreview(null);
      setJsonError(null);
    } catch (error) {
      toast({
        title: "Erro ao importar JSON",
        description: error instanceof Error ? error.message : "Falha ao importar a estrutura anual.",
        variant: "destructive",
      });
    } finally {
      setImportingJson(false);
    }
  };

  const handleExport = async () => {
    await saveFileWithPicker(
      JSON.stringify(diretrizes, null, 2),
      `pms-anual-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
      [".json"],
    );
    toast({ title: "JSON exportado", description: "A estrutura anual foi salva com sucesso." });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (values.type === "diretriz") {
        if (values.id) {
          await updateDiretriz(values.id, values.numero, values.nome!.trim());
        } else {
          await createDiretriz(values.numero, values.nome!.trim());
        }
      }
      if (values.type === "objetivo") {
        if (values.id) {
          await updateObjetivo(values.id, values.numero, values.nome!.trim(), values.descricao!.trim());
        } else {
          await createObjetivo(values.parentId!, values.numero, values.nome!.trim(), values.descricao!.trim());
        }
      }
      if (values.type === "meta") {
        const payload = {
          objetivo_id: values.parentId!,
          numero: values.numero,
          descricao: values.descricao!.trim(),
          indicador: values.indicador!.trim(),
          criterios_avaliacao: values.criterios_avaliacao!.trim(),
          meta_2026: values.meta_2026!.trim(),
          meta_2027: values.meta_2027!.trim(),
          meta_2028: values.meta_2028!.trim(),
          meta_2029: values.meta_2029!.trim(),
          meta_plano_2026_2029: values.meta_plano_2026_2029!.trim(),
          meta_pas_2026: values.meta_pas_2026!.trim(),
          unidade_medida: values.unidade_medida!.trim(),
          responsavel: values.responsavel!.trim(),
        };
        if (values.id) {
          await updateMeta({ id: values.id, ...payload });
        } else {
          await createMeta(payload);
        }
      }
      if (values.type === "acao") {
        if (values.id) {
          await updateAcao(values.id, values.numero, values.descricao!.trim());
        } else {
          await createAcao(values.parentId!, values.numero, values.descricao!.trim());
        }
      }
      setFormOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Falha ao salvar a estrutura.",
        variant: "destructive",
      });
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "diretriz") await deleteDiretriz(deleteTarget.id);
      if (deleteTarget.type === "objetivo") await deleteObjetivo(deleteTarget.id);
      if (deleteTarget.type === "meta") await deleteMeta(deleteTarget.id);
      if (deleteTarget.type === "acao") await deleteAcao(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Falha ao excluir o item.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar PAS</h1>
            <p className="mt-1 text-muted-foreground">Estruture o plano anual em Diretriz, Objetivo, Meta e Ação.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
            <Button variant="outline" onClick={() => setImportSeedOpen(true)} className="gap-2"><Upload className="h-4 w-4" />Importar seed</Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2"><FileJson className="h-4 w-4" />Importar JSON</Button>
            <Button variant="outline" onClick={handleExport} className="gap-2"><Download className="h-4 w-4" />Exportar JSON</Button>
            <Button onClick={() => openCreate("diretriz")} className="gap-2"><Plus className="h-4 w-4" />Nova diretriz</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Diretrizes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{diretrizes.length}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Objetivos</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.objetivos}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Metas</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.metas}</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Ações</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{totals.acoes}</p></CardContent></Card>
        </div>

        {diretrizes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhuma estrutura cadastrada. Importe o seed oficial ou crie a primeira diretriz.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {diretrizes.map((diretriz) => (
              <AccordionItem key={diretriz.id} value={diretriz.id} className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex items-start gap-3 px-5 py-4">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex w-full flex-col gap-3 text-left lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-primary">Diretriz {diretriz.numero}</p>
                        <h2 className="text-lg font-semibold">{diretriz.nome}</h2>
                      </div>
                      <Badge variant="secondary">{diretriz.objetivos.length} objetivo(s)</Badge>
                    </div>
                  </AccordionTrigger>
                  <div className="flex shrink-0 items-center gap-2 pt-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => openEdit("diretriz", { id: diretriz.id, numero: diretriz.numero, nome: diretriz.nome })}><Pencil className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setDeleteTarget({ type: "diretriz", id: diretriz.id, label: diretriz.nome }); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <AccordionContent className="border-t px-5 py-5">
                  <Button variant="outline" size="sm" className="mb-4 gap-2" onClick={() => openCreate("objetivo", diretriz.id)}><Plus className="h-4 w-4" />Novo objetivo</Button>
                  <div className="space-y-4">
                    {diretriz.objetivos.map((objetivo) => (
                      <Card key={objetivo.id} className="border-l-4 border-l-primary/30">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-sm font-medium text-primary">Objetivo {diretriz.numero}.{objetivo.numero}</p>
                              <CardTitle className="mt-1 text-base">{objetivo.nome}</CardTitle>
                              <p className="mt-2 text-sm text-muted-foreground">{objetivo.descricao}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit("objetivo", { id: objetivo.id, numero: objetivo.numero, nome: objetivo.nome, descricao: objetivo.descricao }, diretriz.id)}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setDeleteTarget({ type: "objetivo", id: objetivo.id, label: objetivo.nome }); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => openCreate("meta", objetivo.id)}><Plus className="h-4 w-4" />Nova meta</Button>
                          {objetivo.metas.map((meta) => (
                            <div key={meta.id} className="rounded-xl border bg-muted/20 p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge>Meta {meta.numero}</Badge>
                                    <Badge variant="secondary">{meta.responsavel}</Badge>
                                  </div>
                                  <p className="font-medium">{meta.descricao}</p>
                                  <p className="text-sm text-muted-foreground">Indicador: {meta.indicador}</p>
                                  <p className="text-sm text-muted-foreground">Metas anuais: {meta.meta_2026} / {meta.meta_2027} / {meta.meta_2028} / {meta.meta_2029}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEdit("meta", { id: meta.id, numero: meta.numero, descricao: meta.descricao, indicador: meta.indicador, criterios_avaliacao: meta.criterios_avaliacao, meta_2026: meta.meta_2026, meta_2027: meta.meta_2027, meta_2028: meta.meta_2028, meta_2029: meta.meta_2029, meta_plano_2026_2029: meta.meta_plano_2026_2029, meta_pas_2026: meta.meta_pas_2026, unidade_medida: meta.unidade_medida, responsavel: meta.responsavel }, objetivo.id)}><Pencil className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setDeleteTarget({ type: "meta", id: meta.id, label: meta.descricao }); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </div>
                              <div className="mt-4 rounded-xl border bg-background p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium">Ações ({meta.acoes.length})</span>
                                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => openCreate("acao", meta.id)}><Plus className="h-4 w-4" />Nova ação</Button>
                                </div>
                                <div className="space-y-2">
                                  {meta.acoes.map((acao) => (
                                    <div key={acao.id} className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3">
                                      <div><Badge variant="outline">{acao.numero}</Badge><p className="mt-2 text-sm">{acao.descricao}</p></div>
                                      <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit("acao", { id: acao.id, numero: acao.numero, descricao: acao.descricao }, meta.id)}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => { setDeleteTarget({ type: "acao", id: acao.id, label: acao.descricao }); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{form.watch("id") ? "Editar" : "Novo"} {form.watch("type")}</DialogTitle>
            <DialogDescription>Use o formulário tipado para manter o contrato anual consistente.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <Form {...form}>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="numero" render={({ field }) => (
                    <FormItem><FormLabel>Número</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  {(form.watch("type") === "diretriz" || form.watch("type") === "objetivo") && (
                    <FormField control={form.control} name="nome" render={({ field }) => (
                      <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                  )}
                </div>

                {form.watch("type") === "objetivo" && (
                  <FormField control={form.control} name="descricao" render={({ field }) => (
                    <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} value={field.value || ""} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
                  )} />
                )}

                {form.watch("type") === "meta" && (
                  <>
                    <FormField control={form.control} name="descricao" render={({ field }) => (
                      <FormItem><FormLabel>Descrição da meta</FormLabel><FormControl><Textarea {...field} value={field.value || ""} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="indicador" render={({ field }) => (
                        <FormItem><FormLabel>Indicador</FormLabel><FormControl><Textarea {...field} value={field.value || ""} className="min-h-[100px]" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="criterios_avaliacao" render={({ field }) => (
                        <FormItem><FormLabel>Critérios de avaliação</FormLabel><FormControl><Textarea {...field} value={field.value || ""} className="min-h-[100px]" /></FormControl><FormDescription>Formato obrigatório: Ótimo, Bom, Suficiente e Regular.</FormDescription><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                      {["meta_2026", "meta_2027", "meta_2028", "meta_2029", "meta_pas_2026"].map((name) => (
                        <FormField key={name} control={form.control} name={name as keyof Values} render={({ field }) => (
                          <FormItem><FormLabel>{name.replace(/_/g, " ")}</FormLabel><FormControl><Input {...field} value={String(field.value || "")} /></FormControl><FormMessage /></FormItem>
                        )} />
                      ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField control={form.control} name="meta_plano_2026_2029" render={({ field }) => (
                        <FormItem><FormLabel>Meta plano 2026-2029</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="unidade_medida" render={({ field }) => (
                        <FormItem><FormLabel>Unidade de medida</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="responsavel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor responsável</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange} disabled={sectorsLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o setor responsável" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {responsavelOptions.map((responsavel) => (
                                <SelectItem key={responsavel} value={responsavel}>
                                  {responsavel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Os setores disponíveis são gerenciados no módulo de setores responsáveis.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </>
                )}

                {form.watch("type") === "acao" && (
                  <FormField control={form.control} name="descricao" render={({ field }) => (
                    <FormItem><FormLabel>Descrição da ação</FormLabel><FormControl><Textarea {...field} value={field.value || ""} className="min-h-[120px]" /></FormControl><FormMessage /></FormItem>
                  )} />
                )}
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button onClick={onSubmit} disabled={saving} className="gap-2">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Deseja realmente excluir "{deleteTarget?.label}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={importSeedOpen} onOpenChange={setImportSeedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Importar seed oficial</AlertDialogTitle>
            <AlertDialogDescription>Isso vai carregar a estrutura anual baseada na MATRIZ DOMI PMS 2026-2029.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={importingSeed}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedImport} disabled={importingSeed}>{importingSeed && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Importar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={importJsonOpen} onOpenChange={setImportJsonOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar JSON anual</DialogTitle>
            <DialogDescription>O arquivo deve seguir o contrato Diretriz &gt; Objetivo &gt; Meta &gt; Ação.</DialogDescription>
          </DialogHeader>
          {jsonError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{jsonError}</span>
            </div>
          )}
          {jsonPreview && (
            <div className="space-y-4">
              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">{jsonPreview.length} diretriz(es) prontas para importação.</div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                <Checkbox id="replace-import" checked={replaceOnImport} onCheckedChange={(checked) => setReplaceOnImport(checked === true)} />
                <div>
                  <Label htmlFor="replace-import" className="font-medium">Substituir a estrutura atual</Label>
                  <p className="text-sm text-muted-foreground">Remove diretrizes, objetivos, metas e ações antes da nova carga.</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportJsonOpen(false)}>Cancelar</Button>
            <Button onClick={handleJsonImport} disabled={importingJson || !jsonPreview} className="gap-2">{importingJson && <Loader2 className="h-4 w-4 animate-spin" />}Importar JSON</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
