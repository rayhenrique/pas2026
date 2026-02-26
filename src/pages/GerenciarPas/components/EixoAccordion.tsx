import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Plus, Pencil, Trash2 } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Eixo, Diretriz, Meta, Acao } from "@/hooks/usePasData";
import { DiretrizCard } from "./DiretrizCard";

interface EixoAccordionProps {
    eixos: Eixo[];
    onEditEixo: (eixo: Eixo) => void;
    onDeleteEixo: (id: string, nome: string) => void;
    onCreateDiretriz: (eixoId: string) => void;
    onEditDiretriz: (diretriz: Diretriz) => void;
    onDeleteDiretriz: (id: string, nome: string) => void;
    onCreateMeta: (diretrizId: string) => void;
    onEditMeta: (meta: Meta) => void;
    onDeleteMeta: (id: string, descricao: string) => void;
    onCreateAcao: (metaId: string) => void;
    onEditAcao: (acao: Acao) => void;
    onDeleteAcao: (id: string, descricao: string) => void;
}

export function EixoAccordion({
    eixos,
    onEditEixo,
    onDeleteEixo,
    onCreateDiretriz,
    onEditDiretriz,
    onDeleteDiretriz,
    onCreateMeta,
    onEditMeta,
    onDeleteMeta,
    onCreateAcao,
    onEditAcao,
    onDeleteAcao,
}: EixoAccordionProps) {
    return (
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
                                onClick={() => onEditEixo(eixo)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteEixo(eixo.id, eixo.nome)}
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
                                onClick={() => onCreateDiretriz(eixo.id)}
                                className="gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                Nova Diretriz
                            </Button>

                            {eixo.diretrizes.map((diretriz) => (
                                <DiretrizCard
                                    key={diretriz.id}
                                    diretriz={diretriz}
                                    onEditDiretriz={onEditDiretriz}
                                    onDeleteDiretriz={onDeleteDiretriz}
                                    onCreateMeta={onCreateMeta}
                                    onEditMeta={onEditMeta}
                                    onDeleteMeta={onDeleteMeta}
                                    onCreateAcao={onCreateAcao}
                                    onEditAcao={onEditAcao}
                                    onDeleteAcao={onDeleteAcao}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
