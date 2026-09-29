import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUserProfile } from "@/hooks/useCurrentUserProfile";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useCurrentUserProfile();

  if (loading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.ativo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="card-elevated max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Conta inativa</h1>
          <p className="mb-6 text-muted-foreground">
            Seu acesso foi desativado. Procure um administrador para reativar a conta.
          </p>
          <Button variant="outline" onClick={() => void signOut()}>
            Encerrar sessão
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
