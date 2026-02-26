import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Acao } from "@/hooks/usePasData";

interface AcaoItemProps {
    acao: Acao;
    onEdit: (acao: Acao) => void;
    onDelete: (id: string, descricao: string) => void;
}

export function AcaoItem({ acao, onEdit, onDelete }: AcaoItemProps) {
    return (
        <div className="flex items-center justify-between py-1.5 px-2 bg-background rounded text-sm">
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
                    onClick={() => onEdit(acao)}
                >
                    <Pencil className="w-3 h-3" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onDelete(acao.id, acao.descricao)}
                >
                    <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
            </div>
        </div>
    );
}
