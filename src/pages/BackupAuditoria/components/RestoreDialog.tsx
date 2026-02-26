import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BackupPreview {
    version: string;
    created_at: string;
    stats?: {
        eixos: number;
        diretrizes: number;
        metas: number;
        acoes: number;
        lancamentos: number;
    };
}

interface RestoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    backupPreview: BackupPreview | null;
    replaceOnRestore: boolean;
    onReplaceChange: (checked: boolean) => void;
    importing: boolean;
    onConfirm: () => void;
}

export function RestoreDialog({
    open,
    onOpenChange,
    backupPreview,
    replaceOnRestore,
    onReplaceChange,
    importing,
    onConfirm,
}: RestoreDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onCheckedChange={(checked) => onReplaceChange(checked === true)}
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
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirm} disabled={importing}>
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
    );
}
