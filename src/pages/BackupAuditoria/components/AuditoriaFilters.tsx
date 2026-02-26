import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Search,
    Calendar,
    RefreshCw,
    FileText,
    FileSpreadsheet,
    Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AuditoriaFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterAcao: string;
    onFilterAcaoChange: (value: string) => void;
    filterQuadrimestre: string;
    onFilterQuadrimestreChange: (value: string) => void;
    dateFrom: Date | undefined;
    onDateFromChange: (date: Date | undefined) => void;
    dateTo: Date | undefined;
    onDateToChange: (date: Date | undefined) => void;
    onClearDates: () => void;
    onRefresh: () => void;
    onExportPDF: () => void;
    onExportCSV: () => void;
    onClearAuditoria: () => void;
    canExport: boolean;
    isSuperadmin: boolean;
}

export function AuditoriaFilters({
    searchTerm,
    onSearchChange,
    filterAcao,
    onFilterAcaoChange,
    filterQuadrimestre,
    onFilterQuadrimestreChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange,
    onClearDates,
    onRefresh,
    onExportPDF,
    onExportCSV,
    onClearAuditoria,
    canExport,
    isSuperadmin,
}: AuditoriaFiltersProps) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                    {/* First row: search and selects */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por meta ou usuário..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterAcao} onValueChange={onFilterAcaoChange}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Tipo de ação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas ações</SelectItem>
                                <SelectItem value="INSERT">Criação</SelectItem>
                                <SelectItem value="UPDATE">Alteração</SelectItem>
                                <SelectItem value="DELETE">Exclusão</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterQuadrimestre} onValueChange={onFilterQuadrimestreChange}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="Quadrimestre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="1">1º Quadrimestre</SelectItem>
                                <SelectItem value="2">2º Quadrimestre</SelectItem>
                                <SelectItem value="3">3º Quadrimestre</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Second row: date filters and actions */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex flex-col sm:flex-row gap-2 flex-1">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">De</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full sm:w-[160px] justify-start text-left font-normal",
                                                !dateFrom && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={dateFrom}
                                            onSelect={onDateFromChange}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Até</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full sm:w-[160px] justify-start text-left font-normal",
                                                !dateTo && "text-muted-foreground"
                                            )}
                                        >
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={dateTo}
                                            onSelect={onDateToChange}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {(dateFrom || dateTo) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClearDates}
                                    className="text-muted-foreground self-end h-10"
                                >
                                    Limpar datas
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {isSuperadmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="gap-2">
                                            <Trash2 className="w-4 h-4" />
                                            Limpar Auditoria
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente todo o histórico de alterações do sistema.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={onClearAuditoria} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Confirmar Exclusão
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            <Button variant="outline" onClick={onRefresh} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Atualizar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onExportPDF}
                                disabled={!canExport}
                                className="gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onExportCSV}
                                disabled={!canExport}
                                className="gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                CSV
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
