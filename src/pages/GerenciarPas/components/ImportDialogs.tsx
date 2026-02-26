import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Upload,
    Loader2,
    FileJson,
    AlertCircle,
    CheckCircle2,
    Layers,
    RefreshCw,
} from "lucide-react";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

interface ImportStaticDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    importing: boolean;
    onConfirm: () => void;
}

export function ImportStaticDialog({
    open,
    onOpenChange,
    importing,
    onConfirm,
}: ImportStaticDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
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
                    <AlertDialogAction onClick={onConfirm} disabled={importing}>
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
    );
}

interface ImportJsonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jsonPreview: any[] | null;
    jsonError: string | null;
    replaceOnImport: boolean;
    onReplaceChange: (checked: boolean) => void;
    importingJson: boolean;
    onConfirm: () => void;
}

export function ImportJsonDialog({
    open,
    onOpenChange,
    jsonPreview,
    jsonError,
    replaceOnImport,
    onReplaceChange,
    importingJson,
    onConfirm,
}: ImportJsonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onCheckedChange={(checked) => onReplaceChange(checked === true)}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importingJson}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={importingJson || !jsonPreview}>
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
    );
}
