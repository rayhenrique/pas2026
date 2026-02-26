import { History, Clock, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { HistoricoItem, acaoColors, acaoLabels } from "../types";

interface HistoricoTableProps {
    historico: HistoricoItem[];
    loading: boolean;
    getUserName: (userId: string) => string;
}

export function HistoricoTable({ historico, loading, getUserName }: HistoricoTableProps) {
    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Histórico de Alterações
                    </span>
                    <Badge variant="outline">
                        {historico.length} registro(s)
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {historico.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Nenhum registro encontrado</p>
                        <p className="text-sm text-muted-foreground/60">
                            O histórico será preenchido conforme alterações forem feitas
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data/Hora</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Período</TableHead>
                                    <TableHead>Valor Anterior</TableHead>
                                    <TableHead>Novo Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historico.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {format(new Date(item.alterado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-muted-foreground" />
                                                <span className="text-sm truncate max-w-[150px]">
                                                    {getUserName(item.alterado_por)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-xs", acaoColors[item.acao])}
                                            >
                                                {acaoLabels[item.acao] || item.acao}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {item.quadrimestre}º Quad/{item.ano}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {item.resultado_anterior !== null ? `${item.resultado_anterior}%` : "-"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium">
                                                {item.resultado_novo !== null ? `${item.resultado_novo}%` : "-"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
