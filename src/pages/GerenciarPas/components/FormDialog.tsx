import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { FormType, FormMode, FormData, FormErrors, getFormTitle } from "../types";

interface FormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formType: FormType;
    formMode: FormMode;
    formData: FormData;
    formErrors: FormErrors;
    saving: boolean;
    onFormDataChange: (data: FormData) => void;
    onSubmit: () => void;
}

export function FormDialog({
    open,
    onOpenChange,
    formType,
    formMode,
    formData,
    formErrors,
    saving,
    onFormDataChange,
    onSubmit,
}: FormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{getFormTitle(formMode, formType)}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Número <span className="text-destructive">*</span></Label>
                        <Input
                            type="number"
                            value={formData.numero}
                            onChange={(e) => onFormDataChange({ ...formData, numero: e.target.value })}
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
                                onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
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
                                onChange={(e) => onFormDataChange({ ...formData, descricao: e.target.value })}
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
                                    onChange={(e) => onFormDataChange({ ...formData, indicador: e.target.value })}
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
                                        onChange={(e) => onFormDataChange({ ...formData, metaPlano2026: e.target.value })}
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
                                        onChange={(e) => onFormDataChange({ ...formData, unidadeMedida: e.target.value })}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {formMode === "create" ? "Criar" : "Salvar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
