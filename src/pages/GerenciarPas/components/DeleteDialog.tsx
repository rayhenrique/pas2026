import { Loader2 } from "lucide-react";
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
import { FormType } from "../types";

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleteTarget: { type: FormType; id: string; nome: string } | null;
    saving: boolean;
    onConfirm: () => void;
}

export function DeleteDialog({
    open,
    onOpenChange,
    deleteTarget,
    saving,
    onConfirm,
}: DeleteDialogProps) {
    const getWarningMessage = () => {
        if (!deleteTarget) return "";

        switch (deleteTarget.type) {
            case "eixo":
                return " Isso excluirá todas as diretrizes, metas e ações vinculadas.";
            case "diretriz":
                return " Isso excluirá todas as metas e ações vinculadas.";
            case "meta":
                return " Isso excluirá todas as ações vinculadas.";
            default:
                return "";
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir "{deleteTarget?.nome}"?
                        {getWarningMessage()}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
