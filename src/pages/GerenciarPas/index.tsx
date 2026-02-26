import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { usePasData, Eixo, Diretriz, Meta, Acao } from "@/hooks/usePasData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Plus,
    Loader2,
    Layers,
    Upload,
    Download,
    FileJson,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { importarDadosParaBanco } from "@/utils/importarDados";
import { supabase } from "@/integrations/supabase/client";

import {
    FormDialog,
    DeleteDialog,
    EixoAccordion,
    ImportStaticDialog,
    ImportJsonDialog,
} from "./components";
import {
    FormType,
    FormMode,
    FormData,
    FormErrors,
    initialFormData,
    getSchemaByType,
} from "./types";

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

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importJsonDialogOpen, setImportJsonDialogOpen] = useState(false);

    // Import states
    const [importing, setImporting] = useState(false);
    const [importingJson, setImportingJson] = useState(false);
    const [jsonPreview, setJsonPreview] = useState<any[] | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [replaceOnImport, setReplaceOnImport] = useState(false);

    // Form states
    const [formType, setFormType] = useState<FormType>("eixo");
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [deleteTarget, setDeleteTarget] = useState<{ type: FormType; id: string; nome: string } | null>(null);

    // Import handlers
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

                if (!Array.isArray(data)) {
                    throw new Error('O arquivo deve conter um array de eixos.');
                }

                for (const eixo of data) {
                    if (!eixo.numero || !eixo.nome) {
                        throw new Error('Cada eixo deve ter "numero" e "nome".');
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
        event.target.value = '';
    };

    const clearAllData = async () => {
        await supabase.from('acoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('metas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('diretrizes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('eixos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    };

    const handleImportJson = async () => {
        if (!jsonPreview) return;
        setImportingJson(true);

        try {
            if (replaceOnImport) {
                await clearAllData();
            }

            for (const eixoData of jsonPreview) {
                const { data: existingEixo } = await supabase
                    .from('eixos')
                    .select('id')
                    .eq('numero', eixoData.numero)
                    .maybeSingle();

                let eixoId: string;

                if (existingEixo) {
                    await supabase.from('eixos').update({ nome: eixoData.nome }).eq('id', existingEixo.id);
                    eixoId = existingEixo.id;
                } else {
                    const { data: newEixo, error } = await supabase
                        .from('eixos')
                        .insert({ numero: eixoData.numero, nome: eixoData.nome })
                        .select()
                        .single();
                    if (error) throw error;
                    eixoId = newEixo.id;
                }

                if (eixoData.diretrizes) {
                    for (const diretrizData of eixoData.diretrizes) {
                        const { data: existingDiretriz } = await supabase
                            .from('diretrizes')
                            .select('id')
                            .eq('eixo_id', eixoId)
                            .eq('numero', diretrizData.numero)
                            .maybeSingle();

                        let diretrizId: string;

                        if (existingDiretriz) {
                            await supabase.from('diretrizes').update({ nome: diretrizData.nome }).eq('id', existingDiretriz.id);
                            diretrizId = existingDiretriz.id;
                        } else {
                            const { data: newDiretriz, error } = await supabase
                                .from('diretrizes')
                                .insert({ eixo_id: eixoId, numero: diretrizData.numero, nome: diretrizData.nome })
                                .select()
                                .single();
                            if (error) throw error;
                            diretrizId = newDiretriz.id;
                        }

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
                                    await supabase.from('metas').update({
                                        descricao: metaData.descricao,
                                        indicador: metaData.indicador,
                                        meta_plano_2025: metaData.metaPlano2025 || metaData.meta_plano_2025 || '0%',
                                        unidade_medida: metaData.unidadeMedida || metaData.unidade_medida || '%',
                                    }).eq('id', existingMeta.id);
                                    metaId = existingMeta.id;
                                } else {
                                    const { data: newMeta, error } = await supabase
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
                                    if (error) throw error;
                                    metaId = newMeta.id;
                                }

                                if (metaData.acoes) {
                                    for (const acaoData of metaData.acoes) {
                                        const { data: existingAcao } = await supabase
                                            .from('acoes')
                                            .select('id')
                                            .eq('meta_id', metaId)
                                            .eq('numero', acaoData.numero)
                                            .maybeSingle();

                                        if (existingAcao) {
                                            await supabase.from('acoes').update({ descricao: acaoData.descricao }).eq('id', existingAcao.id);
                                        } else {
                                            await supabase.from('acoes').insert({ meta_id: metaId, numero: acaoData.numero, descricao: acaoData.descricao });
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

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pas-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({ title: "Exportado!", description: "Arquivo JSON baixado com sucesso." });
    };

    // Form handlers
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
        const schema = getSchemaByType(formType);
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
                formMode === "create"
                    ? await createEixo(numero, formData.nome)
                    : await updateEixo(formData.id!, numero, formData.nome);
                break;
            case "diretriz":
                formMode === "create"
                    ? await createDiretriz(formData.parentId!, numero, formData.nome)
                    : await updateDiretriz(formData.id!, numero, formData.nome);
                break;
            case "meta":
                formMode === "create"
                    ? await createMeta(formData.parentId!, numero, formData.descricao!, formData.indicador!, formData.metaPlano2026!, formData.unidadeMedida!)
                    : await updateMeta(formData.id!, numero, formData.descricao!, formData.indicador!, formData.metaPlano2026!, formData.unidadeMedida!);
                break;
            case "acao":
                formMode === "create"
                    ? await createAcao(formData.parentId!, numero, formData.descricao!)
                    : await updateAcao(formData.id!, numero, formData.descricao!);
                break;
        }

        setDialogOpen(false);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        switch (deleteTarget.type) {
            case "eixo": await deleteEixo(deleteTarget.id); break;
            case "diretriz": await deleteDiretriz(deleteTarget.id); break;
            case "meta": await deleteMeta(deleteTarget.id); break;
            case "acao": await deleteAcao(deleteTarget.id); break;
        }

        setDeleteDialogOpen(false);
        setDeleteTarget(null);
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
                            <Button variant="outline" className="mt-4" onClick={() => openCreateDialog("eixo")}>
                                Criar primeiro eixo
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <EixoAccordion
                        eixos={eixos}
                        onEditEixo={(eixo) => openEditDialog("eixo", eixo)}
                        onDeleteEixo={(id, nome) => openDeleteDialog("eixo", id, nome)}
                        onCreateDiretriz={(eixoId) => openCreateDialog("diretriz", eixoId)}
                        onEditDiretriz={(diretriz) => openEditDialog("diretriz", diretriz)}
                        onDeleteDiretriz={(id, nome) => openDeleteDialog("diretriz", id, nome)}
                        onCreateMeta={(diretrizId) => openCreateDialog("meta", diretrizId)}
                        onEditMeta={(meta) => openEditDialog("meta", meta)}
                        onDeleteMeta={(id, desc) => openDeleteDialog("meta", id, desc)}
                        onCreateAcao={(metaId) => openCreateDialog("acao", metaId)}
                        onEditAcao={(acao) => openEditDialog("acao", acao)}
                        onDeleteAcao={(id, desc) => openDeleteDialog("acao", id, desc)}
                    />
                )}
            </div>

            <FormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                formType={formType}
                formMode={formMode}
                formData={formData}
                formErrors={formErrors}
                saving={saving}
                onFormDataChange={setFormData}
                onSubmit={handleSubmit}
            />

            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                deleteTarget={deleteTarget}
                saving={saving}
                onConfirm={handleDelete}
            />

            <ImportStaticDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                importing={importing}
                onConfirm={handleImport}
            />

            <ImportJsonDialog
                open={importJsonDialogOpen}
                onOpenChange={setImportJsonDialogOpen}
                jsonPreview={jsonPreview}
                jsonError={jsonError}
                replaceOnImport={replaceOnImport}
                onReplaceChange={setReplaceOnImport}
                importingJson={importingJson}
                onConfirm={handleImportJson}
            />
        </Layout>
    );
}
