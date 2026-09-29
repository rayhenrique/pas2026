import { Lock, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ResponsavelScopeAlertProps {
  responsavel: string | null;
  missingAssignment?: boolean;
}

export function ResponsavelScopeAlert({
  responsavel,
  missingAssignment = false,
}: ResponsavelScopeAlertProps) {
  if (missingAssignment) {
    return (
      <Alert variant="destructive" className="mb-6">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Usuário sem setor responsável vinculado</AlertTitle>
        <AlertDescription>
          Seu perfil ainda não possui um setor responsável configurado. Solicite a um
          administrador que vincule o seu usuário a um responsável do PAS para liberar
          os lançamentos e relatórios do seu setor.
        </AlertDescription>
      </Alert>
    );
  }

  if (!responsavel) {
    return null;
  }

  return (
    <Alert className="mb-6">
      <Lock className="h-4 w-4" />
      <AlertTitle>Visualização restrita ao seu setor</AlertTitle>
      <AlertDescription>
        Este perfil está vinculado ao responsável <strong>{responsavel}</strong>. Por isso,
        os dados exibidos nesta tela já estão limitados automaticamente ao seu setor.
      </AlertDescription>
    </Alert>
  );
}
