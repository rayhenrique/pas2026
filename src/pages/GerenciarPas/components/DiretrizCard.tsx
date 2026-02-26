import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { Diretriz, Meta, Acao } from "@/hooks/usePasData";
import { MetaItem } from "./MetaItem";

interface DiretrizCardProps {
    diretriz: Diretriz;
    onEditDiretriz: (diretriz: Diretriz) => void;
    onDeleteDiretriz: (id: string, nome: string) => void;
    onCreateMeta: (diretrizId: string) => void;
    onEditMeta: (meta: Meta) => void;
    onDeleteMeta: (id: string, descricao: string) => void;
    onCreateAcao: (metaId: string) => void;
    onEditAcao: (acao: Acao) => void;
    onDeleteAcao: (id: string, descricao: string) => void;
}

export function DiretrizCard({
    diretriz,
    onEditDiretriz,
    onDeleteDiretriz,
    onCreateMeta,
    onEditMeta,
    onDeleteMeta,
    onCreateAcao,
    onEditAcao,
    onDeleteAcao,
}: DiretrizCardProps) {
    return (
        <Card className="border-l-4 border-l-primary/30">
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
                            onClick={() => onEditDiretriz(diretriz)}
                        >
                            <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDeleteDiretriz(diretriz.id, diretriz.nome)}
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
                    onClick={() => onCreateMeta(diretriz.id)}
                    className="gap-1 mb-2"
                >
                    <Plus className="w-3 h-3" />
                    Nova Meta
                </Button>

                {diretriz.metas.map((meta) => (
                    <MetaItem
                        key={meta.id}
                        meta={meta}
                        onEditMeta={onEditMeta}
                        onDeleteMeta={onDeleteMeta}
                        onCreateAcao={onCreateAcao}
                        onEditAcao={onEditAcao}
                        onDeleteAcao={onDeleteAcao}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
