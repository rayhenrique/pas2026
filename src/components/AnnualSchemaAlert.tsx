import { DatabaseZap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnnualSchemaAlertProps {
  message: string;
  migrationName: string;
  missingTargets: string[];
}

export function AnnualSchemaAlert({
  message,
  migrationName,
  missingTargets,
}: AnnualSchemaAlertProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <DatabaseZap className="h-4 w-4" />
      <AlertTitle>Schema anual do Supabase não aplicado</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        <p className="mt-2">
          Migration esperada: <code>{migrationName}</code>
        </p>
        {missingTargets.length > 0 && (
          <div className="mt-2">
            <p className="font-medium">Falhas detectadas:</p>
            {missingTargets.map((target) => (
              <p key={target} className="mt-1 break-words">
                - {target}
              </p>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
