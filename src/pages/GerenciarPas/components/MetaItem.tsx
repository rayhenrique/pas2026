import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, ListChecks, Plus, Pencil, Trash2 } from "lucide-react";
import { Meta, Acao } from "@/hooks/usePasData";
import { AcaoItem } from "./AcaoItem";

interface MetaItemProps {
    meta: Meta;
    onEditMeta: (meta: Meta) => void;
    onDeleteMeta: (id: string, descricao: string) => void;
    onCreateAcao: (metaId: string) => void;
    onEditAcao: (acao: Acao) => void;
    onDeleteAcao: (id: string, descricao: string) => void;
}

export function MetaItem({
    meta,
    onEditMeta,
    onDeleteMeta,
    onCreateAcao,
    onEditAcao,
    onDeleteAcao,
}: MetaItemProps) {
    return (
        <div className="ml-4 p-3 border rounded-lg bg-muted/30 mb-2">
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
                        onClick={() => onEditMeta(meta)}
                    >
                        <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDeleteMeta(meta.id, meta.descricao)}
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
                        onClick={() => onCreateAcao(meta.id)}
                    >
                        <Plus className="w-3 h-3 mr-1" />
                        Adicionar
                    </Button>
                </div>
                {meta.acoes.map((acao) => (
                    <AcaoItem
                        key={acao.id}
                        acao={acao}
                        onEdit={onEditAcao}
                        onDelete={onDeleteAcao}
                    />
                ))}
            </div>
        </div>
    );
}
