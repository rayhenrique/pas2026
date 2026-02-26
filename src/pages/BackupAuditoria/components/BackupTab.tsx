import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Loader2, FileJson, AlertCircle } from "lucide-react";

interface BackupTabProps {
    canRestore: boolean;
    exporting: boolean;
    onExportBackup: () => void;
    onFileSelect: () => void;
}

export function BackupTab({
    canRestore,
    exporting,
    onExportBackup,
    onFileSelect,
}: BackupTabProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Export Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-primary" />
                        Exportar Backup
                    </CardTitle>
                    <CardDescription>
                        Gere um arquivo JSON com todos os dados do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                        <p className="font-medium">O backup inclui:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>Eixos, Diretrizes, Metas e Ações</li>
                            <li>Lançamentos de todos os quadrimestres</li>
                            <li>Status das ações</li>
                            <li>Configurações do aplicativo</li>
                        </ul>
                    </div>
                    <Button
                        onClick={onExportBackup}
                        disabled={exporting}
                        className="w-full gap-2"
                    >
                        {exporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Exportar Backup Completo
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Import Card - Restricted to Admin/SuperAdmin */}
            {canRestore && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5 text-primary" />
                            Restaurar Backup
                        </CardTitle>
                        <CardDescription>
                            Importe um arquivo de backup para restaurar dados
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="font-medium">Atenção</span>
                            </div>
                            <p className="text-muted-foreground">
                                A restauração pode sobrescrever dados existentes. Faça um backup antes de prosseguir.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onFileSelect}
                            className="w-full gap-2"
                        >
                            <FileJson className="w-4 h-4" />
                            Selecionar Arquivo de Backup
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
